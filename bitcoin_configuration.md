# 1、安装 Bitcoin Core

# 2、dfx.json 中已启用 Bitcoin 集成

```
"defaults":{
    "bitcoin":{
          "enabled":true,
          "nodes":[
             "127.0.0.1:18444"
          ],
          "canister_init_arg":"(record { stability_threshold = 0 : nat; network = variant { regtest }; blocks_source = principal \"aaaaa-aa\"; fees = record { get_utxos_base = 0 : nat; get_utxos_cycles_per_ten_instructions = 0 : nat; get_utxos_maximum = 0 : nat; get_balance = 0 : nat; get_balance_maximum = 0 : nat; get_current_fee_percentiles = 0 : nat; get_current_fee_percentiles_maximum = 0 : nat;  send_transaction_base = 0 : nat; send_transaction_per_byte = 0 : nat; }; syncing = variant { enabled }; api_access = variant { enabled }; disable_api_if_not_fully_synced = variant { enabled }})"
       }
  },
```

# 3、创建数据目录和配置文件并启动

在项目根目录创建数据目录
mkdir -p bitcoin_data/regtest

创建配置文件
vi bitcoin_data/bitcoin.conf

添加下面的内容.注释为了说明。

```
# 启用回归测试模式，适用于本地开发
regtest=1

# RPC 认证凭据，匹配 bitcoin-cli 和 dfx.json
rpcuser=test
rpcpassword=test

#RPC 端口，匹配 dfx.json 中的 nodes: ["127.0.0.1:18444"]。
rpcport=18444

#
server=1

#启用交易索引，ckBTC 必需。
txindex=1


fallbackfee=0.0002

#限制 RPC 访问到本地
[regtest]
rpcbind=127.0.0.1
rpcallowip=127.0.0.1

# P2P 端口，可与 RPC 端口不同，避免冲突。
port=8333
```

# 4、设置权限

chmod -R 755 ~/rust/icp_1/bitcoin_data

# 5、启动 bitcoind

bitcoind -regtest -datadir=项目根目录/bitcoin_data -rpcport=18444 -daemon

如果bitcoin.conf在bitcoin_data目录下。就不需要-conf参数。否则需要这个参数来指定bitcoin.conf的具体位置

如果显示 Bitcoin Core starting。证明比特币核心正在启动。

# 6、启动网络并启用比特币功能

dfx start --enable-bitcoin

如果配置是enabled: true。那么就代表启动了比特币适配器。

# 7、部署一个专门的比特币 canister 来处理比特币相关操作

basic_bitcoin必须要在本地下载源代码，如果用rust就下载rust源代码

下载之后执行
cargo build --target wasm32-unknown-unknown --release

编译成功之后
ls target/wasm32-unknown-unknown/release/

basic_bitcoin.wasm 应该就在 target/wasm32-unknown-unknown/release/ 目录下。

在dfx.json文件下添加下面的配置

```
"canisters": {
    "basic_bitcoin": {
      "type": "custom",
      "candid": "/Users/guoying/rust/examples/rust/basic_bitcoin/basic_bitcoin.did",
      "wasm": "/Users/guoying/rust/examples/rust/basic_bitcoin/target/wasm32-unknown-unknown/release/basic_bitcoin.wasm",
      "init_arg": "(variant { regtest })"
    },
}
```

最后执行这个部署

dfx deploy basic_bitcoin --argument '(variant { regtest })'

> 会自动依次执行创建 canister、编译 canister、安装 canister这三步，相当于自动帮你执行了 dfx canister create、dfx build 和 dfx canister install，简化了开发流程。dfx deploy basic_bitcoin ≈ dfx canister create basic_bitcoin + dfx build basic_bitcoin + dfx canister install basic_bitcoin

测试是否部署成功。

### 充值 1 亿 cycles 到名为 basic_bitcoin 的 canister：

```
dfx ledger fabricate-cycles --canister basic_bitcoin --cycles 100000000
```

### 获取一个比特币地址（P2PKH）：

```
dfx canister call basic_bitcoin get_p2pkh_address
```

### 执行挖矿命令，挖 1 个区块，并把奖励发到上面得到的地址

```
bitcoin-cli -conf=$(pwd)/bitcoin_data/bitcoin.conf -regtest -rpcport=18444 generatetoaddress 1 mqQMQFpfTkrS8BuQWv19P2aAPpubAQffYt
```

结果会返回，挖出区块的哈希值。
[
"10d42c48e09359f4099ae156d28f810f2a16ce7402ea4e32ee62e272bd1c047d"
]

### 可以进一步查看区块的信息

```
bitcoin-cli -conf=$(pwd)/bitcoin_data/bitcoin.conf -regtest -rpcport=18444 getblock 10d42c48e09359f4099ae156d28f810f2a16ce7402ea4e32ee62e272bd1c047d 1
```

返回结果如下
{
// 区块哈希
"hash": "10d42c48e09359f4099ae156d28f810f2a16ce7402ea4e32ee62e272bd1c047d",
// 确认次数
"confirmations": 1,
//区块高度
"height": 203,
"version": 805306368,
"versionHex": "30000000",
"merkleroot": "c7147edaa9bf1e760de3dcd6b18db84ee8b311c188e95c5143577a09cd60e5bd",
"time": 1753081365,
"mediantime": 1753015728,
"nonce": 5,
"bits": "207fffff",
"target": "7fffff0000000000000000000000000000000000000000000000000000000000",
"difficulty": 4.656542373906925e-10,
"chainwork": "0000000000000000000000000000000000000000000000000000000000000198",
"nTx": 1,
"previousblockhash": "1bf316ac50966ed4468541b3edd2642cf51ac62667fcefba35544867fdf24a45",
"strippedsize": 217,
"size": 253,
"weight": 904,
//该区块包含的交易哈希列表
"tx": [
"c7147edaa9bf1e760de3dcd6b18db84ee8b311c188e95c5143577a09cd60e5bd"
]
}

### 查看您的 BTC 余额

虽然官方文档写着dfx调用。但是已经不能再用了。

### 获取原始交易数据

```
bitcoin-cli -conf=$(pwd)/bitcoin_data/bitcoin.conf -regtest -rpcport=18444 getrawtransaction c7147edaa9bf1e760de3dcd6b18db84ee8b311c188e95c5143577a09cd60e5bd 1
```

最后一个数字1
0：仅返回原始交易数据的十六进制编码
1：返回交易的详细信息（推荐）
2：返回交易的完整详细信息，包括区块信息

# 8、icp官方文档 https://github.com/dfinity/bitcoin-canister/blob/master/INTERFACE_SPECIFICATION.md 。

官方文档详细描述了比特币 canister在IC上暴露的所有方法、参数、返回值和调用方式。
开发者可以通过这些接口在ic上安全地与比特币网络进行交互（如获取余额，查询UTXO，发送交易）。

说开发比特币需要在代码实现，而不是调用dfx。因为dfx不支持带cycles。必须在代码层面才能带cycles.

### 1、查询某个比特币地址的 UTXO（未花费的交易输出）。

bitcoin_get_utxos

为什么要用到它呢

- 当你要发起一笔比特币转账时，你必须指定用哪些utxo作为“输入”
- 这些utxo就像你钱包里的零钱，你要选出一些零钱来“凑”出你要转账的金额。
- 比特币网络通过utxo机制，确保每个utxo只能被花一次，防止“双花”攻击。

典型流程举例

- 你用get_utxos查询自己的地址，获得一堆utxo(每个utxo有金额，来源，编号等信息)。
- 构造交易：你选择若干utxo作为输入，指定收款人和找零地址，构造一笔新交易。
- 签名并广播：你用私钥签名这笔交易，然后通过send_transaction广播到比特币网络。

### 2、查询比特币余额

bitcoin_get_balance本质也是基于bitcoin_get_utxos来实现的.
查询余额，就是把所有的utxo的金额加起来。

### 3、 获取比特币区块的区块头（block header）数据

bitcoin_get_block_headers
主要用于链上验证、轻节点、跨链桥等需要“只验证不下载全部数据“

### 4、广播一笔原始比特币交易到比特币网络

send_transaction

流程如下：

- 在前端构造并签名一笔原始比特币交易（raw transaction），指定输入（UTXO）、输出（收款人地址和找零地址）、手续费等。
- 用私钥签名这笔交易，得到一串原始交易字节（hex或blob）。
- 调用bitcoin_send_transaction,把这串原始交易字节作为参数，广播到比特币网络。
- 比特币 canister 会把这笔交易发送到真实的比特币网络，等待矿工打包。

### 5、获取比特币容器的当前配置

get_config

- stability_threshold:这是定义比特币区块被认为稳定之前的"基于难度的稳定性"水平的阈值。当一个区块变得稳定时，其交易将应用于 UTXO 集。随后，可以丢弃该区块以释放内存。有关稳定性机制的详细信息可以在比特币集成维基页面的"分叉解决"部分找到。

- network: 此参数指示比特币容器是连接到比特币主网、测试网（v4）还是回归测试网

- syncing ：此标志指示比特币容器是否正在主动接收区块以更新其状态。

- fees ：此记录指定调用各个端点时必须附加多少个周期。关于 API 费用的更多信息可以在比特币集成文档中找到。

- api_access ：此标志指示对端点的访问是否已启用。

- disable_api_if_not_fully_synced ：如果看门狗容器指示比特币容器在区块链状态上落后超过 2 个区块，则此标志表示端点访问是否会自动禁用。

- watchdog_canister ：这是看门狗容器的主体 ID。如果该容器观察到比特币容器落后，它将被授权禁用 API 访问.

- burn_cycles ：此标志指示是否燃烧收到的周期。

- lazily_evaluate_fee_percentiles ：该标志指示是否仅在请求费用时评估费用百分位数，而不是在处理新接收的区块时自动更新它们。

### 6、更新配置。

set_config

看门狗容器（watchdog canister）只能设置 API 访问标志。所有其他配置只能由容器的控制器更新。对于连接到比特币主网的主比特币容器，其唯一的控制器是 NNS 根容器。

### 7、阈值系统签名api

#### （1） ecdsa_public_key

返回从指定的 key_id （曲线和密钥名称）和 derivation_path （最多 255 个任意长度的字节字符串）派生的 SEC1 编码 ECDSA 公钥。只能由容器（Canister）调用。

#### （2）sign_with_ecdsa

使用由 message_hash 、 key_id 和 derivation_path 定义的派生私钥，在 32 字节上生成 ECDSA 签名。 key_id 和 derivation_path 必须与 ecdsa_public_key 调用中使用的相匹配。只能由容器（Canister）调用。

此 API 端点将消耗必须显式转移的周期。

### 4、向比特币api发送请求来提交交易。

### 5、从比特币网络读取信息，例如交易详情或地址余额。
