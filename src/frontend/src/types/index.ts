// 全局类型定义文件
// Global type definitions

// 语言类型定义
export type Language = "en" | "zh";

// 通用资产接口定义
export interface Asset {
  id: string; // 资产唯一标识符
  symbol: string; // 资产符号
  name: string; // 资产全名
  icon: string; // 资产图标
  price: number; // 当前价格 (USD)
  balance: number; // 钱包中的可用余额
  apy: number; // 供应年化收益率
  tvl: number; // 总锁仓价值
  supplied: number; // 用户已供应的金额
  borrowed: number; // 用户已借贷的金额
  collateralFactor: number; // 抵押因子 (决定借贷能力)
  liquidationThreshold: number; // 清算阈值
  borrowRate: number; // 借贷年化利率
  utilization: number; // 市场利用率
}

// BTC资产接口定义
export interface BTCAsset {
  id: string; // 资产唯一标识符
  symbol: string; // 资产符号 (如 BTC, WBTC, cbBTC)
  name: string; // 资产全名
  balance: number; // 钱包中的可用余额
  supplyApy: number; // 供应年化收益率
  borrowApy: number; // 借贷年化收益率
  tvl: number; // 总锁仓价值
  supplied: number; // 用户已供应的金额
  borrowed: number; // 用户已借贷的金额
  icon: string; // 资产图标
  collateralFactor: number; // 抵押因子 (决定借贷能力)
  liquidationThreshold: number; // 清算阈值
  utilization: number; // 市场利用率
  price: number; // 当前价格 (USD)
  priceChange24h: number; // 24小时价格变化百分比
}

// 通用代币接口 (用于非BTC资产，如USDC)
export interface Token {
  id: string; // 代币唯一标识符
  symbol: string; // 代币符号
  name: string; // 代币全名
  icon: string; // 代币图标
  price: number; // 当前价格 (USD)
}

// 市场交易对接口
export interface MarketPair {
  id: string; // 交易对唯一标识符
  collateral: BTCAsset | Token; // 抵押资产
  loan: Token; // 借贷资产
  lltv: number; // 贷款价值比 (Loan-to-Value)
  totalMarketSize: number; // 总市场规模 (USD)
  totalLiquidity: number; // 总流动性 (USD)
  borrowRate: number; // 借贷利率
  vaults: Vault[]; // 支持该市场的金库列表
  creatorIcon?: string; // 创建者图标
  trustedBy?: string[]; // 受信任方图标列表
}

// 金库(Vault)接口
export interface Vault {
  id: string; // 金库唯一标识符
  name: string; // 金库名称
  curator: string; // 管理者
  curatorIcon: string; // 管理者图标
  allocation: number; // 分配额 (USD)
  supplyShare: number; // 供应份额
  asset?: string; // 资产类型
  deposits?: number; // 存款金额
  apy?: number; // 年化收益率
  liquidity?: number; // 流动性
  totalDeposits?: number; // 总存款
  collateral?: string[]; // 支持的抵押品
  description?: string; // 描述
  performanceData?: PerformanceData; // 性能数据
  marketExposure?: MarketExposure[]; // 市场暴露
}

// 性能数据接口
export interface PerformanceData {
  nativeApy: number; // 原生APY
  wellBonus: number; // WELL奖励
  performanceFee: number; // 性能费用
  netApy: number; // 净APY
  chartData: ChartDataPoint[]; // 图表数据
}

// 图表数据点接口
export interface ChartDataPoint {
  date: string; // 日期
  value: number; // 值
}

// 市场暴露接口
export interface MarketExposure {
  market: string; // 市场名称
  asset: string; // 资产类型
  allocation: number; // 分配百分比
  allocationValue: number; // 分配金额
  supplyCap: number; // 供应上限
  isIdle: boolean; // 是否闲置
}

// 市场统计数据接口
export interface MarketStats {
  totalSupply: number; // 总供应量
  totalBorrow: number; // 总借贷量
  availableLiquidity: number; // 可用流动性
  utilizationRate: number; // 利用率
  supplyRate: number; // 供应利率
  borrowRate: number; // 借贷利率
  totalUsers: number; // 总用户数
  totalVolume24h: number; // 24小时交易量
}

// 交易记录接口定义
export interface Transaction {
  id: string; // 交易唯一标识符
  type: "supply" | "withdraw" | "borrow" | "repay"; // 交易类型
  asset: string; // 涉及的资产符号
  amount: number; // 交易金额
  timestamp: number; // 交易时间戳
  txHash: string; // 交易哈希
  status: "pending" | "success" | "failed"; // 交易状态
  gasUsed?: number; // 消耗的gas
  blockNumber?: number; // 区块号
}

// 用户投资组合接口
export interface UserPortfolio {
  totalSupplied: number; // 总供应金额
  totalBorrowed: number; // 总借贷金额
  totalEarned: number; // 总收益
  netWorth: number; // 净资产
  healthFactor: number; // 健康因子
  avgSupplyApy: number; // 平均供应APY
  avgBorrowApy: number; // 平均借贷APY
}

// 钱包连接状态接口
export interface WalletState {
  address: string | null; // 钱包地址
  isConnected: boolean; // 是否已连接
  balance: number; // 钱包余额
  network: string; // 网络名称
}

// 应用状态接口
export interface AppState {
  language: Language; // 当前语言
  wallet: WalletState; // 钱包状态
  assets: BTCAsset[]; // 资产列表
  transactions: Transaction[]; // 交易历史
  portfolio: UserPortfolio; // 用户投资组合
  marketStats: MarketStats; // 市场统计
  loading: boolean; // 加载状态
  error: string | null; // 错误信息
}

// 页面路由类型
export type PageRoute = "earn" | "borrow" | "explore" | "migrate" | "dashboard";

// 导航项接口
export interface NavItem {
  key: PageRoute; // 路由键
  label: { en: string; zh: string }; // 多语言标签
  icon?: string; // 图标（可选）
  path: string; // 路径
}
