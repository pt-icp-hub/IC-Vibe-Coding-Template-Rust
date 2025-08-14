// 市场列表项组件
// Market list item component for the borrow page

import { MarketPair } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";

// 组件属性接口
interface MarketListItemProps {
  market: MarketPair;
  onSelect: (market: MarketPair) => void;
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

// 市场列表项主组件
export const MarketListItem = ({ market, onSelect }: MarketListItemProps) => {
  const { t } = useLanguage();

  return (
    <div
      className="grid cursor-pointer grid-cols-12 items-center gap-4 rounded-lg border border-gray-200/50 bg-white/70 px-4 py-4 shadow-sm backdrop-blur-md transition-colors hover:bg-white/90 dark:border-gray-700/50 dark:bg-gray-800/70 dark:hover:bg-gray-700/90"
      onClick={() => onSelect(market)}
    >
      {/* 抵押品 */}
      <div className="col-span-2 flex items-center space-x-3">
        <div className="flex h-8 w-8 items-center justify-center text-2xl">
          {market.collateral.icon}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {market.collateral.symbol}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {market.collateral.name}
          </p>
        </div>
      </div>

      {/* 借贷资产 */}
      <div className="col-span-2 flex items-center space-x-3">
        <div className="flex h-8 w-8 items-center justify-center text-2xl">
          {market.loan.icon}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {market.loan.symbol}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {market.loan.name}
          </p>
        </div>
      </div>

      {/* LLTV */}
      <div className="col-span-1">
        <p className="font-medium text-gray-800 dark:text-gray-200">
          {(market.lltv * 100).toFixed(1)}%
        </p>
      </div>

      {/* 总市场规模 */}
      <div className="col-span-2">
        <p className="font-medium text-gray-800 dark:text-gray-200">
          {formatCurrency(market.totalMarketSize, true)}
        </p>
      </div>

      {/* 总流动性 */}
      <div className="col-span-2">
        <p className="font-medium text-gray-800 dark:text-gray-200">
          {formatCurrency(market.totalLiquidity, true)}
        </p>
      </div>

      {/* 借贷利率 */}
      <div className="col-span-1">
        <p className="font-medium text-green-600 dark:text-green-400">
          {market.borrowRate.toFixed(2)}%
        </p>
      </div>

      {/* 金库列表 */}
      <div className="col-span-2 text-right">
        <div className="flex flex-col space-y-1">
          {market.vaults.slice(0, 2).map((vault) => (
            <div
              key={vault.id}
              className="flex items-center justify-end space-x-2"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {vault.supplyShare.toFixed(1)}%
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm dark:bg-gray-600">
                {vault.curatorIcon}
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {vault.name}
              </span>
            </div>
          ))}
          {market.vaults.length > 2 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              +{market.vaults.length - 2} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
