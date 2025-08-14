// 多语言管理Hook
// Multi-language management hook

import React, {
  useState,
  useCallback,
  useContext,
  createContext,
  ReactNode,
} from "react";
import { Language } from "../types";

// 多语言文本定义接口
interface Translations {
  [key: string]: {
    en: string; // 英文文本
    zh: string; // 中文文本
  };
}

// 应用内所有文本的多语言定义
const translations: Translations = {
  // 导航栏文本
  nav_earn: { en: "Earn", zh: "收益" },
  nav_borrow: { en: "Borrow", zh: "借贷" },
  nav_explore: { en: "Explore", zh: "探索" },
  nav_migrate: { en: "Migrate", zh: "教程" },
  nav_dashboard: { en: "Dashboard", zh: "个人中心" },

  // 通用文本
  confirm: { en: "Confirm", zh: "确认" },
  connect_wallet: { en: "Connect Wallet", zh: "连接钱包" },
  connect_internet_identity: {
    en: "Connect Internet Identity",
    zh: "连接互联网身份",
  },
  disconnect: { en: "Disconnect", zh: "断开连接" },
  loading: { en: "Loading...", zh: "加载中..." },
  error: { en: "Error", zh: "错误" },
  success: { en: "Success", zh: "成功" },
  pending: { en: "Pending", zh: "待处理" },
  failed: { en: "Failed", zh: "失败" },
  user: { en: "User", zh: "用户" },
  authenticated: { en: "Authenticated", zh: "已认证" },
  ckbtc_balance: { en: "ckBTC Balance", zh: "ckBTC 余额" },
  retry: { en: "Retry", zh: "重试" },
  user_info: { en: "User Information", zh: "用户信息" },
  username: { en: "Username", zh: "用户名" },
  registration_date: { en: "Registration Date", zh: "注册时间" },
  asset_overview: { en: "Asset Overview", zh: "资产概览" },
  hide: { en: "Hide", zh: "隐藏" },
  manage_balance: { en: "Manage Balance", zh: "管理余额" },
  recent_activities: { en: "Recent Activities", zh: "最近活动" },
  current_balance: { en: "Current Balance", zh: "当前余额" },
  deposit_amount: { en: "Deposit Amount", zh: "存入金额" },
  withdraw_amount: { en: "Withdraw Amount", zh: "取出金额" },
  processing: { en: "Processing...", zh: "处理中..." },
  deposit_ckbtc: { en: "Deposit ckBTC", zh: "存入 ckBTC" },
  withdraw_ckbtc: { en: "Withdraw ckBTC", zh: "取出 ckBTC" },
  quick_amounts: { en: "Quick Amounts", zh: "快速金额" },
  wallet_balance: { en: "Wallet Balance", zh: "钱包余额" },
  supplied: { en: "Supplied", zh: "已供应" },
  borrowed: { en: "Borrowed", zh: "已借贷" },
  total_value_locked: { en: "Total Value Locked", zh: "总锁仓价值" },
  utilization: { en: "Utilization", zh: "利用率" },
  details: { en: "Details", zh: "详情" },
  daily_earning: { en: "Daily Earning", zh: "每日收益" },

  // Internet Identity相关
  internet_identity_login: {
    en: "Login with Internet Identity",
    zh: "使用互联网身份登录",
  },
  internet_identity_logout: { en: "Logout", zh: "退出登录" },
  internet_identity_connecting: { en: "Connecting...", zh: "连接中..." },
  internet_identity_connected: { en: "Connected", zh: "已连接" },
  internet_identity_failed: { en: "Connection failed", zh: "连接失败" },
  internet_identity_principal: { en: "Principal ID", zh: "主体ID" },

  // 身份验证相关
  authenticate: { en: "Connect Internet Identity", zh: "连接互联网身份" },
  internet_identity: { en: "Internet Identity", zh: "互联网身份" },
  authentication_required: {
    en: "Authentication Required",
    zh: "需要身份验证",
  },
  please_authenticate_to_view_balances: {
    en: "Please authenticate to view token balances",
    zh: "请先进行身份验证以查看代币余额",
  },
  not_authenticated: { en: "Not Authenticated", zh: "未认证" },
  backend_connection_error: {
    en: "Unable to connect to backend service, please ensure dfx is running",
    zh: "无法连接到后端服务，请确保dfx正在运行",
  },
  authentication_cancelled: {
    en: "User cancelled the authentication operation",
    zh: "用户取消了身份验证操作",
  },
  logout_failed: { en: "Logout failed", zh: "登出失败" },

  // Principal ID 和 Account ID 相关
  principal_id: { en: "Principal ID", zh: "Principal ID" },
  principal_id_subtitle: { en: "(Identity Identifier)", zh: "(身份标识)" },
  principal_id_description: {
    en: "User's unique identity identifier",
    zh: "用户的唯一身份标识",
  },
  principal_id_purpose: {
    en: "Used for identity verification and permission management",
    zh: "用于身份验证和权限管理",
  },

  account_id: { en: "Account ID", zh: "Account ID" },
  account_id_subtitle: { en: "(Account Address)", zh: "(账户地址)" },
  account_id_description: {
    en: "Account address generated based on Principal",
    zh: "基于Principal生成的账户地址",
  },
  account_id_purpose: {
    en: "Used for receiving tokens and conducting transactions",
    zh: "用于接收代币和进行交易",
  },

  // 资产相关
  total_supply: { en: "Total Supply", zh: "总供应量" },
  total_borrow: { en: "Total Borrow", zh: "总借贷量" },
  available_liquidity: { en: "Available Liquidity", zh: "可用流动性" },
  utilization_rate: { en: "Utilization Rate", zh: "利用率" },
  apy: { en: "APY", zh: "年化收益率" },
  supply_apy: { en: "Supply APY", zh: "供应年化收益率" },
  borrow_apy: { en: "Borrow APY", zh: "借贷年化收益率" },

  // 操作相关
  supply: { en: "Supply", zh: "供应" },
  withdraw: { en: "Withdraw", zh: "提取" },
  borrow: { en: "Borrow", zh: "借贷" },
  repay: { en: "Repay", zh: "还款" },
  amount: { en: "Amount", zh: "金额" },
  balance: { en: "Balance", zh: "余额" },

  // Earn页面相关
  vault: { en: "Vault", zh: "金库" },
  deposits: { en: "Deposits", zh: "存款" },
  curator: { en: "Curator", zh: "管理者" },
  collateral: { en: "Collateral", zh: "抵押品" },
  liquidity: { en: "Liquidity", zh: "流动性" },
  total_deposits: { en: "Total Deposits", zh: "总存款" },
  your_position: { en: "Your position", zh: "您的仓位" },
  projected_earnings_month: {
    en: "Projected Earnings / Month",
    zh: "预计月收益",
  },
  projected_earnings_year: {
    en: "Projected Earnings / Year",
    zh: "预计年收益",
  },
  deposit: { en: "Deposit", zh: "存款" },
  overview: { en: "Overview", zh: "概览" },
  performance: { en: "Performance", zh: "表现" },
  risk: { en: "Risk", zh: "风险" },
  activity: { en: "Activity", zh: "活动" },
  native_apy: { en: "Native APY", zh: "原生APY" },
  well_bonus: { en: "WELL Bonus", zh: "WELL奖励" },
  performance_fee: { en: "Performance Fee", zh: "性能费用" },
  net_apy: { en: "Net APY", zh: "净APY" },
  market_exposure: { en: "Market Exposure", zh: "市场暴露" },
  vault_allocation: { en: "Vault Allocation", zh: "金库分配" },
  supply_cap: { en: "Supply Cap", zh: "供应上限" },
  idle_liquidity: { en: "Idle Liquidity", zh: "闲置流动性" },
  filter_vaults: { en: "Filter vaults", zh: "筛选金库" },
  all: { en: "All", zh: "全部" },
  back_to_vaults: { en: "Back to Vaults", zh: "返回金库" },
  no_vaults_found: { en: "No vaults found.", zh: "未找到金库。" },
  try_adjusting_filters: {
    en: "Try adjusting your filters.",
    zh: "请尝试调整筛选条件。",
  },
  loading_vaults: { en: "Loading vaults...", zh: "加载金库中..." },

  // 页面标题
  page_earn_title: { en: "Earn Bitcoin Yield", zh: "赚取比特币收益" },
  page_earn_subtitle: {
    en: "Supply BTC assets to earn competitive yields",
    zh: "供应BTC资产赚取有竞争力的收益",
  },
  page_borrow_title: { en: "Borrow Against Collateral", zh: "以抵押品借贷" },
  page_borrow_subtitle: {
    en: "Use your assets as collateral to borrow other tokens with competitive rates",
    zh: "使用您的资产作为抵押品，以优惠利率借贷其他代币",
  },
  page_explore_title: { en: "Explore BTC Markets", zh: "探索BTC市场" },
  page_explore_subtitle: {
    en: "Discover the best Bitcoin DeFi opportunities",
    zh: "发现最佳的比特币DeFi机会",
  },
  page_dashboard_title: { en: "Your Portfolio", zh: "您的投资组合" },
  page_dashboard_subtitle: {
    en: "Manage your Bitcoin DeFi positions",
    zh: "管理您的比特币DeFi头寸",
  },

  // 统计数据
  total_supplied: { en: "Total Supplied", zh: "总供应金额" },
  total_borrowed: { en: "Total Borrowed", zh: "总借贷金额" },
  total_earned: { en: "Total Earned", zh: "总收益" },
  net_worth: { en: "Net Worth", zh: "净资产" },
  health_factor: { en: "Health Factor", zh: "健康因子" },

  // 交易历史
  transaction_history: { en: "Transaction History", zh: "交易历史" },
  recent_transactions: { en: "Recent Transactions", zh: "最近交易" },
  view_all: { en: "View All", zh: "查看全部" },

  // 市场信息
  market_info: { en: "Market Information", zh: "市场信息" },
  collateral_factor: { en: "Collateral Factor", zh: "抵押因子" },
  liquidation_threshold: { en: "Liquidation Threshold", zh: "清算阈值" },
  price: { en: "Price", zh: "价格" },
  price_change_24h: { en: "24h Change", zh: "24小时变化" },

  // 教程相关
  "Go to Earn": { en: "Go to Earn", zh: "前往收益" },
  "Go to Borrow": { en: "Go to Borrow", zh: "前往借贷" },
  Guide: { en: "Guide", zh: "教程" },
  "How Earn & Borrow Work on BLend": {
    en: "How Earn & Borrow Work on BLend",
    zh: "BLend 的收益与借贷原理",
  },
  "This page explains the underlying logic and advantages of the Earn and Borrow features on our platform.":
    {
      en: "This page explains the underlying logic and advantages of the Earn and Borrow features on our platform.",
      zh: "本页介绍本平台收益（Earn）和借贷（Borrow）功能的底层逻辑与优势。",
    },
  "Earn: How You Earn Yield": {
    en: "Earn: How You Earn Yield",
    zh: "收益：如何赚取收益",
  },
  "Deposit Assets": { en: "Deposit Assets", zh: "存入资产" },
  "You supply supported assets (e.g., BTC, ETH) into the platform's vaults.": {
    en: "You supply supported assets (e.g., BTC, ETH) into the platform's vaults.",
    zh: "您将支持的资产（如BTC、ETH）存入平台金库。",
  },
  "Assets are Matched to Borrowers": {
    en: "Assets are Matched to Borrowers",
    zh: "资产与借款人撮合",
  },
  "Your supplied assets are algorithmically matched to borrowers, maximizing utilization and yield.":
    {
      en: "Your supplied assets are algorithmically matched to borrowers, maximizing utilization and yield.",
      zh: "您的资产通过算法与借款人撮合，提升利用率和收益。",
    },
  "Earn Interest": { en: "Earn Interest", zh: "赚取利息" },
  "You earn interest paid by borrowers, with rates determined by market supply and demand.":
    {
      en: "You earn interest paid by borrowers, with rates determined by market supply and demand.",
      zh: "您获得借款人支付的利息，利率由市场供需决定。",
    },
  Advantages: { en: "Advantages", zh: "优势" },
  "Non-custodial, assets always in your control.": {
    en: "Non-custodial, assets always in your control.",
    zh: "非托管，资产始终归您所有。",
  },
  "Competitive yields, optimized by smart matching.": {
    en: "Competitive yields, optimized by smart matching.",
    zh: "收益有竞争力，智能撮合优化。",
  },
  "Transparent, on-chain operations.": {
    en: "Transparent, on-chain operations.",
    zh: "透明，链上操作。",
  },
  "Borrow: How You Borrow Assets": {
    en: "Borrow: How to Borrow with Collateral",
    zh: "借贷：如何以抵押品借贷",
  },
  "Provide Collateral": { en: "Provide Collateral", zh: "提供抵押品" },
  "Deposit your assets as collateral to secure your loan": {
    en: "Deposit your assets as collateral to secure your loan",
    zh: "存入您的资产作为抵押品，为贷款提供担保",
  },
  "Borrow Against Collateral": {
    en: "Borrow Against Collateral",
    zh: "以抵押品借贷",
  },
  "Borrow other tokens within safe collateralization limits": {
    en: "Borrow other tokens within safe collateralization limits",
    zh: "在安全的抵押率范围内借贷其他代币",
  },
  "Repay and Withdraw": { en: "Repay and Withdraw", zh: "还款与提取" },
  "Repay your loan to unlock and withdraw your collateral anytime": {
    en: "Repay your loan to unlock and withdraw your collateral anytime",
    zh: "随时还款以解锁并提取您的抵押品",
  },
  "Flexible borrowing, multiple supported assets.": {
    en: "Flexible borrowing with competitive rates",
    zh: "灵活借贷，优惠利率",
  },
  "Over-collateralized, reducing risk of bad debt.": {
    en: "Over-collateralized for maximum security",
    zh: "超额抵押，最大安全保障",
  },
  "Transparent interest rates and liquidation rules.": {
    en: "Transparent rates and instant access",
    zh: "透明利率，即时到账",
  },
  FAQ: { en: "FAQ", zh: "常见问题" },
  "Is my asset safe?": { en: "Is my asset safe?", zh: "我的资产安全吗？" },
  "All operations are non-custodial and on-chain. You always control your assets.":
    {
      en: "All operations are non-custodial and on-chain. You always control your assets.",
      zh: "所有操作均为非托管且链上执行，资产始终归您所有。",
    },
  "How is the interest rate determined?": {
    en: "How is the interest rate determined?",
    zh: "利率如何决定？",
  },
  "Interest rates are dynamically adjusted based on market supply and demand.":
    {
      en: "Interest rates are dynamically adjusted based on market supply and demand.",
      zh: "利率根据市场供需动态调整。",
    },
  "What happens if my collateral value drops?": {
    en: "What happens if my collateral value drops?",
    zh: "如果我的抵押品价值下跌会怎样？",
  },
  "If your collateral value falls below the liquidation threshold, your position may be liquidated to protect the protocol.":
    {
      en: "If your collateral value falls below the liquidation threshold, your position may be liquidated to protect the protocol.",
      zh: "如果抵押品价值低于清算阈值，您的仓位可能会被清算以保护协议安全。",
    },

  //个人中心
  Dashboard: { en: "Dashboard", zh: "个人中心" },
  "Total Earned": { en: "Total Earned", zh: "总收益" },
  "Total Borrowed": { en: "Total Borrowed", zh: "总借贷" },
  "My Earn Positions": { en: "My Earn Positions", zh: "我的收益仓位" },
  "My Borrow Positions": { en: "My Borrow Positions", zh: "我的借贷仓位" },
  Asset: { en: "Asset", zh: "资产" },
  Amount: { en: "Amount", zh: "数量" },
  APY: { en: "APY", zh: "年化收益率" },
  Earned: { en: "Earned", zh: "已赚取" },
  Rate: { en: "Rate", zh: "利率" },
  "Health Factor": { en: "Health Factor", zh: "健康因子" },
  no_earn_positions: { en: "No earn positions yet", zh: "暂无收益仓位" },
  no_borrow_positions: { en: "No borrow positions yet", zh: "暂无借贷仓位" },

  // MigratePage 教程页面翻译
  earn_description: {
    en: "When you deposit BTC into the BLend protocol, your assets are borrowed by borrowers who pay interest. The protocol distributes this interest, after deducting platform fees, proportionally to all liquidity providers. You become a 'crypto world lender'.",
    zh: '当你把 BTC 存入 BLend 协议时，你的资产会被借款人借走，并支付利息。协议会把这些利息，扣除平台费用后，按比例分配给所有流动性提供者。你等于成为了"加密世界的放贷人"。',
  },
  step1_title: { en: "Identity Verification", zh: "身份验证" },
  step1_description: {
    en: "Open the BLend website and click on identity verification.",
    zh: "打开 BLend 官网，点击身份验证。",
  },
  step2_title: { en: "Deposit Operation", zh: "存款操作" },
  step2_description: {
    en: "On the 'Earn' page, multiple vault options appear. Choose the amount of BTC you want to deposit, then click the 'Deposit' button.",
    zh: "在「收益」页面，出现多种金库选择，选择你要存入的 BTC 数量，然后点击「存入」按钮。",
  },
  step3_title: { en: "Earn Interest", zh: "赚取利息" },
  step3_description: {
    en: "Once successfully deposited, your BTC will automatically start earning interest without any additional operations.",
    zh: "一旦成功存入，你的 BTC 将自动开始计息，无需任何额外操作。",
  },
  step4_title: { en: "Earnings Information", zh: "收益信息" },
  step4_description: {
    en: "In your personal center, you can view your principal and accumulated interest in real-time. Interest is settled daily and displayed together with the principal.",
    zh: "在个人中心，你可以实时查看你的本金与已累积的利息。利息每日结算，并与本金一同显示。",
  },
  step5_title: { en: "Earnings Settlement", zh: "收益到账" },
  step5_description: {
    en: "You can withdraw your principal and interest at any time. For large amounts, the system will automatically enable 'gradual withdrawal' to ensure pool stability.",
    zh: "你可以随时将本金与利息一并提取，若金额较大，系统将自动启用「缓取机制」分批到账，以保障池子稳定。",
  },
  borrow_description: {
    en: "You can use your BTC as collateral to borrow USDT (or other assets) for trading, investing in new projects, or capturing market opportunities — while your BTC remains safely in the protocol.",
    zh: "你可以用自己的 BTC 作为抵押，借出 USDT（或其他资产）来使用，例如参与交易、投资新项目、抓住行情机会 —— 而你的 BTC 安然无恙地躺在协议中。",
  },
  borrow_step1_title: { en: "Identity Verification", zh: "身份验证" },
  borrow_step1_description: {
    en: "Click to connect identity verification.",
    zh: "点击连接身份验证",
  },
  borrow_step2_title: { en: "Borrowing Collateral", zh: "借贷抵押" },
  borrow_step2_description: {
    en: "Go to the 'Borrow' page, select collateral assets (ICP, BTC, ETH, USDC), set the amount you want to collateralize and submit.",
    zh: "前往「借贷」页面，选择抵押资产（ICP、BTC、ETH、USDC），设定你想要抵押的数量并提交。",
  },
  borrow_step3_title: { en: "Borrowing Operation", zh: "借贷操作" },
  borrow_step3_description: {
    en: "On the 'Borrow' page, based on your collateral, the system will show you the maximum amount you can borrow. Choose the borrowing amount and click 'Confirm Borrow'.",
    zh: "在「借贷」页面，根据你的抵押资产，系统会提示你最多可以借出多少资产。选择借出金额，点击「确认借出」。",
  },
  borrow_step4_title: { en: "Borrowing Details", zh: "借贷明细" },
  borrow_step4_description: {
    en: "On the 'Personal Center' page, you can view in real-time: Current total debt (including interest), Health factor (representing account liquidation risk), Cumulative interest growth (updated daily)",
    zh: "在「个人中心」页面，你可以实时查看：当前欠款总额（含利息）、健康因子（代表账户清算风险）、累计利息增长情况（每日更新）",
  },
  borrow_step5_title: { en: "Borrowing Settlement", zh: "借贷结清" },
  borrow_step5_description: {
    en: "You can repay partially or in full at any time. After repayment, the collateralized assets will be automatically unlocked and can be withdrawn.",
    zh: "随时可以部分或全部还款。还清后，抵押的资产将自动解锁并可提取。",
  },

  // 品牌相关
  app_name: { en: "BLend", zh: "BLend" },
  app_subtitle: {
    en: "Decentralized Bitcoin Finance on BLend",
    zh: "基于 BLend 的去中心化比特币金融",
  },
  loan: { en: "Loan", zh: "借贷资产" },
  total_market_size: { en: "Total Market Size", zh: "总市场规模" },
  total_liquidity: { en: "Total Liquidity", zh: "总流动性" },
  rate: { en: "Rate", zh: "利率" },
  vault_listing: { en: "Vault Listing", zh: "金库列表" },
  page: { en: "Page", zh: "第" },
  of: { en: "of", zh: "页，共" },
  active_liquidity: { en: "Active", zh: "活跃流动性" },
  no_supply_cap: { en: "-", zh: "-" },
  risk_analysis_coming_soon: {
    en: "Risk analysis coming soon",
    zh: "风险分析即将上线",
  },
  activity_history_coming_soon: {
    en: "Activity history coming soon",
    zh: "活动历史即将上线",
  },
  projected_earnings_placeholder: { en: "$0", zh: "¥0" },
  apy_increase: { en: "↗", zh: "↗" },
  markets_tab: { en: "Markets", zh: "市场" },
  vaults_tab: { en: "Vaults", zh: "金库" },
  more_tab: { en: "More", zh: "更多" },

  // 代币余额相关
  token_balances: { en: "Token Balances", zh: "代币余额" },
  supported_tokens: { en: "Supported Tokens", zh: "支持的代币类型" },
  add_custom_token: { en: "Add Custom Token", zh: "添加自定义代币" },
  custom_token_note: {
    en: "Support any ICRC-1 standard token",
    zh: "支持任意ICRC-1标准代币",
  },
  coming_soon: { en: "Coming Soon", zh: "即将推出" },
  balance_update_note: {
    en: "Balances update in real-time, click refresh to get latest data",
    zh: "余额实时更新，点击刷新按钮获取最新数据",
  },
  refresh: { en: "Refresh", zh: "刷新" },
  refresh_token_balance: { en: "Refresh Token Balance", zh: "刷新代币余额" },
  recharge_instructions_title: { en: "Recharge Instructions", zh: "充值说明" },

  // 代币信息
  token_name: { en: "Token Name", zh: "代币名称" },
  token_symbol: { en: "Token Symbol", zh: "代币符号" },
  token_canister_id: { en: "Token Canister ID", zh: "代币Canister ID" },
  get_token_info: { en: "Get Token Info", zh: "获取代币信息" },
  add_token: { en: "Add Token", zh: "添加代币" },
  adding_token: { en: "Adding Token...", zh: "添加代币中..." },
  token_added_success: {
    en: "Token added successfully!",
    zh: "代币添加成功！",
  },
  token_info_fetched: {
    en: "Token info fetched successfully!",
    zh: "代币信息获取成功！",
  },
  please_fill_all_fields: {
    en: "Please fill all required fields",
    zh: "请填写所有必填字段",
  },
  please_enter_canister_id: {
    en: "Please enter Canister ID",
    zh: "请输入Canister ID",
  },
  failed_to_add_token: {
    en: "Failed to add token, please check if Canister ID is correct",
    zh: "添加失败，请检查Canister ID是否正确",
  },
  failed_to_fetch_token_info: {
    en: "Failed to fetch token info, please check if Canister ID is correct",
    zh: "无法获取代币信息，请检查Canister ID是否正确",
  },
  custom_token: { en: "Custom Token", zh: "自定义代币" },

  // 代币类型描述
  icp_description: { en: "Internet Computer Protocol", zh: "互联网计算机协议" },
  ckbtc_description: { en: "Chain-key Bitcoin", zh: "链密钥比特币" },
  cketh_description: { en: "Chain-key Ethereum", zh: "链密钥以太坊" },
  sns1_description: { en: "SNS Governance Token", zh: "SNS治理代币" },

  // 自定义代币添加说明
  custom_token_instructions: { en: "Instructions:", zh: "说明:" },
  custom_token_support: {
    en: "• Support any ICRC-1 standard token",
    zh: "• 支持任意ICRC-1标准代币",
  },
  custom_token_auto_fetch: {
    en: "• Enter Canister ID to automatically fetch token info",
    zh: "• 输入Canister ID后可以自动获取代币信息",
  },
  custom_token_display: {
    en: "• Added tokens will appear in balance list",
    zh: "• 添加的代币会显示在余额列表中",
  },
  custom_token_refresh: {
    en: "• Can refresh balance data anytime",
    zh: "• 可以随时刷新余额数据",
  },

  // 余额查询
  query_balance: { en: "Query Balance", zh: "查询余额" },
  querying_balance: { en: "Querying Balance...", zh: "查询余额中..." },
  balance_query_failed: { en: "Balance query failed", zh: "余额查询失败" },
  user_not_authenticated: {
    en: "Please connect Internet Identity first",
    zh: "请先连接互联网身份",
  },

  // 示例文本
  example_canister_id: {
    en: "e.g.: ryjl3-tyaaa-aaaaa-aaaba-cai",
    zh: "例如: ryjl3-tyaaa-aaaaa-aaaba-cai",
  },
  example_token_name: {
    en: "e.g.: My Custom Token",
    zh: "例如: My Custom Token",
  },
  example_token_symbol: { en: "e.g.: MCT", zh: "例如: MCT" },
  disclosures: { en: "Disclosures", zh: "披露" },
  recharge_instructions: {
    zh: `充值说明：\n1. 通过交易所转账：登录支持 ICP 的交易所（如 Coinbase、Binance、Kraken），购买 ICP 后，在“提币”页面粘贴您的 Account ID 作为接收地址，输入金额并确认（通常需支付 0.0001 ICP 手续费）。\n2. 通过钱包转账：打开支持 ICP 的钱包（如 Plug、Stoic、NNS），在“发送”或“转账”页面粘贴 Account ID，输入金额并确认（可能需支付 0.0001 ICP 网络费）。\n提示：到账时间一般为几分钟，具体取决于交易所或钱包处理速度。`,
    en: `How to Recharge ICP to Your Account ID:\n1. From Exchange: Log in to an exchange that supports ICP (e.g. Coinbase, Binance, Kraken). Buy ICP, go to the "Withdraw" page, paste your Account ID as the recipient address, enter the amount, and confirm (a small withdrawal fee, usually 0.0001 ICP, applies).\n2. From Wallet: Open a wallet that supports ICP (e.g. Plug, Stoic, or NNS). On the "Send" or "Transfer" page, paste your Account ID, enter the amount, and confirm (a network fee of about 0.0001 ICP may apply).\nTip: Transfers usually arrive within a few minutes, depending on the exchange or wallet processing speed.`,
  },
};

// 创建上下文
const LanguageContext = createContext<any>(null);

// Provider组件
export const LanguageProvider = ({ children }: React.PropsWithChildren<{}>) => {
  // 初始化时从localStorage读取
  const [language, setLanguage] = useState<Language>(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("language") : null;
    return stored === "en" || stored === "zh" ? stored : "en";
  });
  // 切换语言时写入localStorage
  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === "en" ? "zh" : "en";
      if (typeof window !== "undefined") localStorage.setItem("language", next);
      return next;
    });
  }, []);
  const setSpecificLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    if (typeof window !== "undefined") localStorage.setItem("language", lang);
  }, []);
  const t = useCallback(
    (key: string): string => {
      const translation = translations[key];
      if (!translation) {
        console.warn(`Translation key "${key}" not found`);
        return key;
      }
      return translation[language];
    },
    [language],
  );
  const isZh = language === "zh";
  const isEn = language === "en";
  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        setLanguage: setSpecificLanguage,
        t,
        isZh,
        isEn,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// useLanguage钩子
export const useLanguage = () => useContext(LanguageContext);
