// 仪表板组件的属性接口定义
interface DashboardProps {
  totalSupplied: number; // 总供应金额
  totalEarned: number; // 总收益金额
  avgApy: number; // 平均年化收益率
  connectedWallet: string | null; // 连接的钱包地址 (null表示未连接)
}

// 仪表板组件 - 显示用户的投资组合概览和统计信息
export const Dashboard = ({
  totalSupplied,
  totalEarned,
  avgApy,
  connectedWallet,
}: DashboardProps) => {
  // 格式化数字为货币显示格式
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency", // 货币格式
      currency: "USD", // 美元
      minimumFractionDigits: 2, // 最少2位小数
      maximumFractionDigits: 2, // 最多2位小数
    }).format(amount);
  };

  // 统计卡片子组件 - 显示单个统计指标
  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
  }: {
    title: string; // 卡片标题
    value: string; // 主要数值
    subtitle?: string; // 可选的副标题
    icon: string; // 图标 emoji
    color: string; // 文字颜色类名
  }) => (
    // 卡片容器 - 使用毛玻璃效果和悬停动画
    <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/70">
      <div className="flex items-center justify-between">
        <div>
          {/* 标题文本 */}
          <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          {/* 主要数值 - 使用动态颜色 */}
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {/* 副标题 - 可选显示 */}
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {/* 右侧图标 */}
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  // 如果钱包未连接，显示欢迎界面
  if (!connectedWallet) {
    return (
      <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-8 text-center shadow-lg backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/70">
        {/* 欢迎手势图标 */}
        <div className="mb-4 text-6xl">👋</div>

        {/* 欢迎标题 */}
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to BLend
        </h2>

        {/* 欢迎描述 */}
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Connect your wallet to start earning yield on your crypto assets
        </p>

        {/* 功能特色网格 */}
        <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-3">
          {/* 安全性特色卡片 */}
          <div className="rounded-xl bg-blue-50/70 p-4 dark:bg-blue-900/20">
            <div className="mb-2 text-2xl">🔒</div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              Secure
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Built on BLend Protocol for maximum security
            </p>
          </div>

          {/* 高收益特色卡片 */}
          <div className="rounded-xl bg-green-50/70 p-4 dark:bg-green-900/20">
            <div className="mb-2 text-2xl">📈</div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              High Yield
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Earn competitive APY on your digital assets
            </p>
          </div>

          {/* 快速交易特色卡片 */}
          <div className="rounded-xl bg-purple-50/70 p-4 dark:bg-purple-900/20">
            <div className="mb-2 text-2xl">⚡</div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              Fast
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Instant transactions with low fees
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 主要统计卡片网格 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 总供应金额卡片 */}
        <StatCard
          title="Total Supplied"
          value={formatCurrency(totalSupplied)}
          subtitle="Across all markets"
          icon="💰"
          color="text-blue-600 dark:text-blue-400"
        />

        {/* 总收益卡片 */}
        <StatCard
          title="Total Earned"
          value={formatCurrency(totalEarned)}
          subtitle="Lifetime earnings"
          icon="📈"
          color="text-green-600 dark:text-green-400"
        />

        {/* 平均年化收益率卡片 */}
        <StatCard
          title="Average APY"
          value={`${avgApy.toFixed(2)}%`}
          subtitle="Weighted average"
          icon="⚡"
          color="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* 投资组合概览区域 */}
      <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-6 shadow-lg backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/70">
        {/* 标题和实时状态指示器 */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Portfolio Overview
          </h3>
          {/* 实时状态指示器 */}
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Live
            </span>
          </div>
        </div>

        {/* 内容网格 - 图表和快速操作 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 左侧：净值增长图表占位符 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Net Worth Growth
            </h4>
            {/* 图表占位符区域 */}
            <div className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="text-center">
                <div className="mb-2 text-2xl">📊</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chart visualization
                </p>
              </div>
            </div>
          </div>

          {/* 右侧：快速操作按钮组 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Quick Actions
            </h4>
            {/* 快速操作按钮网格 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 供应按钮 */}
              <button className="rounded-lg bg-blue-50 p-3 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30">
                <div className="mb-1 text-xl">📥</div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Supply
                </span>
              </button>

              {/* 提取按钮 */}
              <button className="rounded-lg bg-green-50 p-3 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30">
                <div className="mb-1 text-xl">📤</div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Withdraw
                </span>
              </button>

              {/* 交换按钮 */}
              <button className="rounded-lg bg-purple-50 p-3 transition-colors hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30">
                <div className="mb-1 text-xl">💱</div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Swap
                </span>
              </button>

              {/* 分析按钮 */}
              <button className="rounded-lg bg-orange-50 p-3 transition-colors hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30">
                <div className="mb-1 text-xl">📊</div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Analytics
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
