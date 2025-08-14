// 借贷页面组件 - 重构为市场列表视图
// Borrow page component - refactored to a market list view

import { useState, useEffect } from "react";
import { MarketPair, BTCAsset, Token } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { MarketListItem } from "../components/Borrow/MarketListItem";

// 组件属性接口
interface BorrowPageProps {
  walletAddress: string | null; // 钱包地址
  onSelectMarket: (market: MarketPair) => void; // 选择市场后的回调
}

// 模拟的非BTC资产数据
const mockTokens: { [key: string]: Token } = {
  USDC: {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    icon: "💵",
    price: 1.0,
  },
  USDT: { id: "usdt", symbol: "USDT", name: "Tether", icon: "💲", price: 1.0 },
  DAI: {
    id: "dai",
    symbol: "DAI",
    name: "Dai Stablecoin",
    icon: "🪙",
    price: 1.0,
  },
};

// 模拟的BTC资产数据
const mockBtcAssets: { [key: string]: BTCAsset } = {
  cbBTC: {
    id: "cbbtc",
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    icon: "🔵",
    price: 67520,
    balance: 0.2,
    supplyApy: 4.5,
    borrowApy: 6.5,
    tvl: 45000000,
    supplied: 0.05,
    borrowed: 0.01,
    collateralFactor: 70,
    liquidationThreshold: 75,
    utilization: 65,
    priceChange24h: 2.4,
  },
  wstETH: {
    id: "wsteth",
    symbol: "wstETH",
    name: "Lido Wrapped Staked ETH",
    icon: "💧",
    price: 3500,
    balance: 10,
    supplyApy: 3.5,
    borrowApy: 4.5,
    tvl: 500000000,
    supplied: 2,
    borrowed: 1,
    collateralFactor: 85,
    liquidationThreshold: 90,
    utilization: 75,
    priceChange24h: 1.5,
  },
  // ... 其他BTC资产
};

// 借贷页面主组件
export const BorrowPage = ({
  walletAddress,
  onSelectMarket,
}: BorrowPageProps) => {
  // 多语言Hook
  const { t } = useLanguage();

  // 市场列表状态
  const [markets, setMarkets] = useState<MarketPair[]>([]);

  // 筛选文本状态
  const [filter, setFilter] = useState("");

  // 初始化市场数据
  useEffect(() => {
    // 模拟市场交易对数据，以匹配截图
    const mockMarkets: MarketPair[] = [
      {
        id: "1",
        collateral: mockBtcAssets.cbBTC,
        loan: mockTokens.USDC,
        lltv: 0.86,
        totalMarketSize: 59965000,
        totalLiquidity: 5964000,
        borrowRate: 5.44,
        vaults: [
          {
            id: "v1",
            name: "SparkDAO",
            curator: "SparkDAO",
            curatorIcon: "⚡️",
            allocation: 50270000,
            supplyShare: 81.76,
          },
        ],
        creatorIcon: "S",
      },
      {
        id: "2",
        collateral: mockBtcAssets.wstETH,
        loan: { ...mockBtcAssets.wstETH, symbol: "WETH" }, // 这里简化处理，实际应为WETH
        lltv: 0.945,
        totalMarketSize: 12040000,
        totalLiquidity: 1651000,
        borrowRate: 2.52,
        vaults: [
          {
            id: "v2",
            name: "Morpho",
            curator: "Morpho",
            curatorIcon: "🦋",
            allocation: 10000000,
            supplyShare: 80,
          },
          {
            id: "v3",
            name: "Aave",
            curator: "Aave",
            curatorIcon: "👻",
            allocation: 2040000,
            supplyShare: 20,
          },
        ],
        creatorIcon: "M",
      },
      // ...可以添加更多市场数据
    ];
    setMarkets(mockMarkets);
  }, []);

  // 根据筛选文本过滤市场
  const filteredMarkets = markets.filter(
    (market) =>
      market.collateral.symbol.toLowerCase().includes(filter.toLowerCase()) ||
      market.loan.symbol.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    // 页面主容器
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 pt-24 pb-12 dark:from-gray-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
            {t("page_borrow_title")}
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-400">
            {t("page_borrow_subtitle")}
          </p>
        </div>

        {/* 连接钱包提示 */}
        {/* {!walletAddress && (
          <div className="mb-8 text-center">
            <button className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl active:scale-95">
              {t("connect_wallet")}
            </button>
          </div>
        )} */}

        {/* 市场列表容器 */}
        <div className="rounded-3xl border border-gray-200/50 bg-white/50 p-4 shadow-xl backdrop-blur-2xl sm:p-6 dark:border-gray-700/50 dark:bg-gray-800/50">
          {/* 筛选和操作栏 */}
          <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center space-x-2">
              <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow dark:bg-white dark:text-gray-900">
                Collateral: All
              </button>
              <button className="rounded-lg bg-gray-100/70 px-4 py-2 text-sm font-medium text-gray-600 dark:bg-gray-700/70 dark:text-gray-300">
                Loan: All
              </button>
            </div>
            <div className="relative w-full sm:w-64">
              <svg
                className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={t("Filter markets")}
                className="w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pr-4 pl-10 text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900/70 dark:text-white"
              />
            </div>
          </div>

          {/* 列表头部 */}
          <div className="grid grid-cols-12 gap-4 border-b border-gray-200/70 px-4 pb-3 text-xs font-medium text-gray-500 dark:border-gray-700/70 dark:text-gray-400">
            <div className="col-span-2">{t("collateral")}</div>
            <div className="col-span-2">{t("loan")}</div>
            <div className="col-span-1">LLTV</div>
            <div className="col-span-2">
              {t("total_market_size") || "Total Market Size"}
            </div>
            <div className="col-span-2">
              {t("total_liquidity") || "Total Liquidity"}
            </div>
            <div className="col-span-1">{t("rate") || "Rate"}</div>
            <div className="col-span-2 text-right">
              {t("vault_listing") || "Vault Listing"}
            </div>
          </div>

          {/* 市场列表 */}
          <div className="mt-2 space-y-2">
            {filteredMarkets.length > 0 ? (
              filteredMarkets.map((market) => (
                <MarketListItem
                  key={market.id}
                  market={market}
                  onSelect={onSelectMarket}
                />
              ))
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium">{t("no_markets_found")}</p>
                <p>{t("try_adjusting_market_filters")}</p>
              </div>
            )}
          </div>

          {/* 分页控制 */}
          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <button className="cursor-not-allowed rounded-lg bg-gray-100/70 p-2 text-gray-500 dark:bg-gray-700/70 dark:text-gray-400">
                <svg
                  className="h-5 w-5"
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
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Page 1 of 12
              </span>
              <button className="rounded-lg bg-gray-100/70 p-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700/70 dark:text-gray-300 dark:hover:bg-gray-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
