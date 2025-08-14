import { AuthClient } from "@dfinity/auth-client";
import {
  Identity,
  HttpAgent,
  Actor,
  ActorSubclass,
  HttpAgentOptions,
  AnonymousIdentity,
} from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { IDL } from "@dfinity/candid";
import {
  TokenBalanceService,
  TOKEN_CANISTER_IDS,
  Account,
} from "./TokenBalanceService";

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

// Borrow position interface
export interface BorrowPosition {
  id: string;
  asset: string;
  amount: number;
  rate: number;
  health_factor: number;
}

// Earn position interface
export interface EarnPosition {
  id: string;
  asset: string;
  amount: number;
  apy: number;
  earned: number;
}

// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  principal: Principal | null;
  userInfo: UserInfo | null;
}

// Backend Actor interface
interface BackendService {
  is_authenticated: () => Promise<boolean>;
  get_user_info: (
    principal: Principal,
  ) => Promise<{ Ok: UserInfo } | { Err: string }>;
  register_user: (
    principal: Principal,
    username: string,
  ) => Promise<{ Ok: UserInfo } | { Err: string }>;
  update_ckbtc_balance: (
    amount: number,
  ) => Promise<{ Ok: number } | { Err: string }>;
}

// ckBTC deposit state interface
interface CkbtcDepositState {
  status: string;
  btcAddress: string;
  received: number;
  required: number;
  confirmations: bigint;
  requiredConfirmations: bigint;
}

// Backend IDL definition
const idlFactory: IDL.InterfaceFactory = ({ IDL }) =>
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
    update_ckbtc_balance: IDL.Func(
      [IDL.Float64],
      [IDL.Variant({ Ok: IDL.Float64, Err: IDL.Text })],
      [],
    ),
    get_borrow_positions: IDL.Func(
      [],
      [
        IDL.Variant({
          Ok: IDL.Vec(
            IDL.Record({
              id: IDL.Text,
              asset: IDL.Text,
              amount: IDL.Float64,
              rate: IDL.Float64,
              health_factor: IDL.Float64,
            }),
          ),
          Err: IDL.Text,
        }),
      ],
      ["query"],
    ),
    get_earn_positions: IDL.Func(
      [],
      [
        IDL.Variant({
          Ok: IDL.Vec(
            IDL.Record({
              id: IDL.Text,
              asset: IDL.Text,
              amount: IDL.Float64,
              apy: IDL.Float64,
              earned: IDL.Float64,
            }),
          ),
          Err: IDL.Text,
        }),
      ],
      ["query"],
    ),
  });

export class InternetIdentityService {
  private authClient: AuthClient | null = null;
  private identity: Identity | null = null;
  private agent: HttpAgent | null = null;
  private actor: ActorSubclass<BackendService> | null = null;
  private tokenBalanceService: TokenBalanceService | null = null;
  private authState: AuthState = {
    isAuthenticated: false,
    principal: null,
    userInfo: null,
  };

  // Get network configuration
  public getNetworkConfig() {
    console.log("=== 环境变量调试信息 ===");
    console.log("import.meta.env.DFX_NETWORK:", import.meta.env.DFX_NETWORK);
    console.log(
      "import.meta.env.CANISTER_ID_INTERNET_IDENTITY:",
      import.meta.env.CANISTER_ID_INTERNET_IDENTITY,
    );
    console.log(
      "import.meta.env.CANISTER_ID_BACKEND:",
      import.meta.env.CANISTER_ID_BACKEND,
    );
    console.log("所有import.meta.env:", import.meta.env);

    const network = import.meta.env.DFX_NETWORK || "ic";
    if (!["local", "ic"].includes(network)) {
      throw new Error(
        `Invalid DFX_NETWORK value: ${network}, must be "local" or "ic"`,
      );
    }
    const isLocal = network === "local";
    const host = isLocal ? "http://localhost:4943" : "https://icp-api.io";

    // 使用新的推荐URL格式
    const identityProvider = isLocal
      ? `http://${import.meta.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`
      : "https://identity.icp0.io";

    const config = { network, isLocal, host, identityProvider };
    console.log("最终网络配置:", config);
    return config;
  }

  // Initialize authentication client
  async initialize(): Promise<void> {
    try {
      console.log("=== 开始初始化 Internet Identity Service ===");

      const { network, isLocal, host, identityProvider } =
        this.getNetworkConfig();
      console.log("网络配置:", { network, isLocal, host, identityProvider });
      console.log("环境变量:", {
        DFX_NETWORK: import.meta.env.DFX_NETWORK,
        CANISTER_ID_INTERNET_IDENTITY: import.meta.env
          .CANISTER_ID_INTERNET_IDENTITY,
        CANISTER_ID_BACKEND: import.meta.env.CANISTER_ID_BACKEND,
      });

      console.log("正在创建 AuthClient...");
      this.authClient = await AuthClient.create();
      console.log("AuthClient 创建成功");

      const isAuthenticated = await this.authClient.isAuthenticated();
      console.log("当前认证状态:", isAuthenticated);

      if (isAuthenticated) {
        this.identity = this.authClient.getIdentity();
        console.log("获取到身份:", this.identity.getPrincipal().toText());
        await this.initializeAgent();
        await this.checkAuthenticationStatus();
        console.log("已认证用户初始化完成");
      } else {
        console.log("用户未认证，使用匿名身份初始化 agent");
        await this.initializeAgentWithAnonymousIdentity();
        console.log("匿名用户初始化完成");
      }
    } catch (error: unknown) {
      console.error(
        "Internet Identity 初始化失败:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  // Initialize HTTP agent and Actor
  private async initializeAgent(): Promise<void> {
    if (!this.identity) {
      throw new Error("Identity not initialized");
    }

    const { network, isLocal, host } = this.getNetworkConfig();
    console.log("=== Agent initialization info ===");
    console.log("Using host:", host);
    console.log("Network config:", network);
    // 新增：打印当前身份principal
    if (this.identity && typeof this.identity.getPrincipal === "function") {
      console.log(
        "[Agent Init] 当前身份 Principal:",
        this.identity.getPrincipal().toText(),
      );
    } else {
      console.log("[Agent Init] 当前为匿名身份");
    }

    const options: HttpAgentOptions = { identity: this.identity, host };
    this.agent = await HttpAgent.create(options);

    if (isLocal) {
      try {
        console.log("Fetching local environment Root Key...");
        await this.retryFetchRootKey(this.agent, 3);
        console.log("Root Key fetched successfully");
      } catch (error) {
        console.error("Failed to fetch Root Key:", error);
        throw new Error(
          "Cannot connect to local environment, ensure dfx is running",
        );
      }
    }

    const canisterId = import.meta.env.CANISTER_ID_BACKEND;
    if (!canisterId) {
      throw new Error("Backend canister ID not configured");
    }
    console.log("Using backend canister ID:", canisterId);

    try {
      this.actor = Actor.createActor<BackendService>(idlFactory, {
        agent: this.agent,
        canisterId,
      });
      console.log("Actor created successfully");
    } catch (error: unknown) {
      console.error(
        "Failed to create Actor:",
        error instanceof Error ? error.message : String(error),
      );
      throw new Error(
        `Cannot create Actor for canister ${canisterId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // 重新创建 TokenBalanceService 以使用认证身份
    this.tokenBalanceService = new TokenBalanceService(
      this.agent,
      this.identity,
    );
    console.log("TokenBalanceService created with authenticated identity");
  }

  // Retry fetching Root Key
  private async retryFetchRootKey(
    agent: HttpAgent,
    retries: number,
    delayMs: number = 1000,
  ): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await agent.fetchRootKey();
        return;
      } catch (error) {
        console.warn(
          `Attempt ${attempt}/${retries} to fetch Root Key failed:`,
          error,
        );
        if (attempt === retries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // Initialize HTTP agent and Actor with anonymous identity
  private async initializeAgentWithAnonymousIdentity(): Promise<void> {
    console.log("Initializing HTTP agent and Actor with anonymous identity...");
    const { AnonymousIdentity } = await import("@dfinity/agent");
    this.identity = new AnonymousIdentity();
    await this.initializeAgent();
    console.log("Anonymous user initialization complete");
  }

  // Ensure TokenBalanceService is initialized
  public ensureTokenBalanceService(): TokenBalanceService {
    if (!this.tokenBalanceService) {
      const { network, isLocal, host } = this.getNetworkConfig();

      // 检查是否有认证身份可用
      if (this.identity && this.agent) {
        console.log("使用认证身份创建 TokenBalanceService");
        this.tokenBalanceService = new TokenBalanceService(
          this.agent,
          this.identity,
        );
      } else {
        console.log(
          "Agent not initialized, creating anonymous Agent for balance queries...",
        );
        const options: HttpAgentOptions = { host };
        const agent = HttpAgent.createSync(options);
        this.tokenBalanceService = new TokenBalanceService(
          agent,
          new AnonymousIdentity(),
        );
        if (isLocal) {
          agent
            .fetchRootKey()
            .catch((error: unknown) =>
              console.error(
                "Anonymous Agent Root Key fetch failed:",
                error instanceof Error ? error.message : String(error),
              ),
            );
        }
      }
    }
    return this.tokenBalanceService;
  }

  // Login method
  async login(): Promise<void> {
    console.log("=== Starting login process ===");
    const { network, identityProvider } = this.getNetworkConfig();
    console.log("Current environment variables:", {
      dfxNetwork: network,
      canisterId: import.meta.env.CANISTER_ID_BACKEND,
      identityProvider,
    });

    if (!this.authClient) {
      console.error("Authentication client not initialized");
      throw new Error("Authentication client not initialized");
    }

    const isAuthenticated = await this.authClient.isAuthenticated();
    if (isAuthenticated) {
      console.log("User already authenticated, retrieving identity info");
      this.identity = this.authClient.getIdentity();
      await this.initializeAgent();
      await this.checkAuthenticationStatus();
      return;
    }

    console.log("Authenticating with Internet Identity");
    await this.loginWithInternetIdentity();
  }

  // Login with Internet Identity
  private async loginWithInternetIdentity(): Promise<void> {
    const { identityProvider } = this.getNetworkConfig();
    if (
      !import.meta.env.CANISTER_ID_INTERNET_IDENTITY &&
      identityProvider.includes("canisterId=")
    ) {
      console.warn(
        "Warning: CANISTER_ID_INTERNET_IDENTITY not configured, local Internet Identity login may fail",
      );
    }

    console.log("Using Internet Identity URL:", identityProvider);

    return new Promise((resolve, reject) => {
      this.authClient!.login({
        identityProvider,
        onSuccess: async () => {
          console.log("Internet Identity login successful");
          try {
            this.identity = this.authClient!.getIdentity();
            console.log(
              "User identity retrieved:",
              this.identity.getPrincipal().toText(),
            );
            await this.initializeAgent();
            await this.checkAuthenticationStatus();
            window.dispatchEvent(new Event("ii-login-success"));
            resolve();
          } catch (error) {
            console.error("Post-login initialization failed:", error);
            reject(error);
          }
        },
        onError: (error) => {
          console.error("Internet Identity login failed:", error);
          reject(error);
        },
        windowOpenerFeatures:
          "toolbar=0,location=0,status=0,menubar=0,scrollbars=1,resizable=1,width=500,height=600",
      });
    });
  }

  // Logout method
  async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
    }
    this.identity = null;
    this.agent = null;
    this.actor = null;
    this.tokenBalanceService = null;
    this.authState = {
      isAuthenticated: false,
      principal: null,
      userInfo: null,
    };
  }

  // Check authentication status and auto-register user
  private async checkAuthenticationStatus(): Promise<void> {
    if (!this.actor || !this.identity) {
      throw new Error("Actor 或 Identity 未初始化");
    }
    try {
      console.log("=== 开始检查认证状态 ===");
      const principal = this.identity.getPrincipal();
      console.log("当前 Principal:", principal.toText());
      console.log("Actor 是否可用:", !!this.actor);

      console.log("正在调用后端 is_authenticated...");
      const isAuthenticated = await this.actor.is_authenticated();
      console.log("后端认证状态:", isAuthenticated);

      if (isAuthenticated) {
        console.log("用户已认证，获取用户信息...");
        const userInfoResult = await this.actor.get_user_info(principal);
        this.authState = {
          isAuthenticated: true,
          principal,
          userInfo: "Ok" in userInfoResult ? userInfoResult.Ok : null,
        };
      } else {
        console.log("用户未认证，开始自动注册...");
        await this.autoRegisterUser(principal);
      }
      console.log("最终认证状态:", this.authState);
    } catch (error) {
      console.error("检查认证状态失败:", error);
      if (error instanceof Error) {
        console.error("错误详情:", {
          message: error.message,
          stack: error.stack,
        });
        if (error.message.includes("400")) {
          console.error(
            "HTTP 400 Bad Request，可能的原因：无效的签名或 Canister ID 错误",
          );
          console.error("建议检查：");
          console.error("1. 后端 canister 是否正在运行");
          console.error("2. Canister ID 是否正确");
          console.error("3. 本地 dfx 是否正常运行");
        }
      }
      this.authState = {
        isAuthenticated: false,
        principal: null,
        userInfo: null,
      };
      throw error;
    }
  }

  // Auto-register user
  private async autoRegisterUser(principal: Principal): Promise<void> {
    if (!this.actor) {
      throw new Error("Actor not initialized");
    }
    try {
      const username = principal.toText().slice(0, 8) + "...";
      const result = await this.actor.register_user(principal, username);

      if ("Ok" in result) {
        this.authState = {
          isAuthenticated: true,
          principal,
          userInfo: result.Ok,
        };
        console.log("User auto-registered successfully:", username);
      } else if (result.Err.includes("用户已存在")) {
        console.log("User already exists, fetching user info...");
        const userInfoResult = await this.actor.get_user_info(principal);
        this.authState = {
          isAuthenticated: true,
          principal,
          userInfo: "Ok" in userInfoResult ? userInfoResult.Ok : null,
        };
        console.log("User info fetched successfully for existing user");
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error("Failed to auto-register user:", error);
      // 如果是用户已存在的错误，不要抛出，而是尝试获取用户信息
      if (error instanceof Error && error.message.includes("用户已存在")) {
        console.log("User already exists, attempting to fetch user info...");
        try {
          const userInfoResult = await this.actor!.get_user_info(principal);
          this.authState = {
            isAuthenticated: true,
            principal,
            userInfo: "Ok" in userInfoResult ? userInfoResult.Ok : null,
          };
          console.log("User info fetched successfully for existing user");
          return; // 成功获取用户信息，不抛出错误
        } catch (fetchError) {
          console.error(
            "Failed to fetch user info for existing user:",
            fetchError,
          );
        }
      }
      // 对于其他错误，设置基本状态但不抛出
      this.authState = { isAuthenticated: true, principal, userInfo: null };
    }
  }

  // Get user information
  async getUserInfo(): Promise<UserInfo | null> {
    if (!this.actor) {
      throw new Error("Actor not initialized");
    }
    try {
      const principal = this.getCurrentPrincipal();
      if (!principal) {
        throw new Error("User not logged in");
      }
      const result = await this.actor.get_user_info(principal);
      if ("Ok" in result) {
        this.authState.userInfo = result.Ok;
        return result.Ok;
      }
      return null;
    } catch (error) {
      console.error("Failed to get user info:", error);
      return null;
    }
  }

  // Update ckBTC balance
  async updateCkbtcBalance(amount: number): Promise<number> {
    if (!this.actor) {
      throw new Error("Actor not initialized");
    }
    try {
      const result = await this.actor.update_ckbtc_balance(amount);
      if ("Ok" in result) {
        if (this.authState.userInfo) {
          this.authState.userInfo.ckbtc_balance = result.Ok;
        }
        return result.Ok;
      }
      throw new Error(result.Err);
    } catch (error) {
      console.error("Failed to update ckBTC balance:", error);
      throw error;
    }
  }

  // Get authentication state
  getAuthState(): AuthState {
    return this.authState;
  }

  // Check if service is initialized
  isInitialized(): boolean {
    return this.actor !== null;
  }

  // Get current user Principal
  getCurrentPrincipal(): Principal | null {
    return this.identity ? this.identity.getPrincipal() : null;
  }

  // Generate Account from Principal
  generateAccountFromPrincipal(
    principal: Principal,
    subaccount?: Uint8Array,
  ): Account {
    return {
      owner: principal,
      subaccount: subaccount ?? null,
    };
  }

  // Generate default Account (no subaccount)
  generateDefaultAccount(principal: Principal): Account {
    return this.generateAccountFromPrincipal(principal);
  }

  // Query token balance
  async queryTokenBalance(
    tokenCanisterId: string,
    account: Account,
  ): Promise<{ balance?: bigint; error?: string }> {
    const tokenBalanceService = this.ensureTokenBalanceService();
    const subaccount = account.subaccount ?? null; // 使用 null 而不是 []
    return await tokenBalanceService.queryTokenBalance(
      tokenCanisterId,
      account.owner,
      subaccount,
    );
  }

  // Query current user token balance
  async queryCurrentUserBalance(tokenCanisterId: string): Promise<bigint> {
    const tokenBalanceService = this.ensureTokenBalanceService();
    const principal = this.getCurrentPrincipal();
    // 新增：打印当前principal
    console.log(
      "[Query Balance] 当前 principal:",
      principal ? principal.toText() : "匿名",
    );
    if (!principal) {
      console.log(
        "User not logged in, querying balance with anonymous Principal...",
      );
      const result = await tokenBalanceService.queryTokenBalance(
        tokenCanisterId,
        Principal.anonymous(),
        null, // 添加缺失的第三个参数
      );
      return result.balance || BigInt(0);
    }
    const result = await tokenBalanceService.queryTokenBalance(
      tokenCanisterId,
      principal,
      null, // 添加缺失的第三个参数
    );
    return result.balance || BigInt(0);
  }

  // Query ICP balance
  async queryICPBalance(): Promise<bigint> {
    const { isLocal } = this.getNetworkConfig();
    const canisterId = isLocal
      ? TOKEN_CANISTER_IDS.LOCAL_ICP
      : TOKEN_CANISTER_IDS.ICP;
    if (!canisterId) {
      throw new Error(
        `ICP canister ID not configured (${isLocal ? "LOCAL_ICP" : "ICP"})`,
      );
    }
    return await this.queryCurrentUserBalance(canisterId);
  }

  // Query ckBTC balance
  async queryCkbtcBalance(): Promise<bigint> {
    const { isLocal } = this.getNetworkConfig();
    const canisterId = isLocal
      ? TOKEN_CANISTER_IDS.LOCAL_CKBTC
      : TOKEN_CANISTER_IDS.CKBTC;
    if (!canisterId) {
      throw new Error(
        `ckBTC canister ID not configured (${isLocal ? "LOCAL_CKBTC" : "CKBTC"})`,
      );
    }
    return await this.queryCurrentUserBalance(canisterId);
  }

  // Get token information
  async getTokenInfo(tokenCanisterId: string): Promise<{
    name: string;
    symbol: string;
    decimals: number;
  }> {
    const tokenBalanceService = this.ensureTokenBalanceService();
    return await tokenBalanceService.getTokenInfo(tokenCanisterId);
  }

  // Format balance display
  formatBalance(balance: bigint, decimals: number): string {
    const tokenBalanceService = this.ensureTokenBalanceService();
    return tokenBalanceService.formatBalance(balance, decimals);
  }

  // Check if user is authenticated
  async isUserAuthenticated(): Promise<boolean> {
    if (!this.authClient) return false;
    return await this.authClient.isAuthenticated();
  }

  // Refresh authentication state
  async refreshAuthState(): Promise<void> {
    await this.checkAuthenticationStatus();
  }
}

// ckBTC minter canister configuration
const CKBTC_MINTER_CANISTER_ID = "qjdve-lqaaa-aaaaa-aaaeq-cai";

// ckBTC minter Actor interface
interface CkbtcMinterService {
  get_btc_deposit_state: () => Promise<Array<CkbtcDepositState>>;
}

// ckBTC minter IDL
const CKBTC_MINTER_IDL: IDL.InterfaceFactory = ({ IDL }) =>
  IDL.Service({
    get_btc_deposit_state: IDL.Func(
      [],
      [
        IDL.Vec(
          IDL.Record({
            status: IDL.Text,
            btcAddress: IDL.Text,
            received: IDL.Float64,
            required: IDL.Float64,
            confirmations: IDL.Nat,
            requiredConfirmations: IDL.Nat,
          }),
        ),
      ],
      ["query"],
    ),
  });

// Query ckBTC deposit state
export async function getCkbtcDepositState(): Promise<CkbtcDepositState | null> {
  try {
    const options: HttpAgentOptions = { host: "https://icp-api.io" };
    const agent = await HttpAgent.create(options);
    const minter = Actor.createActor<CkbtcMinterService>(CKBTC_MINTER_IDL, {
      agent,
      canisterId: CKBTC_MINTER_CANISTER_ID,
    });
    const result = await minter.get_btc_deposit_state();
    const depositState = result[0];
    if (!depositState) return null;
    return {
      status: depositState.status,
      btcAddress: depositState.btcAddress,
      received: Number(depositState.received),
      required: Number(depositState.required),
      confirmations: BigInt(depositState.confirmations),
      requiredConfirmations: BigInt(depositState.requiredConfirmations),
    };
  } catch (error) {
    console.error("Failed to query ckBTC deposit state:", error);
    return null;
  }
}

// Create global instance
export const internetIdentityService = new InternetIdentityService();

// Verify Principal and Account ID dynamically
export async function verifyIds(expectedAccountId?: string) {
  await internetIdentityService.initialize();

  try {
    // Check if user is authenticated, trigger login if not
    const isAuthenticated = await internetIdentityService.isUserAuthenticated();
    if (!isAuthenticated) {
      console.log("No authenticated user, triggering login...");
      await internetIdentityService.login();
    }

    const principal = internetIdentityService.getCurrentPrincipal();
    if (!principal) {
      throw new Error(
        "No Principal available, login failed or user not authenticated",
      );
    }
    console.log("Current Principal ID:", principal.toText());

    const tokenBalanceService =
      internetIdentityService.ensureTokenBalanceService();
    const generatedAccountId =
      await tokenBalanceService.generateAccountId(principal);
    console.log("Generated Account ID:", generatedAccountId);

    // Optional: Compare with expected Account ID if provided
    if (expectedAccountId) {
      if (generatedAccountId === expectedAccountId) {
        console.log("Account ID matches expected value");
      } else {
        console.error("Account ID does not match expected value", {
          generated: generatedAccountId,
          expected: expectedAccountId,
        });
      }
    }

    // Query balance to demonstrate functionality
    const { isLocal } = internetIdentityService.getNetworkConfig();
    const canisterId = isLocal
      ? TOKEN_CANISTER_IDS.LOCAL_ICP
      : TOKEN_CANISTER_IDS.ICP;
    if (!canisterId) {
      throw new Error("ICP canister ID not configured");
    }
    const result = await internetIdentityService.queryTokenBalance(canisterId, {
      owner: principal,
      subaccount: null,
    });
    const tokenInfo = await internetIdentityService.getTokenInfo(canisterId);
    console.log(
      `ICP Balance: ${internetIdentityService.formatBalance(
        result.balance ?? BigInt(0),
        tokenInfo.decimals,
      )} ${tokenInfo.symbol}`,
    );
  } catch (error) {
    console.error(
      "Verification failed:",
      error instanceof Error ? error.message : String(error),
    );
  }
}

// Run verification
verifyIds();
