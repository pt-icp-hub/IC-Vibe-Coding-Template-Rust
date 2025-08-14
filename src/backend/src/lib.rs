pub mod auth;
pub mod types;

use crate::types::{AssetConfig, Pool, UserAccounts, STATE};
use candid::{CandidType, Deserialize, Nat, Principal};
use ic_cdk::api::{canister_self, msg_caller, time};
use ic_cdk::call::Call;
use ic_cdk::management_canister::http_request;
use ic_cdk::management_canister::{HttpHeader, HttpMethod, HttpRequestArgs};
use ic_cdk::{export_candid, init, query, update};
use icrc_ledger_types::icrc1::account::{Account, Subaccount};
use icrc_ledger_types::icrc1::transfer::{NumTokens, TransferError};
use icrc_ledger_types::icrc2::approve::ApproveArgs;
use icrc_ledger_types::icrc2::transfer_from::TransferFromArgs;
use serde::Serialize;
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::collections::HashSet;
use std::ops::{AddAssign, MulAssign, Sub, SubAssign};

/*---------------------Main Modules---------------------------*/

#[init] // 初始化池子的admin，先确定唯一作者
fn init() {
    let caller = msg_caller();
    assert!(
        caller != Principal::anonymous(),
        "Anonymous caller not allowed"
    );
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        state.admin = caller;
    });
    ic_cdk::println!("Lending Contract initialized by {:?}", caller);
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct PoolConfig {
    name: String,
    token_id: String,
    collateral: Vec<String>,
    maximum_token: u128,
}
#[update] // 创建新的池子
fn create_pool(pool_config: PoolConfig) -> Result<(), String> {
    let token = Principal::from_text(pool_config.token_id).unwrap();
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        assert_eq!(state.admin, msg_caller(), "Only admin can edit");
        assert!(
            state.assets.contains_key(&token),
            "No information about this asset"
        );
        assert!(!state.pool.contains_key(&token), "Already exists this pool");

        let mut collaterals = Vec::<AssetConfig>::new();
        for c in &pool_config.collateral {
            let cc = Principal::from_text(c).unwrap();
            let collateral = state.assets.get(&cc);
            if collateral.is_some() {
                collaterals.push(collateral.unwrap().clone());
            } else {
                return Err("No information about this collaterals".to_string());
            }
        }
        let pool = Pool {
            name: pool_config.name,
            token_id: token,
            pool_account: state.assets.get(&token).unwrap().clone(),
            collateral: collaterals,
            amount: NumTokens::default(),
            used_amount: NumTokens::default(),
            maximum_token: NumTokens::from(pool_config.maximum_token),
        };

        state.pool.insert(token, pool);
        Ok(())
    })
}

#[update] // Supply 用户可以存入借贷池，也可以作为抵押品
async fn supply(token_id: String, amount: NumTokens) -> Result<u64, String> {
    // 1. 检查输入NumTokens > 0
    assert!(amount.gt(&NumTokens::default()), "Supply must > 0");

    // 2. 检查存在对应token_id的池子
    let token = Principal::from_text(token_id).unwrap();
    let exist_pool = STATE.with(|s| s.borrow().pool.contains_key(&token));
    assert!(exist_pool, "Not existing pool");

    // 执行交易，用户转入至pool
    let from = Account {
        owner: msg_caller(),
        subaccount: None,
    };
    let to = STATE.with(|s| s.borrow().pool.get(&token).unwrap().clone());

    // 3. 检查（池子最大容量 - 当前池子容量）>= 输入NumTokens
    assert!(
        to.maximum_token.sub(to.amount).ge(&amount),
        "Pool Storage is Full"
    );

    // 4. 存入池子的账号(用户授权 + 转入池子)
    approve_token(from, to.pool_account.account, amount.clone())
        .await
        .expect("Approve Token failed.");
    let block_index = transfer_token(from, to.pool_account.account, amount.clone())
        .await
        .expect("Transfer Token failed.");
    ic_cdk::println!("block_index: {:?}", block_index);

    // 5. 记录用户的Supply数量和池子内代币的容量
    pool_state_supply(token, amount.clone()); // 更新pool状态
    ic_cdk::println!("Success creating a supply process");
    Ok(block_index)
}

#[update] // Borrow 用户从借贷池借钱，但必须提供借贷池要求的抵押品
async fn borrow(token_id: String, amount: NumTokens) -> Result<u64, String> {
    // 1. 检查输入NumTokens > 0
    assert!(amount.gt(&NumTokens::default()), "Borrow must > 0");

    // 2. 检查存在对应token_id的池子
    let token = Principal::from_text(token_id).unwrap();
    let exist_pool = STATE.with(|s| s.borrow().pool.contains_key(&token));
    assert!(exist_pool, "Not existing pool");

    // 3. 检查用户的collateral是否满足池子的要求
    let accept_collateral = check_user_collateral(token);
    assert!(
        !accept_collateral.is_empty(),
        "You don't have specified collateral for this pool"
    );

    // 4. 计算用户能够借出的最大金额
    let max_borrow = max_borrow_amount(msg_caller()).await;

    // 5. 检查用户输入NumTokens <= 当前用户能够借到的最大值
    let decimals = STATE
        .with(|s| s.borrow().assets.get(&token).unwrap().clone())
        .decimals;
    let borrow_f64 = numtokens_to_f64(&amount, decimals);
    let total_borrow_value = borrow_f64 * get_price(token).await; // 还要除小数点
    assert!(total_borrow_value <= max_borrow, "Don't borrow too more");

    // 6. 从池子借出
    // 执行交易， pool转出至用户
    let from = STATE.with(|s| s.borrow().pool.get(&token).unwrap().clone());
    let to = Account {
        owner: msg_caller(),
        subaccount: None,
    };
    let block_index = transfer_token(from.pool_account.account, to, amount.clone())
        .await
        .expect("Transfer Token failed.");
    ic_cdk::println!("block_index: {:?}", block_index);

    // 7. 更新用户的Borrow数量
    pool_state_borrow(token, amount); // 更新pool状态
    ic_cdk::println!("Success creating a borrow process");
    Ok(block_index)
}

#[update] // Repay 用户还款
async fn repay(token_id: String, amount: NumTokens) -> Result<u64, String> {
    // 1. 检查输入NumTokens > 0
    assert!(amount.gt(&NumTokens::default()), "Repay must > 0");

    // 2. 检查存在对应token id的池子
    let token = Principal::from_text(token_id).unwrap();
    let exist_pool = STATE.with(|s| s.borrow().pool.contains_key(&token));
    assert!(exist_pool, "Not existing pool");

    // 3. 用户需还钱的最大金额
    let current_user_borrow = STATE
        .with(|s| {
            s.borrow()
                .users
                .get(&msg_caller())
                .and_then(|u| u.borrows.get(&token.clone()).cloned())
        })
        .unwrap_or_default();

    // 4. 确保用户此前借的钱 > 0  + 用户最大的还款金额 <= 用户的借款金额
    assert!(
        current_user_borrow.gt(&NumTokens::default()),
        "No outstanding borrow"
    );
    assert!(
        amount.le(&current_user_borrow),
        "Repay amount exceeds borrowed amount"
    );

    // 5. 还钱回原本的池子
    // 执行交易， 用户转至pool
    let from = Account {
        owner: msg_caller(),
        subaccount: None,
    };
    let to = STATE.with(|s| s.borrow().pool.get(&token).unwrap().clone());
    let block_index = transfer_token(from, to.pool_account.account, amount.clone())
        .await
        .expect("Transfer Token failed.");
    ic_cdk::println!("block_index: {}", block_index);

    // 6. 更新用户的borrow数量
    pool_state_repay(token, amount);
    ic_cdk::println!("Success creating a repay process");
    Ok(block_index)
}

#[update] // Withdraw 提取此前supply的金额
async fn withdraw(token_id: String, amount: NumTokens) -> Result<u64, String> {
    // 1. 检查输入NumTokens > 0
    assert!(amount.eq(&NumTokens::default()), "Repay must > 0");

    // 2. 检查存在对应token id的池子
    let token = Principal::from_text(token_id).unwrap();
    let exist_pool = STATE.with(|s| s.borrow().pool.contains_key(&token));
    assert!(exist_pool, "Not existing pool");

    // 3. 检查用户是否真正在这池子存钱
    let user_account = STATE
        .with(|s| s.borrow().users.get(&msg_caller()).cloned())
        .unwrap();
    let supply_value = user_account.supplies.get(&token); // 当前token的supply值
    assert!(supply_value.is_some(), "Not existing supply token");

    // 3. 计算用户能提取的最大金额 （考虑borrow的资产）
    let assets = STATE.with(|s| s.borrow().assets.clone());

    // 假设所有的supply的抵押品都满足这个池子 ****************************************
    let mut total_collateral_value = 0.0;
    for (borrow, amount) in user_account.borrows {
        let collateral_factor = assets.get(&borrow).unwrap().collateral_factor;
        let decimals = STATE
            .with(|s| s.borrow().assets.get(&borrow).unwrap().clone())
            .decimals;
        let balance_u64 = numtokens_to_f64(&amount, decimals);
        total_collateral_value += balance_u64 * get_price(borrow).await / collateral_factor;
    }
    // 最大能提取金额
    let max_withdraw_value = numtokens_to_f64(supply_value.unwrap(), 8) - total_collateral_value;
    assert!(max_withdraw_value >= 0.0, "Insufficient collateral");

    let total_withdraw_value = numtokens_to_f64(&amount, 8);
    assert!(
        total_withdraw_value <= max_withdraw_value,
        "Exceeds maximum withdraw"
    );

    // 4. 检查输入NumTokens <= 能提取的最大金额
    let total_withdraw_value = numtokens_to_f64(&amount, 8);
    assert!(
        total_withdraw_value <= max_withdraw_value,
        "Exceeded the maximum amount that can be withdrawn"
    );

    // 5. 检查是否存在部分被借用了
    let (supply_percentage, unused_percentage, safety_vault_percentage) = STATE.with(|s| {
        let state = s.borrow();
        let pool = state.pool.get(&token).unwrap().clone();
        let amount = numtokens_to_f64(&pool.used_amount.clone(), 8);
        let used_amount = numtokens_to_f64(&pool.used_amount.clone(), 8);
        let supply_percentage = total_withdraw_value / amount;
        let unused_percentage = (amount - used_amount) / amount;
        let safety_vault_percentage = state.safety_vault_percentage;
        (
            supply_percentage,
            unused_percentage,
            safety_vault_percentage,
        )
    });
    // 不能提取金库（池子设置了保留10%作为预备金）
    assert!(
        unused_percentage > safety_vault_percentage,
        "Can't take for the safety vault"
    );
    assert!(
        supply_percentage <= unused_percentage - safety_vault_percentage,
        "Some was getting borrow"
    );

    // 6. 取出
    // 执行交易， 从pool转至用户
    let from = STATE.with(|s| s.borrow().pool.get(&token).unwrap().clone());
    let to = Account {
        owner: msg_caller(),
        subaccount: None,
    };
    let block_index = transfer_token(from.pool_account.account, to, amount.clone())
        .await
        .expect("Transfer Token failed.");
    ic_cdk::println!("block_index: {}", block_index);

    // 7. 更新用户的supply和池子状态
    pool_state_withdraw(token, amount);
    ic_cdk::println!("Success creating a repay process");
    Ok(block_index)
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct DepositAndSwapArgs {
    amount_in: String,
    zero_for_one: bool,
    amount_out_minimum: String,
    token_in_fee: Nat,
    token_out_fee: Nat,
}

#[update]
async fn liquidate1(
    user: Principal,
    repay_token: Principal,
    target_collateral: Principal,
    repay_amount: NumTokens,
) -> Result<u64, String> {
    // 1. 检查借款人存在
    let user_account = STATE.with(|s| {
        s.borrow()
            .users
            .get(&user)
            .ok_or("User not found")
            .unwrap()
            .clone()
    });
    assert!(
        user_account.borrows.contains_key(&repay_token),
        "Repay Token does not exist"
    );
    assert!(
        user_account
            .borrows
            .get(&repay_token)
            .unwrap()
            .gt(&NumTokens::default()),
        "Borrow Token is empty"
    );
    assert!(
        user_account.supplies.contains_key(&target_collateral),
        "Target collateral does not exist"
    );
    assert!(
        user_account
            .supplies
            .get(&target_collateral)
            .unwrap()
            .gt(&NumTokens::default()),
        "Supply Token is empty"
    );

    // 2. 计算健康因子
    let health_factor = cal_health_factor(user).await;
    assert!(health_factor < 1.0, "Cannot Liquidate");

    // 3. 确保清算人支付 <= 被清算人的债务
    let user_borrow_token = user_account.borrows.get(&repay_token).unwrap().clone();
    assert!(
        user_borrow_token.ge(&repay_amount),
        "borrow value must >= repay amount"
    );

    // 4. 计算清算人需支付多少金额才能获取全部指定的抵押品
    let (repay_decimals, target_decimals) = STATE.with(|s| {
        let state = s.borrow();
        let assets = state.assets.clone();
        (
            assets.get(&repay_token).unwrap().clone().decimals,
            assets.get(&target_collateral).unwrap().clone().decimals,
        )
    });
    let mut repay_amount =
        numtokens_to_f64(&repay_amount, repay_decimals) * get_price(repay_token).await; // 清算人支付金额
    let target = user_account
        .supplies
        .get(&target_collateral)
        .unwrap()
        .clone(); // 获取清算人想要的抵押品
    let target_collateral_value =
        numtokens_to_f64(&target, target_decimals) * get_price(target_collateral).await; // 计算其抵押品的当前价值
    let user_collateral_value = cal_collateral_value(user).await; // 被清算人的总抵押品价值
    let user_borrow_value =
        numtokens_to_f64(&user_borrow_token, repay_decimals) * get_price(repay_token).await; // 被清算人当前借贷价值
    let max_repay_amount = user_borrow_value * target_collateral_value / user_collateral_value; // 获得指定所有抵押品需支付的最大值
    if repay_amount > max_repay_amount {
        repay_amount = max_repay_amount
    }

    // 5. 计算清算人可以最多获得多少的被清算人抵押品
    let get_reward = STATE.with(|s| {
        let state = s.borrow();
        let collateral_factor = state
            .assets
            .get(&target_collateral)
            .unwrap()
            .collateral_factor;
        collateral_factor + state.liquidation_threshold + state.liquidate_earnings
    });
    let mut get_collateral_value = target_collateral_value * repay_amount / max_repay_amount; // 当前支付金额占多少比例的抵押品
    get_collateral_value *= get_reward;
    let get_collateral_numtokens = f64_to_numtokens(&get_collateral_value, target_decimals); // 最终清算人获取的抵押品代币数量

    // 6. 开启清算
    // 执行交易，用户转入至pool
    let from = Account {
        owner: msg_caller(),
        subaccount: None,
    };
    let to = STATE.with(|s| s.borrow().pool.get(&repay_token).unwrap().clone());
    let amount = f64_to_numtokens(&repay_amount, repay_decimals);
    let block_index = transfer_token(from, to.pool_account.account, amount.clone())
        .await
        .expect("Transfer Token failed.");
    ic_cdk::println!("block_index: {}", block_index);

    // 7. 更新user的supply和borrow
    pool_state_liquidate1(
        user,
        repay_token,
        amount,
        target_collateral,
        get_collateral_numtokens,
    );
    ic_cdk::println!("Success creating a repay process");
    Ok(block_index)
}

/*
#[update] // 自动清算
async fn liquidate2(user: Principal){

    // 1. 验证健康指数 如果小于1则可以清算
    let health_factor = cal_health_factor(user);
    assert!(health_factor < 1.0, "Cannot Liquidate");
}
*/

/*-------------------------Purpose Function-------------------*/
#[update] // 转账操作
async fn transfer_token(from: Account, to: Account, amount: NumTokens) -> Result<u64, String> {
    let arg = TransferFromArgs {
        spender_subaccount: from.subaccount,
        from,
        to,
        amount: amount.clone(),
        fee: None,
        memo: None,
        created_at_time: Some(time()),
    };
    let transfer_result = Call::bounded_wait(from.owner, "icrc2_transfer_from")
        .with_arg(arg)
        .await;
    match transfer_result {
        Ok(res) => match res.candid::<Result<u64, TransferError>>() {
            Ok(Ok(idx)) => Ok(idx),
            Ok(Err(te)) => Err(format!("Ledger error: {te:?}")),
            Err(e) => Err(format!("Response decoding failed: {e:?}")),
        },
        Err(e) => {
            ic_cdk::println!("Transfer failed: {:?}", e);
            Err(format!("Call failed: {e:?}"))
        }
    }
}

#[update]
async fn approve_token(from: Account, to: Account, amount: NumTokens) -> Result<u64, String> {
    let approve_args = ApproveArgs {
        from_subaccount: from.subaccount,
        spender: to,
        amount: amount.clone(),
        fee: None,
        expected_allowance: None,
        expires_at: Some(time() + (2 * 60_000_000_000)), //2分钟有效期
        memo: None,
        created_at_time: Some(time()),
    };
    let approve_result = Call::bounded_wait(from.owner, "icrc2_approve")
        .with_arg(approve_args)
        .await;
    match approve_result {
        Ok(res) => match res.candid::<Result<u64, TransferError>>() {
            Ok(Ok(idx)) => Ok(idx),
            Ok(Err(te)) => Err(format!("Ledger error(approve): {te:?}")),
            Err(e) => Err(format!("Response decoding failed(approve): {e:?}")),
        },
        Err(e) => {
            ic_cdk::println!("Approve failed: {:?}", e);
            Err(format!("Call failed(approve): {e:?}"))
        }
    }
}

/*
#[update] // 自动与icpswap互动 在清算时对池子代币进行swap，填补被清算人所借出的代币
async fn swap_with_icpswap(user: Principal, collateral_token: Principal){ // 清算被清算人指定的资产
    // 1. 当前池子的账户
    let from = STATE.with(|s|
        s.borrow().assets.get(&collateral_token).ok_or("Asset not exist")
            .unwrap().clone().account);
    STATE.with(async |s|{
        let mut state = s.borrow_mut();
        // 2. 获取被清算人的资产情况
        let assets = state.assets.clone();
        let user_account = state.users.get(&user).unwrap();
        let collateral_amount = user_account.supplies.get(&collateral_token).unwrap().clone();
        let decimals = assets.get(&collateral_token).unwrap().decimals;
        // 3. 清算阈值设定为0.8，但当发现清算时，将85%的代币拿去swap回被清算人借出的资产
        let total_swap_amount = collateral_amount.mul(NumTokens::from(85u32)).div(NumTokens::from(100u32)); // 只有85%可以被使用
        let total_borrow_value = cal_borrow_value(user); // 总借贷金额

        // 4. 执行交易 用当前85%的抵押品去swap回被清算人借的币
        for (token_id, amount) in user_account.borrows{
            // 4.1 计算需兑换多少金额
            let _decimals = STATE.with(|s|
                s.borrow().assets.get(&token_id).unwrap().clone()).decimals;
            let borrow_weight = numtokens_to_f64(&amount, _decimals) * get_price(token_id).await / total_borrow_value;
            let swap_amount = numtokens_to_f64(&total_swap_amount, decimals) * borrow_weight;
            let swap_collateral_amount = f64_to_numtokens(&swap_amount, decimals);

            // 4.2 icpswap的池子canister
            let token_pair = TokenPair{token1: collateral_token, token2: token_id};
            let pool_canister = ICPSWAP.with(|s|
                s.borrow().get(&token_pair).unwrap().clone());
            let to = Account{owner: pool_canister.swap_pool, subaccount: None};


            approve_token(from, to, swap_collateral_amount).await.expect("TODO: panic message");

        }
    });

}
*/

#[update] // 分配收益
fn distribute_earnings(token: Principal, amount: NumTokens) {
    let total_supply_user = cal_token_amount(token);
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        let decimals = state.assets.get(&token).unwrap().decimals;
        let total_reward = numtokens_to_f64(&amount, decimals) * cal_earning(token);
        for user in state.users.values_mut() {
            // 用户持有的存款
            let user_amount = user.supplies.get(&token).unwrap().clone();
            let user_amount_f64 = numtokens_to_f64(&user_amount, decimals);
            if user_amount_f64 <= 0.0 {
                continue;
            }

            // 计算用户应得的份额
            let share_f64 = total_reward * user_amount_f64 / total_supply_user;
            let share = f64_to_numtokens(&share_f64, decimals);
            user.supplies
                .entry(token)
                .and_modify(|e| *e = e.clone() + share.clone())
                .or_insert(share);
        }
    })
}

#[update] // 更新pool和user状态  supply
fn pool_state_supply(token: Principal, amount: NumTokens) {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        {
            let user_account = state.users.entry(msg_caller()).or_default();
            let supply_amount = user_account.supplies.entry(token).or_default();
            supply_amount.add_assign(amount.clone()); // user的supply增加
        }
        {
            let pool_account = state.pool.entry(token).or_default();
            pool_account.amount.add_assign(amount.clone()); // 提供给池子 加
        }
    });
}

#[update] // 更新pool和user状态  borrow
fn pool_state_borrow(token: Principal, amount: NumTokens) {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        {
            let user_account = state.users.entry(msg_caller()).or_default();
            let borrow_amount = user_account.borrows.entry(token).or_default();
            borrow_amount.add_assign(amount.clone()); // user的borrow增加
        }
        {
            let pool_account = state.pool.entry(token).or_default();
            pool_account.used_amount.add_assign(amount.clone()); // 池子token被使用了 加
        }
    });
}

#[update] // 更新pool和user状态  repay
fn pool_state_repay(token: Principal, amount: NumTokens) {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        {
            let user_account = state.users.entry(msg_caller()).or_default();
            let borrow_amount = user_account.borrows.entry(token).or_default();
            borrow_amount.sub_assign(amount.clone()); // 用户的borrow减少
        }
        {
            let user_account = state.users.entry(msg_caller()).or_default();
            let interest_amount = user_account.interest.entry(token).or_default();
            if amount.ge(interest_amount) {
                distribute_earnings(token, interest_amount.clone()); // 分配利润
                interest_amount.mul_assign(NumTokens::default());
            } else {
                distribute_earnings(token, amount.clone()); // 分配利润
                interest_amount.sub_assign(amount.clone());
            }
        }
        {
            let pool_account = state.pool.entry(token).or_default();
            pool_account.used_amount.sub_assign(amount.clone()); // 池子token被归还了 减
        }
    });
}

#[update] // 更新pool和user状态 withdraw
fn pool_state_withdraw(token: Principal, amount: NumTokens) {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        {
            let user_account = state.users.entry(msg_caller()).or_default();
            let supply_amount = user_account.supplies.entry(token).or_default();
            supply_amount.sub_assign(amount.clone()); // user的supply减少
        }
        {
            let pool_account = state.pool.entry(token).or_default();
            pool_account.amount.sub_assign(amount.clone()); // 从池子提出 减
        }
    })
}

#[update] // 更新pool和user状态 liquidate1
fn pool_state_liquidate1(
    user: Principal,
    repay_token: Principal,
    repay_amount: NumTokens,
    target_token: Principal,
    target_amount: NumTokens,
) {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        // user 被清算人账户
        {
            let user_account = state.users.entry(user).or_default();
            let user_supply_amount = user_account.supplies.entry(target_token).or_default();
            user_supply_amount.sub_assign(target_amount.clone()); // 用户的supply减少
        }
        {
            let user_account = state.users.entry(user).or_default();
            let user_borrow_amount = user_account.borrows.entry(repay_token).or_default();
            user_borrow_amount.sub_assign(repay_amount.clone()); // 用户的borrow减少
        }
        {
            let user_account = state.users.entry(user).or_default();
            let user_interest_amount = user_account.interest.entry(repay_token).or_default();
            // 分配利息给repay池子提供流动性的用户
            if repay_amount.ge(user_interest_amount) {
                distribute_earnings(repay_token, user_interest_amount.clone()); // 分配利润
                user_interest_amount.mul_assign(NumTokens::default());
            } else {
                distribute_earnings(repay_token, repay_amount.clone()); // 分配利润
                user_interest_amount.sub_assign(repay_amount.clone());
            }
        }
        {
            // 借款池子
            let repay_pool = state.pool.entry(repay_token).or_default();
            // 清算人的账户变化
            repay_pool.used_amount.sub_assign(repay_amount.clone()); // 池子token被归还了 减
        }
        {
            // liquidate 清算人账户
            let liquidate_account = state.users.entry(msg_caller()).or_default();
            let liquidate_supply_amount =
                liquidate_account.supplies.entry(target_token).or_default();
            // 被清算人的账户变化
            liquidate_supply_amount.add_assign(target_amount.clone()); // 清算人的抵押品增加
        }
    });
}

#[update] // 在用户要借款前，检查是否满足对应的抵押品，并输出抵押品
fn check_user_collateral(token: Principal) -> Vec<Principal> {
    STATE.with(|s| {
        let state = s.borrow();
        // 获取用户所有的抵押品Principal
        let user_set = state.users.get(&msg_caller()).cloned().unwrap();
        // 排除掉小于0的抵押品
        let user_collateral = user_set
            .supplies
            .iter()
            .filter(|&(_, s)| s.gt(&NumTokens::default()))
            .map(|(who, _)| *who)
            .collect::<HashSet<Principal>>();

        // 找出和池子要求的抵押品，并且要与用户所拥有的抵押品相同
        let pool = state.pool.get(&token).expect("pool not exist").clone();
        let collateral = pool
            .collateral
            .clone()
            .iter()
            .map(|s| s.token_id)
            .filter(|a| user_collateral.contains(a))
            .collect::<Vec<Principal>>();

        collateral
    })
}

#[update] // 从Pyth预言机 获取指定代币的价格
async fn get_price(token: Principal) -> f64 {
    let price_id = STATE.with(|s| {
        s.borrow()
            .assets
            .get(&token)
            .ok_or("Not Support this token")
            .unwrap()
            .price_id
            .clone()
    });
    let url = format!("https://hermes.pyth.network/api/latest_price_feeds?ids[]={price_id}");
    let request_headers = vec![HttpHeader {
        name: "User-Agent".to_string(),
        value: "pyth_canister".to_string(),
    }];
    let request = HttpRequestArgs {
        url: url.clone(),
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: None,
        transform: None,
        headers: request_headers,
    };
    let response = http_request(&request)
        .await
        .expect("HTTP request failed (Pyth Hermes)");
    let json: Value = serde_json::from_slice(&response.body).expect("JSON decode error");
    let feeds = json.as_array().expect("Expected JSON array");
    ic_cdk::println!("feeds: {:?}", feeds[0]);
    let feed = &feeds[0];
    let price_obj = &feed["price"];
    ic_cdk::println!("feed: {:?}", price_obj);
    let price_raw = price_obj["price"]
        .as_str()
        .unwrap()
        .parse::<f64>()
        .expect("Expected price");
    let expo = price_obj["expo"].as_i64().expect("Expected expo");

    price_raw * 10f64.powi(expo as i32)
}

#[update] // 随机生成一个subaccount
fn generate_random_subaccount() -> Subaccount {
    let caller = msg_caller().to_text();
    let now = time();
    // 使用 IC 原生的时间戳作为随机种子
    let rnd = now % 1000000; // 取时间戳的后6位作为随机数

    let mut hash = Sha256::new();
    Digest::update(&mut hash, caller.as_bytes());
    Digest::update(&mut hash, now.to_be_bytes());
    Digest::update(&mut hash, rnd.to_be_bytes());

    let result = hash.finalize();
    let mut subaccount = Subaccount::default();
    subaccount.copy_from_slice(&result[..32]);
    subaccount
}

/* ------------------------Edit Function--------------------- */
#[update] // 修改合约的清算阈值
fn edit_contract_liquidation(liquidation: f64) {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        assert_eq!(state.admin, msg_caller(), "Only admin can edit");
        state.liquidation_threshold = liquidation;
    })
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct AssetParameter {
    name: String,
    token_id: String,
    price_id: String,
    decimals: u32,
    collaterals: Option<f64>,
    interest_rate: Option<f64>,
}

#[update] // 添加合约的资产
fn update_contract_assets(config: AssetParameter) {
    let token = Principal::from_text(config.token_id).unwrap();
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        assert_eq!(state.admin, msg_caller(), "Only admin can edit");
        assert!(
            !state.assets.contains_key(&token),
            "Already exists this assets"
        );

        let asset_config = AssetConfig {
            name: config.name,
            token_id: token,
            account: Account {
                owner: canister_self(),
                subaccount: None,
            },
            price_id: config.price_id,
            asset_type: crate::types::AssetTypes::ICP, // 默认使用 ICP 类型
            decimals: config.decimals,
            collateral_factor: config.collaterals.unwrap_or(0.0),
            interest_rate: config.interest_rate.unwrap_or(0.0),
        };
        state.assets.insert(token, asset_config);
    })
}

#[update] // 修改assets的参数（只有name + 后面两个参数可以修改）
fn edit_contract_assets(
    token_id: String,
    name: Option<String>,
    collaterals_factor: Option<f64>,
    interest_rate: Option<f64>,
) {
    let token = Principal::from_text(token_id).unwrap();
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        assert_eq!(state.admin, msg_caller(), "Only admin can edit");
        assert!(state.assets.contains_key(&token), "Not exists this assets");
        let asset_config = state.assets.entry(token).or_default();
        asset_config.name = name.unwrap_or(asset_config.name.clone());
        asset_config.collateral_factor =
            collaterals_factor.unwrap_or(asset_config.collateral_factor);
        asset_config.interest_rate = interest_rate.unwrap_or(asset_config.interest_rate);
    })
}

#[update] // 增加 该池子要求的抵押资产
fn update_pool_collateral(token_id: String, collateral_id: String) {
    let token = Principal::from_text(token_id).unwrap();
    let collateral = Principal::from_text(collateral_id).unwrap();
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        assert_eq!(state.admin, msg_caller(), "Only admin can edit");
        assert!(state.assets.contains_key(&token), "Not exists this assets");
        assert!(state.pool.contains_key(&token), "Not exists this pool");

        let asset_config = state.assets.get(&collateral.clone()).unwrap().clone();
        let pool_collateral = state.pool.entry(token).or_default();
        let exist_collateral = pool_collateral
            .collateral
            .iter()
            .any(|a| a.token_id == collateral);
        assert!(!exist_collateral, "Already have this collateral");
        pool_collateral.collateral.push(asset_config);
    })
}

#[update] // 删除 该池子要求的抵押资产
fn remove_pool_collateral(token_id: String, collateral_id: String) {
    let token = Principal::from_text(token_id).unwrap();
    let collateral = Principal::from_text(collateral_id).unwrap();

    STATE.with(|s| {
        let mut state = s.borrow_mut();
        assert_eq!(state.admin, msg_caller(), "Only admin can edit");
        assert!(state.assets.contains_key(&token), "Not exists this assets");
        assert!(state.pool.contains_key(&token), "Not exists this pool");

        let pool_collateral = state.pool.entry(token).or_default();
        let exist_collateral = pool_collateral
            .collateral
            .iter()
            .any(|a| a.token_id == collateral);
        assert!(exist_collateral, "This collateral does not in the pool");
        pool_collateral
            .collateral
            .retain(|a| a.token_id != collateral)
    })
}

#[update] // 增加池子的容量
fn increase_maximum_token(token_id: String, maximum_token: NumTokens) {
    let token = Principal::from_text(token_id).unwrap();
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        assert_eq!(state.admin, msg_caller(), "Only admin can edit");
        assert!(state.pool.contains_key(&token), "Not exists this pool");
        let pool = state.pool.entry(token).or_default();
        let result = pool.maximum_token.lt(&maximum_token);
        assert!(result, "Must be greater than the current maximum token");
        pool.maximum_token = maximum_token;
    })
}

#[update] // 减少池子的容量
fn decrease_maximum_token(token_id: String, maximum_token: NumTokens) {
    let token = Principal::from_text(token_id).unwrap();
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        assert_eq!(state.admin, msg_caller(), "Only admin can edit");
        assert!(state.pool.contains_key(&token), "Not exists this pool");
        let pool = state.pool.entry(token).or_default();
        let result = pool.amount.lt(&maximum_token);
        assert!(result, "Must be less than the current token's amount");
        pool.maximum_token = maximum_token;
    })
}

#[update] // 结算利息（每天一次）
fn update_interest_amount() {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        assert_eq!(state.admin, msg_caller(), "Only admin can submit");
        let past_a_day = time().saturating_sub(state.last_time);
        assert!(past_a_day >= 86_400_000_000_000, "{past_a_day:}");

        let assets = state.assets.clone();

        // 检查所有用户，并对每个借款人进行结算
        for user_account in state.users.values_mut() {
            for (token_id, amount) in user_account.borrows.iter_mut() {
                let decimals = assets.get(token_id).unwrap().decimals;
                let current_interest = cal_interest(*token_id); // 当前利率
                let mut interest_amount = numtokens_to_f64(amount, decimals);
                interest_amount *= current_interest / 365.0; // 一天结算
                amount.add_assign(f64_to_numtokens(&interest_amount, decimals));
            }
        }
        state.last_time = time();
    })
}

/*-------------------------Calculate Function------------------------*/
#[query] // 计算利率（先固定利率）
fn cal_interest(token: Principal) -> f64 {
    let slope1 = 0.02;
    let slope2 = 0.4;
    let utilisation_optimal_rate = 0.7;
    STATE.with(|s| {
        let state = s.borrow();
        let pool = state.pool.get(&token).ok_or("Error token").unwrap().clone();
        let base_rate = state.assets.get(&token).unwrap().interest_rate; // 固定利率
        let decimals = state.assets.get(&token).unwrap().decimals;
        let used_amount = numtokens_to_f64(&pool.amount, decimals);
        let amount = numtokens_to_f64(&pool.used_amount, decimals);
        let u = safe_div(used_amount, amount); // 利用率利率
        if u <= 0.7 {
            base_rate + (u / utilisation_optimal_rate) * slope1
        } else {
            base_rate
                + slope1
                + ((u / utilisation_optimal_rate) / (1.0 - utilisation_optimal_rate)) * slope2
        }
    })
}

fn safe_div(a: f64, b: f64) -> f64 {
    if b == 0.0 {
        0.0
    } else {
        a / b
    }
}

#[query] // 计算收益率
fn cal_earning(token: Principal) -> f64 {
    STATE.with(|s| {
        let state = s.borrow();
        let interest_rate = state
            .assets
            .get(&token)
            .ok_or("Error token")
            .unwrap()
            .interest_rate;
        interest_rate
    })
}

#[query] // 计算抵押资产金额（供应金额）
async fn cal_collateral_value(user: Principal) -> f64 {
    let state = STATE.with(|s| s.borrow().clone());
    let user_account = state.users.get(&user).ok_or("Error user account").unwrap();
    let mut collateral_value = 0.0;
    for (_token_id, _amount) in user_account.supplies.iter() {
        let decimals = STATE
            .with(|s| s.borrow().assets.get(_token_id).unwrap().clone())
            .decimals;
        let amount = numtokens_to_f64(_amount, decimals);
        collateral_value += amount * get_price(*_token_id).await;
    }
    collateral_value
}

#[query] // 计算借款资产金额
async fn cal_borrow_value(user: Principal) -> f64 {
    let state = STATE.with(|s| s.borrow().clone());
    let user_account = state.users.get(&user).ok_or("Error user account").unwrap();
    let mut borrow_value = 0.0;
    for (_token_id, _amount) in user_account.borrows.iter() {
        let decimals = STATE
            .with(|s| s.borrow().assets.get(_token_id).unwrap().clone())
            .decimals;
        let amount = numtokens_to_f64(_amount, decimals);
        borrow_value += amount * get_price(*_token_id).await;
    }
    borrow_value
}

#[query] // 计算每个抵押资产 * 抵押系数
async fn cal_collateral_with_factor(user: Principal) -> f64 {
    let state = STATE.with(|s| s.borrow().clone());
    let liquidation_threshold = state.liquidation_threshold;
    let assets = state.assets.clone();
    let user_account = state.users.get(&user).ok_or("Error user account").unwrap();
    let mut collateral_value = 0.0;
    for (_token_id, _amount) in user_account.supplies.iter() {
        let collateral_factor = assets.get(_token_id).unwrap().collateral_factor;
        let decimals = assets.get(_token_id).unwrap().clone().decimals;
        let amount = numtokens_to_f64(_amount, decimals);
        collateral_value +=
            amount * get_price(*_token_id).await * (collateral_factor + liquidation_threshold);
    }
    collateral_value
}

#[query] // 计算健康因子=(c * l)/b
async fn cal_health_factor(user: Principal) -> f64 {
    let liquidation_factor = get_liquidation_threshold();
    let collateral_value = cal_collateral_with_factor(user).await;
    let borrow_value = cal_borrow_value(user).await;
    (collateral_value * liquidation_factor) / borrow_value
}

#[query] // 计算可借的最大金额
async fn max_borrow_amount(user: Principal) -> f64 {
    let liquidation_factor = get_liquidation_threshold();
    let collateral_value = cal_collateral_value(user).await;
    let borrow_value = cal_borrow_value(user).await;
    ((collateral_value * liquidation_factor) - borrow_value) * 0.98 // 不让用户一购买就触发清算
}

#[query] // 计算指定token所有用户存入的代币
fn cal_token_amount(token: Principal) -> f64 {
    STATE.with(|s| {
        let state = s.borrow();
        let decimals = state.assets.get(&token).unwrap().decimals;
        let total_supplies = state
            .users
            .values()
            .map(|x| {
                let amount = x.supplies.get(&token).cloned().unwrap_or_default();
                numtokens_to_f64(&amount, decimals)
            })
            .sum::<f64>();
        total_supplies
    })
}

/*-----------------------Query Function---------------------------*/
#[query] // 查询清算最大区间
fn get_liquidation_threshold() -> f64 {
    STATE.with(|s| s.borrow().liquidation_threshold)
}

#[query] // 获取代币小数位数
fn get_token_decimals(token: Principal) -> u32 {
    STATE.with(|s| {
        let state = s.borrow();
        state.assets.get(&token).unwrap().decimals
    })
}

#[query] // 池子的真实deposit值
fn get_real_pool_amount(token: String) -> f64 {
    let token_id = Principal::from_text(token).unwrap();
    cal_token_amount(token_id)
}

#[query] // 池子存款的APY
fn get_pool_supply_apy(token: String) -> f64 {
    let token_id = Principal::from_text(token).unwrap();
    let apy = cal_interest(token_id);
    apy * 100.0 // 转换成 %
}

#[query] // 池子借款的APY
fn get_pool_borrow_apy(token: String) -> f64 {
    let token_id = Principal::from_text(token).unwrap();
    let apy = cal_interest(token_id);
    apy * 100.0 // 转换成 %
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct PoolInfo {
    name: String,                 // 池子名
    collateral_factor: f64,       // 抵押系数
    collateral: Vec<AssetConfig>, // 池子接受的抵押品
    amount: f64,                  // 当前池子的代币
    used_amount: f64,             // 当前池子被借出的代币
    maximum_amount: f64,          // 池子的最大容量
    supply_apy: f64,              // 当前池子的supply apy
    borrow_apy: f64,              // 当前池子的borrow apy
}
#[query] // 查询池子情况
fn get_pool_info(token: String) -> PoolInfo {
    let token_id = Principal::from_text(token.clone()).unwrap();
    let pool = STATE.with(|s| s.borrow().pool.get(&token_id).unwrap().clone());
    let asset = STATE.with(|s| s.borrow().assets.get(&token_id).unwrap().clone());
    let decimals = get_token_decimals(token_id);
    PoolInfo {
        name: pool.name,
        collateral_factor: asset.collateral_factor,
        collateral: pool.collateral,
        amount: numtokens_to_f64(&pool.amount, decimals),
        used_amount: numtokens_to_f64(&pool.used_amount, decimals),
        maximum_amount: numtokens_to_f64(&pool.maximum_token, decimals),
        supply_apy: get_pool_supply_apy(token.clone()),
        borrow_apy: get_pool_borrow_apy(token.clone()),
    }
}

#[derive(CandidType, Deserialize, Serialize)]
struct UserInfo {
    principal: Principal,
    username: String,
    ckbtc_balance: f64,
    total_earned: f64,
    total_borrowed: f64,
    health_factor: f64,
    created_at: u64,
    recent_activities: Vec<Activity>,
}

#[derive(CandidType, Deserialize, Serialize)]
struct Activity {
    description: String,
    timestamp: u64,
}

#[query] // 获取用户信息
async fn get_user_info(principal: Principal) -> Result<UserInfo, String> {
    // 检查用户是否存在
    let user_exists = STATE.with(|s| {
        let state = s.borrow();
        state.users.contains_key(&principal)
    });

    if !user_exists {
        return Err("用户不存在".to_string());
    }

    // 计算用户数据 - 需要 await
    let collateral_value = cal_collateral_value(principal).await;
    let borrow_value = cal_borrow_value(principal).await;
    let health_factor = cal_health_factor(principal).await;

    // 创建用户信息
    let user_info = UserInfo {
        principal,
        username: format!("User_{}", &principal.to_text()[0..8]),
        ckbtc_balance: collateral_value,
        total_earned: collateral_value,
        total_borrowed: borrow_value,
        health_factor,
        created_at: time(),
        recent_activities: vec![
            Activity {
                description: "登录成功".to_string(),
                timestamp: time(),
            },
            Activity {
                description: "查看借贷池".to_string(),
                timestamp: time() - 60000_000_000,
            },
        ],
    };

    Ok(user_info)
}

#[update] // 注册用户
fn register_user(principal: Principal, username: String) -> Result<UserInfo, String> {
    STATE.with(|s| {
        let mut state = s.borrow_mut();

        // 检查用户是否已存在
        if state.users.contains_key(&principal) {
            return Err("用户已存在".to_string());
        }

        // 创建新用户账户
        let user_account = UserAccounts::default();
        state.users.insert(principal, user_account);

        // 创建用户信息
        let user_info = UserInfo {
            principal,
            username,
            ckbtc_balance: 0.0,
            total_earned: 0.0,
            total_borrowed: 0.0,
            health_factor: 0.0,
            created_at: time(),
            recent_activities: vec![Activity {
                description: "用户注册成功".to_string(),
                timestamp: time(),
            }],
        };

        Ok(user_info)
    })
}

/*-------------------Unit Conversion Function--------------------*/
pub fn numtokens_to_f64(a: &NumTokens, decimals: u32) -> f64 {
    let value = a.0.to_string().parse::<f64>().unwrap_or_default();
    value / (10f64.powi(decimals as i32))
}

fn f64_to_numtokens(a: &f64, decimals: u32) -> NumTokens {
    let scale = 1u128.checked_pow(decimals).expect("decimals overflow");
    let scaled = a * (scale as f64);
    let rounded = scaled.round().max(0.0);
    let int_units = if rounded.is_finite() && rounded >= 0.0 {
        rounded as u64
    } else {
        0u64
    };

    NumTokens::from(int_units)
}

/*-------------------------Authentication Functions------------------------*/
/*
#[query] // 检查用户是否已认证
fn is_authenticated() -> bool {
    // 在 IC 中，如果能够调用这个方法，说明用户已经通过身份验证
    true
}

#[derive(CandidType, Deserialize, Serialize)]
struct UserInfo {
    principal: Principal,
    username: String,
    ckbtc_balance: f64,
    total_earned: f64,
    total_borrowed: f64,
    health_factor: f64,
    created_at: u64,
    recent_activities: Vec<Activity>,
}

#[derive(CandidType, Deserialize, Serialize)]
struct Activity {
    description: String,
    timestamp: u64,
}

#[query] // 获取用户信息
fn get_user_info(principal: Principal) -> Result<UserInfo, String> {
    STATE.with(|s| {
        let state = s.borrow();

        // 检查用户是否存在
        if !state.users.contains_key(&principal) {
            return Err("用户不存在".to_string());
        }

        let _user_account = state.users.get(&principal).unwrap();

        // 计算用户数据
        let collateral_value = cal_collateral_value(principal);
        let borrow_value = cal_borrow_value(principal);
        let health_factor = cal_health_factor(principal);

        // 创建用户信息
        let user_info = UserInfo {
            principal,
            username: format!("User_{}", &principal.to_text()[0..8]),
            ckbtc_balance: collateral_value, // 使用抵押品价值作为 ckBTC 余额
            total_earned: collateral_value,
            total_borrowed: borrow_value,
            health_factor,
            created_at: time(),
            recent_activities: vec![
                Activity {
                    description: "登录成功".to_string(),
                    timestamp: time(),
                },
                Activity {
                    description: "查看借贷池".to_string(),
                    timestamp: time() - 60000_000_000, // 1分钟前
                },
            ],
        };

        Ok(user_info)
    })
}

#[update] // 注册用户
fn register_user(principal: Principal, username: String) -> Result<UserInfo, String> {
    STATE.with(|s| {
        let mut state = s.borrow_mut();

        // 检查用户是否已存在
        if state.users.contains_key(&principal) {
            return Err("用户已存在".to_string());
        }

        // 创建新用户账户
        let user_account = UserAccounts::default();
        state.users.insert(principal, user_account);

        // 创建用户信息
        let user_info = UserInfo {
            principal,
            username,
            ckbtc_balance: 0.0,
            total_earned: 0.0,
            total_borrowed: 0.0,
            health_factor: 0.0,
            created_at: time(),
            recent_activities: vec![Activity {
                description: "用户注册成功".to_string(),
                timestamp: time(),
            }],
        };

        Ok(user_info)
    })
}
*/
/*-------------------------Query Functions for Frontend------------------------*/
#[query] // 获取所有资产配置
fn get_all_assets() -> Vec<AssetConfig> {
    STATE.with(|s| {
        let state = s.borrow();
        state.assets.values().cloned().collect()
    })
}

#[query] // 获取所有池子信息
fn get_all_pools() -> Vec<Pool> {
    STATE.with(|s| {
        let state = s.borrow();
        state.pool.values().cloned().collect()
    })
}

#[query] // 获取用户的供应信息
fn get_user_supplies(user: Principal) -> Vec<(Principal, NumTokens)> {
    STATE.with(|s| {
        let state = s.borrow();
        if let Some(user_account) = state.users.get(&user) {
            user_account
                .supplies
                .iter()
                .map(|(k, v)| (*k, v.clone()))
                .collect()
        } else {
            Vec::new()
        }
    })
}

#[query] // 获取用户的借贷信息
fn get_user_borrows(user: Principal) -> Vec<(Principal, NumTokens)> {
    STATE.with(|s| {
        let state = s.borrow();
        if let Some(user_account) = state.users.get(&user) {
            user_account
                .borrows
                .iter()
                .map(|(k, v)| (*k, v.clone()))
                .collect()
        } else {
            Vec::new()
        }
    })
}

#[query] // 获取池子详情
fn get_pool_info_detailed(token_id: String) -> Result<Pool, String> {
    let token = Principal::from_text(token_id).map_err(|_| "Invalid token ID")?;
    STATE.with(|s| {
        let state = s.borrow();
        state
            .pool
            .get(&token)
            .cloned()
            .ok_or("Pool not found".to_string())
    })
}

#[query] // 获取资产详情
fn get_asset_info(token_id: String) -> Result<AssetConfig, String> {
    let token = Principal::from_text(token_id).map_err(|_| "Invalid token ID")?;
    STATE.with(|s| {
        let state = s.borrow();
        state
            .assets
            .get(&token)
            .cloned()
            .ok_or("Asset not found".to_string())
    })
}

#[query] // 获取用户的总供应价值
async fn get_user_total_supply_value(user: Principal) -> f64 {
    cal_collateral_value(user).await
}

#[query] // 获取用户的总借贷价值
async fn get_user_total_borrow_value(user: Principal) -> f64 {
    cal_borrow_value(user).await
}

#[query] // 获取用户的健康因子
async fn get_user_health_factor(user: Principal) -> f64 {
    cal_health_factor(user).await
}

#[query]
pub fn get_admin() -> Principal {
    STATE.with(|s| s.borrow().admin)
}

#[update]
pub fn set_admin() -> Result<(), String> {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        // 直接设置为固定的 admin
        state.admin =
            Principal::from_text("utczu-b7es3-fs23u-etjih-qong5-q6zq3-xgbl3-ubhwu-z5lpc-llyko-uae")
                .unwrap();
        ic_cdk::println!(
            "Admin set to: utczu-b7es3-fs23u-etjih-qong5-q6zq3-xgbl3-ubhwu-z5lpc-llyko-uae"
        );
        Ok(())
    })
}

export_candid!();
