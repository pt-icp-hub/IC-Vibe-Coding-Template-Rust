#!/bin/bash

# 初始化池子脚本
# 使用方法: ./scripts/init_pools.sh <canister_id>

set -e

# 检查参数
if [ $# -eq 0 ]; then
    echo "使用方法: $0 <canister_id>"
    echo "例如: $0 d72ol-biaaa-aaaai-q32jq-cai"
    exit 1
fi

CANISTER_ID=$1

echo "=== 开始初始化池子系统 ==="
echo "后端 Canister ID: $CANISTER_ID"

# 检查 dfx 是否可用
if ! command -v dfx &> /dev/null; then
    echo "错误: dfx 未安装或不在 PATH 中"
    exit 1
fi

# 检查当前身份
echo "当前 dfx 身份: $(dfx identity whoami)"
echo "身份 Principal: $(dfx identity get-principal)"

echo ""
echo "=== 开始配置资产 ==="

# 配置 ICP 资产
echo "配置 ICP 资产..."
dfx canister call --network ic $CANISTER_ID update_contract_assets '(
  record {
    name = "ICP";
    token_id = "ryjl3-tyaaa-aaaaa-aaaba-cai";
    price_id = "0xc9907d786c5821547777780a1e4f89484f3417cb14dd244f2b0a34ea7a554d67";
    decimals = 8;
    collaterals = opt 0.8;
    interest_rate = opt 0.012;
  }
)'

# 配置 ckBTC 资产
echo "配置 ckBTC 资产..."
dfx canister call --network ic $CANISTER_ID update_contract_assets '(
  record {
    name = "ckBTC";
    token_id = "mxzaz-hqaaa-aaaar-qaada-cai";
    price_id = "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
    decimals = 8;
    collaterals = opt 0.8;
    interest_rate = opt 0.012;
  }
)'

# 配置 ckETH 资产
echo "配置 ckETH 资产..."
dfx canister call --network ic $CANISTER_ID update_contract_assets '(
  record {
    name = "ckETH";
    token_id = "ss2fx-dyaaa-aaaar-qacoq-cai";
    price_id = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
    decimals = 18;
    collaterals = opt 0.8;
    interest_rate = opt 0.012;
  }
)'

# 配置 ckUSDC 资产
echo "配置 ckUSDC 资产..."
dfx canister call --network ic $CANISTER_ID update_contract_assets '(
  record {
    name = "ckUSDC";
    token_id = "xevnm-gaaaa-aaaar-qafnq-cai";
    price_id = "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a";
    decimals = 6;
    collaterals = opt 0.8;
    interest_rate = opt 0.012;
  }
)'

echo ""
echo "=== 开始创建池子 ==="

# 创建 ICP Pool
echo "创建 ICP Pool..."
dfx canister call --network ic $CANISTER_ID create_pool '(
  record {
    name = "ICP Pool";
    token_id = "ryjl3-tyaaa-aaaaa-aaaba-cai";
    collateral = vec {
      "ryjl3-tyaaa-aaaaa-aaaba-cai";
      "mxzaz-hqaaa-aaaar-qaada-cai";
      "ss2fx-dyaaa-aaaar-qacoq-cai";
      "xevnm-gaaaa-aaaar-qafnq-cai";
    };
    maximum_token = 20_000_000_000_000;
  }
)'

# 创建 BTC Pool
echo "创建 BTC Pool..."
dfx canister call --network ic $CANISTER_ID create_pool '(
  record {
    name = "BTC Pool";
    token_id = "mxzaz-hqaaa-aaaar-qaada-cai";
    collateral = vec {
      "ryjl3-tyaaa-aaaaa-aaaba-cai";
      "mxzaz-hqaaa-aaaar-qaada-cai";
      "ss2fx-dyaaa-aaaar-qacoq-cai";
      "xevnm-gaaaa-aaaar-qafnq-cai";
    };
    maximum_token = 1_000_000_000;
  }
)'

# 创建 ETH Pool
echo "创建 ETH Pool..."
dfx canister call --network ic $CANISTER_ID create_pool '(
  record {
    name = "ETH Pool";
    token_id = "ss2fx-dyaaa-aaaar-qacoq-cai";
    collateral = vec {
      "ryjl3-tyaaa-aaaaa-aaaba-cai";
      "mxzaz-hqaaa-aaaar-qaada-cai";
      "ss2fx-dyaaa-aaaar-qacoq-cai";
      "xevnm-gaaaa-aaaar-qafnq-cai";
    };
    maximum_token = 2_850_000_000_000_000_000;
  }
)'

# 创建 USDC Pool
echo "创建 USDC Pool..."
dfx canister call --network ic $CANISTER_ID create_pool '(
  record {
    name = "USDC Pool";
    token_id = "xevnm-gaaaa-aaaar-qafnq-cai";
    collateral = vec {
      "ryjl3-tyaaa-aaaaa-aaaba-cai";
      "mxzaz-hqaaa-aaaar-qaada-cai";
      "ss2fx-dyaaa-aaaar-qacoq-cai";
      "xevnm-gaaaa-aaaar-qafnq-cai";
    };
    maximum_token = 1_000_000_000_000;
  }
)'

echo ""
echo "=== 池子系统初始化完成 ==="
echo "现在你可以在前端使用这些池子了！" 