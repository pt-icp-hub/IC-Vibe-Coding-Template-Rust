use crate::types::STATE;
use ic_cdk::api::msg_caller;
use ic_cdk::query;

// 检查用户是否已认证
#[query]
pub fn is_authenticated() -> bool {
    let caller = msg_caller();

    //STATE 是持久化存储，数据会保存在 IC 区块链上
    // 检查用户是否在业务数据库/状态中有记录
    STATE.with(|s| {
        let state = s.borrow();
        state.users.contains_key(&caller)
    })
}
