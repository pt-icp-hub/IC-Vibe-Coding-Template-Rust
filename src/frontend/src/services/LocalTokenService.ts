import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

// ICRC-1 Ledger 接口
const ICRC1_LEDGER_IDL = ({ IDL }: { IDL: any }) =>
  IDL.Service({
    icrc1_balance_of: IDL.Func(
      [
        IDL.Record({
          owner: IDL.Principal,
          subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
        }),
      ],
      [IDL.Nat],
      ["query"],
    ),
    icrc1_transfer: IDL.Func(
      [
        IDL.Record({
          to: IDL.Record({
            owner: IDL.Principal,
            subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
          }),
          amount: IDL.Nat,
          fee: IDL.Opt(IDL.Nat),
          memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
          from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
          created_at_time: IDL.Opt(IDL.Nat64),
        }),
      ],
      [IDL.Variant({ Ok: IDL.Nat, Err: IDL.Text })],
      [],
    ),
    icrc1_metadata: IDL.Func(
      [],
      [
        IDL.Vec(
          IDL.Record({
            name: IDL.Text,
            value: IDL.Variant({
              Text: IDL.Text,
              Nat: IDL.Nat,
              Int: IDL.Int,
              Blob: IDL.Vec(IDL.Nat8),
            }),
          }),
        ),
      ],
      ["query"],
    ),
  });

// 本地代币配置 - 使用 ckBTC 作为本地代币
const LOCAL_TOKEN_CONFIG = {
  ledger: "q3fc5-haaaa-aaaaa-aaahq-cai", // 本地 ckBTC ledger
  symbol: "ckBTC",
  name: "ckBTC (Local)",
  decimals: 8,
};

export class LocalTokenService {
  private agent: HttpAgent;
  private ledgerActor: any;

  constructor() {
    // 使用本地环境
    this.agent = new HttpAgent({ host: "http://localhost:4943" });
  }

  // 初始化服务
  async initialize(): Promise<void> {
    try {
      // 获取本地 root key
      await this.agent.fetchRootKey();

      // 创建 ledger actor
      this.ledgerActor = Actor.createActor(ICRC1_LEDGER_IDL, {
        agent: this.agent,
        canisterId: LOCAL_TOKEN_CONFIG.ledger,
      });

      console.log("本地代币服务初始化成功");
    } catch (error) {
      console.error("初始化本地代币服务失败:", error);
      throw new Error("无法连接到本地代币服务，请确保 dfx 正在运行");
    }
  }

  // 查询余额
  async getBalance(principal: Principal): Promise<bigint> {
    if (!this.ledgerActor) {
      throw new Error("代币服务未初始化");
    }

    try {
      const balance = await this.ledgerActor.icrc1_balance_of({
        owner: principal,
        subaccount: null,
      });

      return BigInt(balance);
    } catch (error) {
      console.error("查询余额失败:", error);
      throw error;
    }
  }

  // 转账
  async transfer(
    from: Principal,
    to: Principal,
    amount: bigint,
  ): Promise<bigint> {
    if (!this.ledgerActor) {
      throw new Error("代币服务未初始化");
    }

    try {
      const result = await this.ledgerActor.icrc1_transfer({
        to: { owner: to, subaccount: null },
        amount: amount,
        fee: null,
        memo: null,
        from_subaccount: null,
        created_at_time: null,
      });

      if ("Ok" in result) {
        return BigInt(result.Ok);
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error("转账失败:", error);
      throw error;
    }
  }

  // 获取代币元数据
  async getMetadata(): Promise<any> {
    if (!this.ledgerActor) {
      throw new Error("代币服务未初始化");
    }

    try {
      const metadata = await this.ledgerActor.icrc1_metadata();
      return metadata;
    } catch (error) {
      console.error("获取代币元数据失败:", error);
      throw error;
    }
  }

  // 格式化余额显示
  formatBalance(balance: bigint): string {
    const divisor = BigInt(10 ** LOCAL_TOKEN_CONFIG.decimals);
    const whole = balance / divisor;
    const fraction = balance % divisor;

    const fractionStr = fraction
      .toString()
      .padStart(LOCAL_TOKEN_CONFIG.decimals, "0");
    return `${whole}.${fractionStr}`;
  }

  // 获取代币配置
  getTokenConfig() {
    return LOCAL_TOKEN_CONFIG;
  }

  // 模拟铸造功能（在实际环境中，这需要 minter canister）
  async mintTokens(to: Principal, amount: bigint): Promise<bigint> {
    console.log(`模拟铸造 ${amount} 个代币给 ${to.toText()}`);
    // 在实际实现中，这里应该调用 minter canister
    // 现在只是返回成功，实际余额不会改变
    return amount;
  }
}

// 创建全局实例
export const localTokenService = new LocalTokenService();
