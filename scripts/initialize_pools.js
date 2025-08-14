// 初始化池子脚本
// 用于在主网上配置资产和创建池子

import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { IDL } from "@dfinity/candid";

// 后端 IDL 定义
const backendIdlFactory = ({ IDL }) =>
  IDL.Service({
    update_contract_assets: IDL.Func(
      [
        IDL.Record({
          name: IDL.Text,
          token_id: IDL.Text,
          price_id: IDL.Text,
          decimals: IDL.Nat32,
          collaterals: IDL.Opt(IDL.Float64),
          interest_rate: IDL.Opt(IDL.Float64),
        }),
      ],
      [],
      [],
    ),
    create_pool: IDL.Func(
      [
        IDL.Record({
          name: IDL.Text,
          token_id: IDL.Text,
          collateral: IDL.Vec(IDL.Text),
          maximum_token: IDL.Nat,
        }),
      ],
      [IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })],
      [],
    ),
  });

// 资产配置
const ASSETS = [
  {
    name: "ICP",
    token_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    price_id:
      "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // ICP/USD
    decimals: 8,
    collateral_factor: 0.8, // 80% 抵押因子
    interest_rate: 0.05, // 5% 年化利率
  },
  {
    name: "ckBTC",
    token_id: "mxzaz-hqaaa-aaaar-qaada-cai",
    price_id:
      "f9c0172ba8df5d1bb97d2c940e9a6f0000000000000000000000000000000000", // BTC/USD
    decimals: 8,
    collateral_factor: 0.75, // 75% 抵押因子
    interest_rate: 0.06, // 6% 年化利率
  },
  {
    name: "ckETH",
    token_id: "ss2fx-dyaaa-aaaar-qacoq-cai",
    price_id:
      "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD
    decimals: 18,
    collateral_factor: 0.7, // 70% 抵押因子
    interest_rate: 0.07, // 7% 年化利率
  },
  {
    name: "USDC",
    token_id: "xevnm-gaaaa-aaaar-qafnq-cai",
    price_id:
      "eaa020c61cc479712813461ce153894a0a6c5c1c14adc2c43d20ec72eb355b9e", // USDC/USD
    decimals: 6,
    collateral_factor: 0.9, // 90% 抵押因子
    interest_rate: 0.03, // 3% 年化利率
  },
];

// 池子配置
const POOLS = [
  {
    name: "ICP Pool",
    token_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    collateral: [
      "ryjl3-tyaaa-aaaaa-aaaba-cai", // ICP
      "mxzaz-hqaaa-aaaar-qaada-cai", // ckBTC
      "ss2fx-dyaaa-aaaar-qacoq-cai", // ckETH
      "xevnm-gaaaa-aaaar-qafnq-cai", // USDC
    ],
    maximum_token: 20000000000000n, // 200,000 ICP (8位小数)
  },
  {
    name: "BTC Pool",
    token_id: "mxzaz-hqaaa-aaaar-qaada-cai",
    collateral: [
      "ryjl3-tyaaa-aaaaa-aaaba-cai", // ICP
      "mxzaz-hqaaa-aaaar-qaada-cai", // ckBTC
      "ss2fx-dyaaa-aaaar-qacoq-cai", // ckETH
      "xevnm-gaaaa-aaaar-qafnq-cai", // USDC
    ],
    maximum_token: 1000000000n, // 10 BTC (8位小数)
  },
  {
    name: "ETH Pool",
    token_id: "ss2fx-dyaaa-aaaar-qacoq-cai",
    collateral: [
      "ryjl3-tyaaa-aaaaa-aaaba-cai", // ICP
      "mxzaz-hqaaa-aaaar-qaada-cai", // ckBTC
      "ss2fx-dyaaa-aaaar-qacoq-cai", // ckETH
      "xevnm-gaaaa-aaaar-qafnq-cai", // USDC
    ],
    maximum_token: 2850000000000000000n, // 2.85 ETH (18位小数)
  },
  {
    name: "USDC Pool",
    token_id: "xevnm-gaaaa-aaaar-qafnq-cai",
    collateral: [
      "ryjl3-tyaaa-aaaaa-aaaba-cai", // ICP
      "mxzaz-hqaaa-aaaar-qaada-cai", // ckBTC
      "ss2fx-dyaaa-aaaar-qacoq-cai", // ckETH
      "xevnm-gaaaa-aaaar-qafnq-cai", // USDC
    ],
    maximum_token: 1000000000000n, // 1,000,000 USDC (6位小数)
  },
];

// 创建 Actor
async function createActor(identity, canisterId) {
  const agent = new HttpAgent({
    identity,
    host: "https://icp-api.io",
  });

  return Actor.createActor(backendIdlFactory, {
    agent,
    canisterId,
  });
}

// 初始化资产
async function initializeAssets(actor) {
  console.log("开始初始化资产配置...");

  for (const asset of ASSETS) {
    try {
      console.log(`正在配置资产: ${asset.name} (${asset.token_id})`);

      await actor.update_contract_assets({
        name: asset.name,
        token_id: asset.token_id,
        price_id: asset.price_id,
        decimals: asset.decimals,
        collaterals: [asset.collateral_factor],
        interest_rate: [asset.interest_rate],
      });

      console.log(`✅ 资产 ${asset.name} 配置成功`);
    } catch (error) {
      console.error(`❌ 资产 ${asset.name} 配置失败:`, error);
      throw error;
    }
  }

  console.log("所有资产配置完成！");
}

// 创建池子
async function createPools(actor) {
  console.log("开始创建池子...");

  for (const pool of POOLS) {
    try {
      console.log(`正在创建池子: ${pool.name} (${pool.token_id})`);

      const result = await actor.create_pool({
        name: pool.name,
        token_id: pool.token_id,
        collateral: pool.collateral,
        maximum_token: pool.maximum_token,
      });

      if ("Ok" in result) {
        console.log(`✅ 池子 ${pool.name} 创建成功`);
      } else {
        console.error(`❌ 池子 ${pool.name} 创建失败:`, result.Err);
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error(`❌ 池子 ${pool.name} 创建失败:`, error);
      throw error;
    }
  }

  console.log("所有池子创建完成！");
}

// 主函数
export async function initializePools(identity, canisterId) {
  try {
    console.log("=== 开始初始化池子系统 ===");
    console.log("后端 Canister ID:", canisterId);

    // 创建 Actor
    const actor = await createActor(identity, canisterId);
    console.log("Actor 创建成功");

    // 初始化资产
    await initializeAssets(actor);

    // 创建池子
    await createPools(actor);

    console.log("=== 池子系统初始化完成 ===");
  } catch (error) {
    console.error("初始化失败:", error);
    throw error;
  }
}

// 如果直接运行此脚本
if (typeof window === "undefined") {
  // Node.js 环境
  console.log("请在浏览器环境中运行此脚本，或使用 dfx 命令行工具");
}
