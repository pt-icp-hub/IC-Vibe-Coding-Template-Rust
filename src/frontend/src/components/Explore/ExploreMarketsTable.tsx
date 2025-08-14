import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "../../hooks/useLanguage";

// mock数据
const mockMarkets = [
  {
    id: "1",
    collateral: { symbol: "cbBTC", icon: "🟦" },
    loan: { symbol: "USDC", icon: "🟦" },
    lltv: 0.86,
    totalLiquidity: 59620000,
    vaults: ["🦋", "⚡", "👻"],
    network: "Polygon",
    marketLiquidity: 59620000,
  },
  {
    id: "2",
    collateral: { symbol: "ETH+", icon: "🟪" },
    loan: { symbol: "WETH", icon: "🟪" },
    lltv: 0.945,
    totalLiquidity: 4571000,
    vaults: ["🦋", "👻"],
    network: "Ethereum",
    marketLiquidity: 13640000,
  },
  // ...更多mock数据
];

const networks = ["All", "Polygon", "Ethereum", "Base", "Unichain", "Katana"];
const collaterals = [
  "All",
  "cbBTC",
  "ETH+",
  "PT-USDS",
  "WBTC",
  "wstETH",
  "RLP",
  "srUSD",
];
const loans = ["All", "USDC", "WETH", "DAI", "USDT", "rUSD"];

export const ExploreMarketsTable = () => {
  const { t } = useLanguage();
  const [network, setNetwork] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("exploreMarketsNetwork") || "All"
      : "All",
  );
  const [collateral, setCollateral] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("exploreMarketsCollateral") || "All"
      : "All",
  );
  const [loan, setLoan] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("exploreMarketsLoan") || "All"
      : "All",
  );
  const [search, setSearch] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("exploreMarketsSearch") || ""
      : "",
  );
  const [sortKey, setSortKey] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("exploreMarketsSortKey") || "totalLiquidity"
      : "totalLiquidity",
  );
  const [sortAsc, setSortAsc] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("exploreMarketsSortAsc") === "true"
      : false,
  );

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("exploreMarketsNetwork", network);
  }, [network]);
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("exploreMarketsCollateral", collateral);
  }, [collateral]);
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("exploreMarketsLoan", loan);
  }, [loan]);
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("exploreMarketsSearch", search);
  }, [search]);
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("exploreMarketsSortKey", sortKey);
  }, [sortKey]);
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("exploreMarketsSortAsc", String(sortAsc));
  }, [sortAsc]);

  // 过滤和排序
  const filtered = useMemo(() => {
    let data = mockMarkets.filter(
      (m) =>
        (network === "All" || m.network === network) &&
        (collateral === "All" || m.collateral.symbol === collateral) &&
        (loan === "All" || m.loan.symbol === loan) &&
        (m.collateral.symbol.toLowerCase().includes(search.toLowerCase()) ||
          m.loan.symbol.toLowerCase().includes(search.toLowerCase())),
    );
    data = [...data].sort((a, b) => {
      if (sortKey === "lltv")
        return sortAsc ? a.lltv - b.lltv : b.lltv - a.lltv;
      if (sortKey === "totalLiquidity")
        return sortAsc
          ? a.totalLiquidity - b.totalLiquidity
          : b.totalLiquidity - a.totalLiquidity;
      return 0;
    });
    return data;
  }, [network, collateral, loan, search, sortKey, sortAsc]);

  return (
    <div className="rounded-3xl border border-gray-200/50 bg-white/50 p-4 shadow-xl backdrop-blur-2xl sm:p-6 dark:border-gray-700/50 dark:bg-gray-800/50">
      {/* 筛选栏 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          {networks.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          value={collateral}
          onChange={(e) => setCollateral(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          {collaterals.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          value={loan}
          onChange={(e) => setLoan(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          {loans.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("filter_markets") || "Filter markets"}
          className="ml-auto w-48 rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      {/* 表格头部 */}
      <div className="grid grid-cols-12 gap-4 border-b border-gray-200/70 px-4 pb-3 text-xs font-medium text-gray-500 dark:border-gray-700/70 dark:text-gray-400">
        <div
          className="col-span-2 cursor-pointer"
          onClick={() => {
            setSortKey("collateral");
            setSortAsc(!sortAsc);
          }}
        >
          {t("collateral")}
        </div>
        <div
          className="col-span-2 cursor-pointer"
          onClick={() => {
            setSortKey("loan");
            setSortAsc(!sortAsc);
          }}
        >
          {t("loan")}
        </div>
        <div
          className="col-span-1 cursor-pointer"
          onClick={() => {
            setSortKey("lltv");
            setSortAsc(!sortAsc);
          }}
        >
          LLTV
        </div>
        <div
          className="col-span-2 cursor-pointer"
          onClick={() => {
            setSortKey("totalLiquidity");
            setSortAsc(!sortAsc);
          }}
        >
          {t("total_liquidity")}
        </div>
        <div className="col-span-2">{t("vault_listing")}</div>
        <div className="col-span-2">{t("network") || "Network"}</div>
        <div className="col-span-1">
          {t("market_liquidity") || "Market Liquidity"}
        </div>
      </div>
      {/* 表格内容 */}
      <div className="mt-2 space-y-2">
        {filtered.length > 0 ? (
          filtered.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-12 items-center gap-4 rounded-lg bg-white/70 px-4 py-3 shadow-sm transition-colors hover:bg-white/90 dark:bg-gray-800/70 dark:hover:bg-gray-700/90"
            >
              <div className="col-span-2 flex items-center space-x-2">
                <span>{m.collateral.icon}</span>
                <span>{m.collateral.symbol}</span>
              </div>
              <div className="col-span-2 flex items-center space-x-2">
                <span>{m.loan.icon}</span>
                <span>{m.loan.symbol}</span>
              </div>
              <div className="col-span-1">{(m.lltv * 100).toFixed(2)}%</div>
              <div className="col-span-2">
                ${(m.totalLiquidity / 1e6).toFixed(2)}M
              </div>
              <div className="col-span-2 flex space-x-1">
                {m.vaults.map((v, i) => (
                  <span key={i}>{v}</span>
                ))}
              </div>
              <div className="col-span-2">{m.network}</div>
              <div className="col-span-1">
                ${(m.marketLiquidity / 1e6).toFixed(2)}M
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">
              {t("no_markets_found") || "No markets found."}
            </p>
            <p>
              {t("try_adjusting_market_filters") ||
                "Try adjusting your filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
