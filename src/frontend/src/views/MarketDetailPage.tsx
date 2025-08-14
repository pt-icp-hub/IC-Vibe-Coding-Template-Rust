// 市场详情页组件
// Market detail page component

import { MarketPair, Vault } from "../types";
import { useLanguage } from "../hooks/useLanguage";

// 组件属性接口
interface MarketDetailPageProps {
  market: MarketPair; // 当前市场数据
  onBack: () => void; // 返回列表页的回调
  isAuthenticated: boolean; // 新增
}

// 格式化数字为易读的货币格式
const formatCurrency = (amount: number, compact = false) => {
  if (compact) {
    if (amount >= 1_000_000_000)
      return `$${(amount / 1_000_000_000).toFixed(2)}B`;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// 市场详情页主组件
export const MarketDetailPage = ({
  market,
  onBack,
  isAuthenticated,
}: MarketDetailPageProps) => {
  // 多语言Hook
  const { t } = useLanguage();

  return (
    // 页面主容器，带动画效果
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 pt-20 dark:from-gray-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="mb-8">
          {/* 返回按钮 */}
          <button
            onClick={onBack}
            className="mb-4 flex items-center space-x-2 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>{t("Back to Markets")}</span>
          </button>

          {/* 市场标题 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center -space-x-2">
              <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-4xl shadow-md dark:bg-gray-800">
                {market.collateral.icon}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-4xl shadow-md dark:bg-gray-800">
                {market.loan.icon}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
                {market.collateral.symbol} / {market.loan.symbol}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{market.collateral.name}</span>
                <span>/</span>
                <span>{market.loan.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容网格布局 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 左侧和中间部分 (占2/3) */}
          <div className="space-y-8 lg:col-span-2">
            {/* 关键统计数据 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <StatCard
                title={t("Total Market Size")}
                value={formatCurrency(market.totalMarketSize, true)}
              />
              <StatCard
                title={t("Total Liquidity")}
                value={formatCurrency(market.totalLiquidity, true)}
              />
              <StatCard
                title={t("Borrow Rate")}
                value={`${market.borrowRate.toFixed(2)}%`}
                color="text-green-500"
              />
              <StatCard
                title={t("Trusted By")}
                icons={market.trustedBy || []}
              />
            </div>

            {/* 图表区域 */}
            <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-6 shadow-lg backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/60">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Total Borrow (USD)
              </h3>
              <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700/50">
                <p className="text-gray-500">📈 Chart placeholder</p>
              </div>
            </div>

            {/* 金库列表 */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Vaults Listing The Market
              </h3>
              <div className="space-y-3">
                {market.vaults.map((vault) => (
                  <VaultListItem key={vault.id} vault={vault} />
                ))}
              </div>
            </div>
          </div>

          {/* 右侧操作面板 (占1/3) */}
          <div className="space-y-6 lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-gray-200/50 bg-white/60 p-6 shadow-lg backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/60">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Actions
                </h3>

                {/* 供应抵押品 */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Supply Collateral {market.collateral.symbol}
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 transition focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900/80"
                  />
                </div>

                {/* 借贷 */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Borrow {market.loan.symbol}
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 transition focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900/80"
                  />
                </div>

                <button className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl active:scale-95">
                  {isAuthenticated ? t("confirm") : t("authenticate")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 统计卡片子组件
const StatCard = ({
  title,
  value,
  icons,
  color,
}: {
  title: string;
  value?: string;
  icons?: string[];
  color?: string;
}) => (
  <div className="rounded-xl border border-gray-200/50 bg-white/60 p-4 shadow-sm backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/60">
    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">{title}</p>
    {value && (
      <p
        className={`text-2xl font-bold text-gray-900 dark:text-white ${color}`}
      >
        {value}
      </p>
    )}
    {icons && (
      <div className="mt-2 flex items-center space-x-2">
        {icons.map((icon, index) => (
          <div
            key={index}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs"
          >
            {icon}
          </div>
        ))}
      </div>
    )}
  </div>
);

// 金库列表项子组件
const VaultListItem = ({ vault }: { vault: Vault }) => (
  <div className="grid grid-cols-12 items-center gap-4 rounded-lg bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md transition-colors hover:bg-white/90 dark:bg-gray-800/70 dark:hover:bg-gray-700/90">
    <div className="col-span-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-lg dark:bg-gray-600">
      {vault.curatorIcon}
    </div>
    <div className="col-span-4">
      <p className="font-semibold text-gray-900 dark:text-white">
        {vault.name}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {vault.curator}
      </p>
    </div>
    <div className="col-span-4 text-left">
      <p className="font-medium text-gray-800 dark:text-gray-200">
        {formatCurrency(vault.allocation)}
      </p>
    </div>
    <div className="col-span-3 text-right">
      <p className="font-medium text-gray-800 dark:text-gray-200">
        {vault.supplyShare.toFixed(2)}%
      </p>
    </div>
  </div>
);
