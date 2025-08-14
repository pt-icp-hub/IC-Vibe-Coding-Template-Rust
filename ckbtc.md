你在比特币链上有比特币（BTC），想要在 ICP 平台上拥有 ckBTC，你可以通过以下官方推荐的方法实现

# 1、使用 NNS 钱包直接兑换 ckBTC

登录 NNS 前端 dapp 并使用 Internet Identity 认证。
在“我的代币”中选择 ckBTC，点击“接收”。
系统会为你生成一个专属的比特币充值地址。
将你的 BTC 从比特币链上发送到这个地址。
等待比特币网络确认（大约 1 小时），BTC 到账后，系统会自动为你在 ICP 上铸造等量的 ckBTC。
你可以在 NNS 钱包中看到并使用你的 ckBTC。

当用户在 NNS 钱包充值 BTC 并获得等量 ckBTC 时，ckBTC 的归属是通过账户体系与 Internet Identity（II）进行关联和绑定的。
具体来说，NNS 钱包和 ckBTC 账户体系基于“principal”（即身份标识符）。当你用 Internet Identity 登录 NNS 钱包时，系统会为你的 II 生成一个 principal，并以此 principal 作为你的账户标识。你充值 BTC 时，NNS 钱包会为你的 principal 生成一个专属的比特币充值地址，BTC 到账后，系统会自动为该 principal 账户铸造等量的 ckBTC。这样，ckBTC 就直接归属于你的 Internet Identity 账户，无需额外的绑定操作。
换句话说，ckBTC 的所有权与 Internet Identity 绑定，是通过 principal 机制自动实现的。你在 NNS 钱包中看到和操作的 ckBTC，就是和你当前登录的 Internet Identity 绑定的那一份资产。每个 Internet Identity 都有独立的 principal 和对应的 ckBTC 账户，互不影响。

### 在本地安装nns扩展

```
dfx extension install nns
```

### 配置网路

```
dfx stop
dfx start --clean --background
dfx info networks-json-path
touch ~/.config/dfx/networks.json
```

内容如下

```
{
  "local": {
    "bind": "127.0.0.1:8000",
    "type": "ephemeral",
    "replica": {
      "subnet_type": "system"
    }
  },
  "ic": {
    "providers": ["https://ic0.app"],
    "type": "persistent"
  }
}
```

文件保存完了。再执行 dfx start --clean --enable-bitcoin

### 部署本地nns canister

```
dfx nns install
```

成功之后会给出
######################################

# NNS CANISTER INSTALLATION COMPLETE

######################################

Backend canisters:
nns-registry rwlgt-iiaaa-aaaaa-aaaaa-cai
nns-governance rrkah-fqaaa-aaaaa-aaaaq-cai
nns-ledger ryjl3-tyaaa-aaaaa-aaaba-cai
nns-root r7inp-6aaaa-aaaaa-aaabq-cai
nns-cycles-minting rkp4c-7iaaa-aaaaa-aaaca-cai
nns-lifeline rno2w-sqaaa-aaaaa-aaacq-cai
nns-genesis-token renrk-eyaaa-aaaaa-aaada-cai
nns-identity rdmx6-jaaaa-aaaaa-aaadq-cai
nns-ui qoctq-giaaa-aaaaa-aaaea-cai
nns-ic-ckbtc-minter qjdve-lqaaa-aaaaa-aaaeq-cai
nns-sns-wasm qaa6y-5yaaa-aaaaa-aaafa-cai

Frontend canisters:
internet_identity http://qhbym-qaaaa-aaaaa-aaafq-cai.localhost:8080/
nns-dapp http://qsgjb-riaaa-aaaaa-aaaga-cai.localhost:8080/
sns-aggregator http://sgymv-uiaaa-aaaaa-aaaia-cai.localhost:8080/

# 2、通过 DEX 兑换（如果你已有 ICP）

如果你有 ICP，可以在 ICP 上的 DEX（如 ICDex 或 ICPSwap）直接用 ICP 兑换 ckBTC，无需先充值 BTC。

# 3、ckBTC 是 1:1 由真实 BTC 锁定和铸造的，你可以随时将 ckBTC 按 1:1 兑换回 BTC。

# 部署本地 ICRC-1 ledger 作为“Local ckBTC”

```
dfx deploy icrc1_ledger --argument '
  (variant {
    Init = record {
      token_name = "Local ckBTC";
      token_symbol = "LCKBTC";
      minting_account = record {
        owner = principal "'${OWNER}'";
      };
      initial_balances = vec {
        record {
          record {
            owner = principal "'${OWNER}'";
          };
          100_000_000_000;
        };
      };
      metadata = vec {};
      transfer_fee = 10;
      archive_options = record {
        trigger_threshold = 2000;
        num_blocks_to_archive = 1000;
        controller_id = principal "'${OWNER}'";
      }
    }
  })
'
```

# 部署索引容器

```
dfx deploy icrc1_index --argument '
  record {
   ledger_id = (principal "mxzaz-hqaaa-aaaar-qaada-cai");
  }
'
```

# 前端通过调用本地 ledger canister 的接口（如 icrc1_transfer, icrc1_balance_of 等）即可模拟充值、转账和余额查询。你可以在前端直接展示充值成功的结果。

文档说的最佳实践

# 1、可以存入比特币以获得 ckBTC 或销毁 ckBTC 以提取比特币

# 2、为了铸造 ckBTC，用户必须首先将比特币存入由 get_btc_address 端点返回的比特币地址，该地址与用户的主体 ID 和可能的子账户绑定。

# 3、用户应向比特币罐（canister）的 bitcoin_get_utxos_query 端点发出查询调用，以检索在第一步获得的比特币地址的未使用输出。

如果用户不知道已为哪些未使用输出铸造了 ckBTC，可以在 ckBTC 铸造程序上调用 get_known_utxos 查询端点，返回从用户主体 ID（可能包括子账户）派生的比特币地址的已知未使用输出。

# 4、如果存在一个 ckBTC 铸造程序尚未发现的未使用输出，用户可以向 ckBTC 铸造程序的 update_balance 端点发出更新调用。然后，ckBTC 铸造程序将为每个新发现的未使用输出铸造 ckBTC。

# 5、比特币提现

首先通过在 ckBTC 账本上调用 icrc2_approve 端点，创建一个 ICRC-2 授权，授权 ckBTC 铸造者（罐头 ID： mqygn-kiaaa-aaaar-qaadq-cai ）至少检索要提现的金额。之后，用户可以在 ckBTC 铸造者上调用 retrieve_btc_with_approval 端点，这将创建一笔交易来销毁 ckBTC 中指定的金额。当此操作成功时，ckBTC 铸造者将创建一笔比特币交易，将相应数量的比特币提现到用户指定的比特币地址。

┌────┐ ┌──────┐┌──────────────┐
│User│ │Minter││BitcoinNetwork│
└─┬──┘ └──┬───┘└──────┬───────┘
│ │ │
│ get_btc_address(account) │ │
│─────────────────────────>│ │
│ │ │
│ address │ │
│<─────────────────────────│ │
│ │ │
│ Send BTC to address │ │
│─────────────────────────────────────>│
│ │ │
│ update_balance(account) │ │
│─────────────────────────>│ │
┌─┴──┐ ┌──┴───┐┌──────┴───────┐
│User│ │Minter││BitcoinNetwork│
└────┘ └──────┘└──────────────┘

┌────┐ ┌────────────┐ ┌──────┐ ┌───────────────┐
│User│ │ckBTC Ledger│ │Minter│ │Bitcoin Network│
└─┬──┘ └─────┬──────┘ └──┬───┘ └───────┬───────┘
│ │ │ │
│icrc2_approve(minter,amount)│ │ │
│───────────────────────────>│ │ │
│ │ │ │
│ retrieve_btc_with_approval(address,amount) │ │
│───────────────────────────────────────────────────────────────────>│ │
│ │ │ │
│ │icrc2_transfer_from(user,minter,amount)│ │
│ │<──────────────────────────────────────│ │
│ │ │ │
│ │ │Send BTC to withdrawal address│
│ │ │─────────────────────────────>│
┌─┴──┐ ┌─────┴──────┐ ┌──┴───┐ ┌───────┴───────┐
│User│ │ckBTC Ledger│ │Minter│ │Bitcoin Network│
└────┘ └────────────┘ └──────┘ └───────────────┘
