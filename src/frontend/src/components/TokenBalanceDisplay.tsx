// 代币余额显示组件
// Token Balance Display Component

import React, { useState, useEffect } from "react";
import { internetIdentityService } from "../services/InternetIdentityService";
import { TOKEN_CANISTER_IDS } from "../services/TokenBalanceService";
import { useLanguage } from "../hooks/useLanguage";

interface TokenBalanceDisplayProps {
  isAuthenticated: boolean;
}

// 代币配置
const SUPPORTED_TOKENS = [
  {
    id: "icp",
    name: "ICP",
    symbol: "ICP",
    canisterId: TOKEN_CANISTER_IDS.ICP,
    color: "orange",
    icon: "🟠",
    descriptionKey: "icp_description",
  },
  {
    id: "ckbtc",
    name: "ckBTC",
    symbol: "ckBTC",
    canisterId: TOKEN_CANISTER_IDS.CKBTC,
    color: "yellow",
    icon: "🟡",
    descriptionKey: "ckbtc_description",
  },
  {
    id: "cketh",
    name: "ckETH",
    symbol: "ckETH",
    canisterId: TOKEN_CANISTER_IDS.CKETH,
    color: "blue",
    icon: "🔵",
    descriptionKey: "cketh_description",
  },
];

export const TokenBalanceDisplay: React.FC<TokenBalanceDisplayProps> = ({
  isAuthenticated,
}) => {
  const { t } = useLanguage();
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [tokenInfos, setTokenInfos] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 查询所有代币余额
  const fetchAllBalances = async () => {
    if (!isAuthenticated) {
      console.log("用户未认证，跳过余额查询");
      return;
    }

    console.log("开始查询所有代币余额...");
    setLoading(true);
    setError(null);

    try {
      const newBalances: Record<string, string> = {};
      const newTokenInfos: Record<string, any> = {};

      // 并行查询所有代币余额
      const balancePromises = SUPPORTED_TOKENS.map(async (token) => {
        try {
          console.log(`查询${token.name}余额...`);
          // 查询余额
          const balance = await internetIdentityService.queryCurrentUserBalance(
            token.canisterId,
          );
          console.log(`${token.name}余额:`, balance);

          // 获取代币信息
          const tokenInfo = await internetIdentityService.getTokenInfo(
            token.canisterId,
          );
          console.log(`${token.name}信息:`, tokenInfo);

          // 格式化余额
          const formattedBalance = internetIdentityService.formatBalance(
            balance,
            tokenInfo.decimals,
          );
          console.log(`${token.name}格式化余额:`, formattedBalance);

          return {
            id: token.id,
            balance: formattedBalance,
            info: tokenInfo,
          };
        } catch (err) {
          console.error(`查询${token.name}余额失败:`, err);
          return {
            id: token.id,
            balance: "0",
            info: { name: token.name, symbol: token.symbol, decimals: 8 },
          };
        }
      });

      const results = await Promise.all(balancePromises);
      console.log("所有代币查询结果:", results);

      results.forEach((result) => {
        newBalances[result.id] = result.balance;
        newTokenInfos[result.id] = result.info;
      });

      setBalances(newBalances);
      setTokenInfos(newTokenInfos);
      console.log("余额更新完成");
    } catch (err) {
      console.error("查询余额失败:", err);
      setError(err instanceof Error ? err.message : "查询余额失败");
    } finally {
      setLoading(false);
    }
  };

  // 查询单个代币余额
  const fetchTokenBalance = async (tokenId: string) => {
    if (!isAuthenticated) {
      console.log("用户未认证，跳过余额查询");
      return;
    }

    const token = SUPPORTED_TOKENS.find((t) => t.id === tokenId);
    if (!token) return;

    console.log(`开始查询${token.name}余额...`);

    // 为单个代币设置加载状态
    setBalances((prev) => ({ ...prev, [tokenId]: "..." }));

    try {
      const balance = await internetIdentityService.queryCurrentUserBalance(
        token.canisterId,
      );
      console.log(`${token.name}余额:`, balance);

      const tokenInfo = await internetIdentityService.getTokenInfo(
        token.canisterId,
      );
      console.log(`${token.name}信息:`, tokenInfo);

      const formattedBalance = internetIdentityService.formatBalance(
        balance,
        tokenInfo.decimals,
      );
      console.log(`${token.name}格式化余额:`, formattedBalance);

      setBalances((prev) => ({ ...prev, [tokenId]: formattedBalance }));
      setTokenInfos((prev) => ({ ...prev, [tokenId]: tokenInfo }));
      console.log(`${token.name}余额更新完成`);

      // 清除错误状态
      setError(null);
    } catch (err) {
      console.error(`查询${token.name}余额失败:`, err);
      // 恢复原来的余额显示
      setBalances((prev) => ({ ...prev, [tokenId]: prev[tokenId] || "0" }));
      setError(
        `查询${token.name}余额失败: ${err instanceof Error ? err.message : "未知错误"}`,
      );
    }
  };

  // 组件挂载时查询余额
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllBalances();
    }
  }, [isAuthenticated]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("token_balances") || "代币余额"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("supported_tokens") || "支持的代币类型"}
            </p>
          </div>
        </div>
        <button
          onClick={fetchAllBalances}
          disabled={loading || !isAuthenticated}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl disabled:opacity-50 disabled:hover:shadow-lg"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>
            {loading ? t("loading") || "加载中..." : t("refresh") || "刷新"}
          </span>
        </button>
      </div>

      {!isAuthenticated && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 p-4 shadow-lg dark:from-yellow-900/20 dark:to-orange-900/20">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30">
              <svg
                className="h-4 w-4 text-yellow-600 dark:text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {t("please_authenticate_to_view_balances")}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 p-4 shadow-lg dark:from-red-900/20 dark:to-pink-900/20">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30">
              <svg
                className="h-4 w-4 text-red-600 dark:text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SUPPORTED_TOKENS.map((token) => (
          <div
            key={token.id}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-slate-800 dark:to-slate-700"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-2xl dark:from-blue-900/30 dark:to-purple-900/30">
                      {token.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {token.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t(token.descriptionKey) || token.descriptionKey}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {!isAuthenticated
                        ? "--"
                        : loading
                          ? "..."
                          : balances[token.id] || "0"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {tokenInfos[token.id]?.symbol || token.symbol}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => fetchTokenBalance(token.id)}
                  disabled={loading || !isAuthenticated}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-slate-100 text-gray-600 transition-all duration-200 hover:from-blue-100 hover:to-purple-100 hover:text-blue-600 disabled:opacity-50 dark:from-gray-700 dark:to-slate-700 dark:text-gray-300 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 dark:hover:text-blue-400"
                  title={`刷新${token.name}余额`}
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 添加自定义代币 */}
      <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50 p-6 dark:border-gray-600 dark:from-gray-800 dark:to-blue-900/20">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-slate-200 dark:from-gray-700 dark:to-slate-700">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h4 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
            {t("add_custom_token") || "添加自定义代币"}
          </h4>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t("custom_token_note") || "支持任意ICRC-1标准代币"}
          </p>
          <button className="mt-3 rounded-xl bg-gradient-to-r from-gray-200 to-slate-200 px-4 py-2 text-xs font-medium text-gray-700 transition-all duration-200 hover:from-gray-300 hover:to-slate-300 dark:from-gray-600 dark:to-slate-600 dark:text-gray-300 dark:hover:from-gray-500 dark:hover:to-slate-500">
            {t("coming_soon") || "即将推出"}
          </button>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        {t("balance_update_note") || "余额实时更新，点击刷新按钮获取最新数据"}
      </div>
    </div>
  );
};
