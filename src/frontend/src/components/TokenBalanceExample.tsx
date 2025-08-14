// 代币余额查询使用示例
// Token Balance Query Usage Example

import React, { useState } from "react";
import { internetIdentityService } from "../services/InternetIdentityService";
import { TOKEN_CANISTER_IDS } from "../services/TokenBalanceService";
import { useLanguage } from "../hooks/useLanguage";

export const TokenBalanceExample: React.FC = () => {
  const { t } = useLanguage();
  const [customCanisterId, setCustomCanisterId] = useState("");
  const [customBalance, setCustomBalance] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 查询自定义代币余额
  const queryCustomTokenBalance = async () => {
    if (!customCanisterId.trim()) {
      setError(t("please_enter_canister_id"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const principal = internetIdentityService.getCurrentPrincipal();
      if (!principal) {
        throw new Error(t("user_not_authenticated"));
      }

      // 查询余额
      const balance =
        await internetIdentityService.queryCurrentUserBalance(customCanisterId);

      // 获取代币信息
      const tokenInfo =
        await internetIdentityService.getTokenInfo(customCanisterId);

      // 格式化余额
      const formattedBalance = internetIdentityService.formatBalance(
        balance,
        tokenInfo.decimals,
      );

      setCustomBalance(`${formattedBalance} ${tokenInfo.symbol}`);
    } catch (err) {
      console.error("查询自定义代币余额失败:", err);
      setError(err instanceof Error ? err.message : t("balance_query_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {t("custom_token")} {t("query_balance")}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("token_canister_id")}
          </label>
          <input
            type="text"
            value={customCanisterId}
            onChange={(e) => setCustomCanisterId(e.target.value)}
            placeholder={t("example_canister_id")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <button
          onClick={queryCustomTokenBalance}
          disabled={loading}
          className="rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? t("querying_balance") : t("query_balance")}
        </button>

        {error && (
          <div className="rounded bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {customBalance && (
          <div className="rounded bg-green-50 p-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <strong>{t("balance")}:</strong> {customBalance}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          <strong>{t("supported_tokens")}:</strong>
        </p>
        <ul className="mt-1 space-y-1">
          <li>• ICP: {TOKEN_CANISTER_IDS.ICP}</li>
          <li>• ckBTC: {TOKEN_CANISTER_IDS.CKBTC}</li>
          <li>• CKETH: {TOKEN_CANISTER_IDS.CKETH}</li>
          <li>• {t("custom_token_support")}</li>
        </ul>
      </div>
    </div>
  );
};
