// Backend Service
// 处理所有与后端 canister 的交互

import { Actor, HttpAgent, ActorSubclass } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { IDL } from "@dfinity/candid";

// User information interface
export interface UserInfo {
  principal: Principal;
  username: string;
  ckbtc_balance: number;
  total_earned: number;
  total_borrowed: number;
  health_factor: number;
  created_at: bigint;
  recent_activities?: Array<{
    description: string;
    timestamp: bigint;
  }>;
}

// Asset configuration interface
export interface AssetConfig {
  name: string;
  token_id: Principal;
  account: {
    owner: Principal;
    subaccount?: Uint8Array | null;
  };
  price_id: string;
  asset_type: string;
  decimals: number;
  collateral_factor: number;
  interest_rate: number;
}

// Pool interface
export interface Pool {
  name: string;
  token_id: Principal;
  pool_account: AssetConfig;
  collateral: AssetConfig[];
  amount: bigint;
  used_amount: bigint;
  maximum_token: bigint;
}

// Pool info interface
export interface PoolInfo {
  name: string;
  collateral_factor: number;
  collateral: Array<{
    name: string;
    token_id: Principal;
    account: {
      owner: Principal;
      subaccount?: Uint8Array | null;
    };
    price_id: string;
    asset_type: string;
    decimals: number;
    collateral_factor: number;
    interest_rate: number;
  }>;
  amount: number;
  used_amount: number;
  maximum_amount: number;
  supply_apy: number;
  borrow_apy: number;
}

// Backend Actor interface
interface BackendActor {
  is_authenticated: () => Promise<boolean>;
  get_user_info: (
    principal: Principal,
  ) => Promise<{ Ok: UserInfo } | { Err: string }>;
  register_user: (
    principal: Principal,
    username: string,
  ) => Promise<{ Ok: UserInfo } | { Err: string }>;

  // 池子信息查询
  get_pool_info: (token: string) => Promise<PoolInfo>;
  get_all_pools: () => Promise<Pool[]>;
  get_pool_info_detailed: (
    token: string,
  ) => Promise<{ Ok: Pool } | { Err: string }>;
  get_real_pool_amount: (token: string) => Promise<number>;
  get_pool_supply_apy: (token: string) => Promise<number>;
  get_pool_borrow_apy: (token: string) => Promise<number>;

  // 资产信息查询
  get_all_assets: () => Promise<AssetConfig[]>;
  get_asset_info: (
    token: string,
  ) => Promise<{ Ok: AssetConfig } | { Err: string }>;

  // 用户计算
  cal_collateral_value: (user: Principal) => Promise<number>;
  cal_borrow_value: (user: Principal) => Promise<number>;
  cal_health_factor: (user: Principal) => Promise<number>;
  max_borrow_amount: (user: Principal) => Promise<number>;

  // 用户信息查询
  get_user_supplies: (
    user: Principal,
  ) => Promise<Array<{ principal: Principal; nat: bigint }>>;
  get_user_borrows: (
    user: Principal,
  ) => Promise<Array<{ principal: Principal; nat: bigint }>>;
  get_user_total_supply_value: (user: Principal) => Promise<number>;
  get_user_total_borrow_value: (user: Principal) => Promise<number>;
  get_user_health_factor: (user: Principal) => Promise<number>;

  // 系统信息
  get_liquidation_threshold: () => Promise<number>;
  get_token_decimals: (token: Principal) => Promise<number>;
  get_price: (token: Principal) => Promise<number>;

  // 借贷操作 (update 方法)
  supply: (
    token_id: string,
    amount: bigint,
  ) => Promise<{ Ok: number } | { Err: string }>;
  borrow: (
    token_id: string,
    amount: bigint,
  ) => Promise<{ Ok: number } | { Err: string }>;
  repay: (
    token_id: string,
    amount: bigint,
  ) => Promise<{ Ok: number } | { Err: string }>;
  withdraw: (
    token_id: string,
    amount: bigint,
  ) => Promise<{ Ok: number } | { Err: string }>;
}

// Backend IDL definition
const backendIdlFactory: IDL.InterfaceFactory = ({ IDL }) =>
  IDL.Service({
    is_authenticated: IDL.Func([], [IDL.Bool], ["query"]),
    get_user_info: IDL.Func(
      [IDL.Principal],
      [
        IDL.Variant({
          Ok: IDL.Record({
            principal: IDL.Principal,
            username: IDL.Text,
            ckbtc_balance: IDL.Float64,
            total_earned: IDL.Float64,
            total_borrowed: IDL.Float64,
            health_factor: IDL.Float64,
            created_at: IDL.Nat64,
            recent_activities: IDL.Opt(
              IDL.Vec(
                IDL.Record({
                  description: IDL.Text,
                  timestamp: IDL.Nat64,
                }),
              ),
            ),
          }),
          Err: IDL.Text,
        }),
      ],
      ["query"],
    ),
    register_user: IDL.Func(
      [IDL.Principal, IDL.Text],
      [
        IDL.Variant({
          Ok: IDL.Record({
            principal: IDL.Principal,
            username: IDL.Text,
            ckbtc_balance: IDL.Float64,
            total_earned: IDL.Float64,
            total_borrowed: IDL.Float64,
            health_factor: IDL.Float64,
            created_at: IDL.Nat64,
            recent_activities: IDL.Opt(
              IDL.Vec(
                IDL.Record({
                  description: IDL.Text,
                  timestamp: IDL.Nat64,
                }),
              ),
            ),
          }),
          Err: IDL.Text,
        }),
      ],
      [],
    ),

    // 池子信息查询
    get_pool_info: IDL.Func(
      [IDL.Text],
      [
        IDL.Record({
          name: IDL.Text,
          collateral_factor: IDL.Float64,
          collateral: IDL.Vec(
            IDL.Record({
              name: IDL.Text,
              token_id: IDL.Principal,
              account: IDL.Record({
                owner: IDL.Principal,
                subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
              }),
              price_id: IDL.Text,
              asset_type: IDL.Text,
              decimals: IDL.Nat8,
              collateral_factor: IDL.Float64,
              interest_rate: IDL.Float64,
            }),
          ),
          amount: IDL.Float64,
          used_amount: IDL.Float64,
          maximum_amount: IDL.Float64,
          supply_apy: IDL.Float64,
          borrow_apy: IDL.Float64,
        }),
      ],
      ["query"],
    ),
    get_all_pools: IDL.Func(
      [],
      [
        IDL.Vec(
          IDL.Record({
            name: IDL.Text,
            token_id: IDL.Principal,
            pool_account: IDL.Record({
              name: IDL.Text,
              token_id: IDL.Principal,
              account: IDL.Record({
                owner: IDL.Principal,
                subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
              }),
              price_id: IDL.Text,
              asset_type: IDL.Text,
              decimals: IDL.Nat8,
              collateral_factor: IDL.Float64,
              interest_rate: IDL.Float64,
            }),
            collateral: IDL.Vec(
              IDL.Record({
                name: IDL.Text,
                token_id: IDL.Principal,
                account: IDL.Record({
                  owner: IDL.Principal,
                  subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
                }),
                price_id: IDL.Text,
                asset_type: IDL.Text,
                decimals: IDL.Nat8,
                collateral_factor: IDL.Float64,
                interest_rate: IDL.Float64,
              }),
            ),
            amount: IDL.Nat,
            used_amount: IDL.Nat,
            maximum_token: IDL.Nat,
          }),
        ),
      ],
      ["query"],
    ),
    get_pool_info_detailed: IDL.Func(
      [IDL.Text],
      [
        IDL.Variant({
          Ok: IDL.Record({
            name: IDL.Text,
            token_id: IDL.Principal,
            pool_account: IDL.Record({
              name: IDL.Text,
              token_id: IDL.Principal,
              account: IDL.Record({
                owner: IDL.Principal,
                subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
              }),
              price_id: IDL.Text,
              asset_type: IDL.Text,
              decimals: IDL.Nat8,
              collateral_factor: IDL.Float64,
              interest_rate: IDL.Float64,
            }),
            collateral: IDL.Vec(
              IDL.Record({
                name: IDL.Text,
                token_id: IDL.Principal,
                account: IDL.Record({
                  owner: IDL.Principal,
                  subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
                }),
                price_id: IDL.Text,
                asset_type: IDL.Text,
                decimals: IDL.Nat8,
                collateral_factor: IDL.Float64,
                interest_rate: IDL.Float64,
              }),
            ),
            amount: IDL.Nat,
            used_amount: IDL.Nat,
            maximum_token: IDL.Nat,
          }),
          Err: IDL.Text,
        }),
      ],
      ["query"],
    ),
    get_real_pool_amount: IDL.Func([IDL.Text], [IDL.Float64], ["query"]),
    get_pool_supply_apy: IDL.Func([IDL.Text], [IDL.Float64], ["query"]),
    get_pool_borrow_apy: IDL.Func([IDL.Text], [IDL.Float64], ["query"]),

    // 资产信息查询
    get_all_assets: IDL.Func(
      [],
      [
        IDL.Vec(
          IDL.Record({
            name: IDL.Text,
            token_id: IDL.Principal,
            account: IDL.Record({
              owner: IDL.Principal,
              subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
            }),
            price_id: IDL.Text,
            asset_type: IDL.Text,
            decimals: IDL.Nat8,
            collateral_factor: IDL.Float64,
            interest_rate: IDL.Float64,
          }),
        ),
      ],
      ["query"],
    ),
    get_asset_info: IDL.Func(
      [IDL.Text],
      [
        IDL.Variant({
          Ok: IDL.Record({
            name: IDL.Text,
            token_id: IDL.Principal,
            account: IDL.Record({
              owner: IDL.Principal,
              subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
            }),
            price_id: IDL.Text,
            asset_type: IDL.Text,
            decimals: IDL.Nat8,
            collateral_factor: IDL.Float64,
            interest_rate: IDL.Float64,
          }),
          Err: IDL.Text,
        }),
      ],
      ["query"],
    ),

    // 用户计算
    cal_collateral_value: IDL.Func([IDL.Principal], [IDL.Float64], ["query"]),
    cal_borrow_value: IDL.Func([IDL.Principal], [IDL.Float64], ["query"]),
    cal_health_factor: IDL.Func([IDL.Principal], [IDL.Float64], ["query"]),
    max_borrow_amount: IDL.Func([IDL.Principal], [IDL.Float64], ["query"]),

    // 用户信息查询
    get_user_supplies: IDL.Func(
      [IDL.Principal],
      [IDL.Vec(IDL.Record({ principal: IDL.Principal, nat: IDL.Nat }))],
      ["query"],
    ),
    get_user_borrows: IDL.Func(
      [IDL.Principal],
      [IDL.Vec(IDL.Record({ principal: IDL.Principal, nat: IDL.Nat }))],
      ["query"],
    ),
    get_user_total_supply_value: IDL.Func(
      [IDL.Principal],
      [IDL.Float64],
      ["query"],
    ),
    get_user_total_borrow_value: IDL.Func(
      [IDL.Principal],
      [IDL.Float64],
      ["query"],
    ),
    get_user_health_factor: IDL.Func([IDL.Principal], [IDL.Float64], ["query"]),

    // 系统信息
    get_liquidation_threshold: IDL.Func([], [IDL.Float64], ["query"]),
    get_token_decimals: IDL.Func([IDL.Principal], [IDL.Nat8], ["query"]),
    get_price: IDL.Func([IDL.Principal], [IDL.Float64], ["query"]),

    // 借贷操作 (update 方法)
    supply: IDL.Func(
      [IDL.Text, IDL.Nat],
      [IDL.Variant({ Ok: IDL.Nat64, Err: IDL.Text })],
      [],
    ),
    borrow: IDL.Func(
      [IDL.Text, IDL.Nat],
      [IDL.Variant({ Ok: IDL.Nat64, Err: IDL.Text })],
      [],
    ),
    repay: IDL.Func(
      [IDL.Text, IDL.Nat],
      [IDL.Variant({ Ok: IDL.Nat64, Err: IDL.Text })],
      [],
    ),
    withdraw: IDL.Func(
      [IDL.Text, IDL.Nat],
      [IDL.Variant({ Ok: IDL.Nat64, Err: IDL.Text })],
      [],
    ),
  });

export class BackendService {
  private actor: ActorSubclass<BackendActor> | null = null;

  constructor(agent: HttpAgent, canisterId: string) {
    this.actor = Actor.createActor<BackendActor>(backendIdlFactory, {
      agent,
      canisterId,
    });
  }

  // 认证相关
  async isAuthenticated(): Promise<boolean> {
    if (!this.actor) throw new Error("Actor not initialized");
    return await this.actor.is_authenticated();
  }

  async getUserInfo(principal: Principal): Promise<UserInfo | null> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      const result = await this.actor.get_user_info(principal);
      if ("Ok" in result) {
        return result.Ok;
      }
      return null;
    } catch (error) {
      console.error("Failed to get user info:", error);
      return null;
    }
  }

  async registerUser(
    principal: Principal,
    username: string,
  ): Promise<UserInfo | null> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      const result = await this.actor.register_user(principal, username);
      if ("Ok" in result) {
        return result.Ok;
      }
      return null;
    } catch (error) {
      console.error("Failed to register user:", error);
      return null;
    }
  }

  // 池子信息查询
  async getPoolInfo(tokenId: string): Promise<PoolInfo> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_pool_info(tokenId);
    } catch (error) {
      console.error("Failed to get pool info:", error);
      throw error;
    }
  }

  async getAllPools(): Promise<Pool[]> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_all_pools();
    } catch (error) {
      console.error("Failed to get all pools:", error);
      throw error;
    }
  }

  async getPoolInfoDetailed(tokenId: string): Promise<Pool | null> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      const result = await this.actor.get_pool_info_detailed(tokenId);
      if ("Ok" in result) {
        return result.Ok;
      } else {
        console.error("Failed to get pool info detailed:", result.Err);
        return null;
      }
    } catch (error) {
      console.error("Failed to get pool info detailed:", error);
      throw error;
    }
  }

  async getAllAssets(): Promise<AssetConfig[]> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_all_assets();
    } catch (error) {
      console.error("Failed to get all assets:", error);
      throw error;
    }
  }

  async getAssetInfo(tokenId: string): Promise<AssetConfig | null> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      const result = await this.actor.get_asset_info(tokenId);
      if ("Ok" in result) {
        return result.Ok;
      } else {
        console.error("Failed to get asset info:", result.Err);
        return null;
      }
    } catch (error) {
      console.error("Failed to get asset info:", error);
      throw error;
    }
  }

  async getUserSupplies(
    user: Principal,
  ): Promise<Array<{ principal: Principal; nat: bigint }>> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_user_supplies(user);
    } catch (error) {
      console.error("Failed to get user supplies:", error);
      throw error;
    }
  }

  async getUserBorrows(
    user: Principal,
  ): Promise<Array<{ principal: Principal; nat: bigint }>> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_user_borrows(user);
    } catch (error) {
      console.error("Failed to get user borrows:", error);
      throw error;
    }
  }

  async getUserTotalSupplyValue(user: Principal): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_user_total_supply_value(user);
    } catch (error) {
      console.error("Failed to get user total supply value:", error);
      throw error;
    }
  }

  async getUserTotalBorrowValue(user: Principal): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_user_total_borrow_value(user);
    } catch (error) {
      console.error("Failed to get user total borrow value:", error);
      throw error;
    }
  }

  async getUserHealthFactor(user: Principal): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_user_health_factor(user);
    } catch (error) {
      console.error("Failed to get user health factor:", error);
      throw error;
    }
  }

  async getRealPoolAmount(tokenId: string): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_real_pool_amount(tokenId);
    } catch (error) {
      console.error("Failed to get real pool amount:", error);
      throw error;
    }
  }

  async getPoolSupplyApy(tokenId: string): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_pool_supply_apy(tokenId);
    } catch (error) {
      console.error("Failed to get pool supply APY:", error);
      throw error;
    }
  }

  async getPoolBorrowApy(tokenId: string): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_pool_borrow_apy(tokenId);
    } catch (error) {
      console.error("Failed to get pool borrow APY:", error);
      throw error;
    }
  }

  // 用户计算
  async getUserCollateralValue(principal: Principal): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.cal_collateral_value(principal);
    } catch (error) {
      console.error("Failed to get user collateral value:", error);
      throw error;
    }
  }

  async getUserBorrowValue(principal: Principal): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.cal_borrow_value(principal);
    } catch (error) {
      console.error("Failed to get user borrow value:", error);
      throw error;
    }
  }

  async getMaxBorrowAmount(principal: Principal): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.max_borrow_amount(principal);
    } catch (error) {
      console.error("Failed to get max borrow amount:", error);
      throw error;
    }
  }

  // 系统信息
  async getLiquidationThreshold(): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_liquidation_threshold();
    } catch (error) {
      console.error("Failed to get liquidation threshold:", error);
      throw error;
    }
  }

  async getTokenDecimals(token: Principal): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_token_decimals(token);
    } catch (error) {
      console.error("Failed to get token decimals:", error);
      throw error;
    }
  }

  async getPrice(token: Principal): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      return await this.actor.get_price(token);
    } catch (error) {
      console.error("Failed to get price:", error);
      throw error;
    }
  }

  // 借贷操作 (update 方法)
  async supply(tokenId: string, amount: bigint): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      const result = await this.actor.supply(tokenId, amount);
      if ("Ok" in result) {
        return result.Ok;
      }
      throw new Error(result.Err);
    } catch (error) {
      console.error("Failed to supply tokens:", error);
      throw error;
    }
  }

  async borrow(tokenId: string, amount: bigint): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      const result = await this.actor.borrow(tokenId, amount);
      if ("Ok" in result) {
        return result.Ok;
      }
      throw new Error(result.Err);
    } catch (error) {
      console.error("Failed to borrow tokens:", error);
      throw error;
    }
  }

  async repay(tokenId: string, amount: bigint): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      const result = await this.actor.repay(tokenId, amount);
      if ("Ok" in result) {
        return result.Ok;
      }
      throw new Error(result.Err);
    } catch (error) {
      console.error("Failed to repay tokens:", error);
      throw error;
    }
  }

  async withdraw(tokenId: string, amount: bigint): Promise<number> {
    if (!this.actor) throw new Error("Actor not initialized");
    try {
      const result = await this.actor.withdraw(tokenId, amount);
      if ("Ok" in result) {
        return result.Ok;
      }
      throw new Error(result.Err);
    } catch (error) {
      console.error("Failed to withdraw tokens:", error);
      throw error;
    }
  }
}

// 创建 BackendService 实例的工厂函数
export function createBackendService(
  agent: HttpAgent,
  canisterId: string,
): BackendService {
  return new BackendService(agent, canisterId);
}
