// 自定义代币添加组件
// Custom Token Adder Component

import React, { useState } from "react";
import { internetIdentityService } from "../services/InternetIdentityService";
import { useLanguage } from "../hooks/useLanguage";

interface CustomToken {
  id: string;
  name: string;
  symbol: string;
  canisterId: string;
  icon: string;
  description: string;
}

interface CustomTokenAdderProps {
  onTokenAdded: (token: CustomToken) => void;
}

export const CustomTokenAdder: React.FC<CustomTokenAdderProps> = ({
  onTokenAdded,
}) => {
  const { t } = useLanguage();
  const [canisterId, setCanisterId] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 验证并添加自定义代币
  const addCustomToken = async () => {
    if (!canisterId.trim() || !tokenName.trim() || !tokenSymbol.trim()) {
      setError(t("please_fill_all_fields"));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 验证代币是否存在
      const tokenInfo = await internetIdentityService.getTokenInfo(canisterId);

      // 创建自定义代币对象
      const customToken: CustomToken = {
        id: `custom_${canisterId}`,
        name: tokenName,
        symbol: tokenSymbol,
        canisterId: canisterId,
        icon: "🪙", // 默认图标
        description: `${t("custom_token")}: ${tokenInfo.name}`,
      };

      // 调用父组件的回调函数
      onTokenAdded(customToken);

      // 清空表单
      setCanisterId("");
      setTokenName("");
      setTokenSymbol("");
      setSuccess(t("token_added_success"));
    } catch (err) {
      console.error("添加自定义代币失败:", err);
      setError(err instanceof Error ? err.message : t("failed_to_add_token"));
    } finally {
      setLoading(false);
    }
  };

  // 自动获取代币信息
  const fetchTokenInfo = async () => {
    if (!canisterId.trim()) {
      setError(t("please_enter_canister_id"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenInfo = await internetIdentityService.getTokenInfo(canisterId);

      // 自动填充代币信息
      setTokenName(tokenInfo.name);
      setTokenSymbol(tokenInfo.symbol);

      setSuccess(t("token_info_fetched"));
    } catch (err) {
      console.error("获取代币信息失败:", err);
      setError(t("failed_to_fetch_token_info"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {t("add_custom_token")}
      </h3>

      <div className="space-y-4">
        {/* Canister ID 输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("token_canister_id")} *
          </label>
          <div className="mt-1 flex space-x-2">
            <input
              type="text"
              value={canisterId}
              onChange={(e) => setCanisterId(e.target.value)}
              placeholder={t("example_canister_id")}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={fetchTokenInfo}
              disabled={loading}
              className="rounded-md bg-gray-500 px-3 py-2 text-sm text-white transition hover:bg-gray-600 disabled:opacity-50"
            >
              {t("get_token_info")}
            </button>
          </div>
        </div>

        {/* 代币名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("token_name")} *
          </label>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder={t("example_token_name")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* 代币符号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("token_symbol")} *
          </label>
          <input
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            placeholder={t("example_token_symbol")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* 添加按钮 */}
        <button
          onClick={addCustomToken}
          disabled={loading}
          className="w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? t("adding_token") : t("add_token")}
        </button>

        {/* 错误提示 */}
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* 成功提示 */}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          <strong>{t("custom_token_instructions")}</strong>
        </p>
        <ul className="mt-1 space-y-1">
          <li>{t("custom_token_support")}</li>
          <li>{t("custom_token_auto_fetch")}</li>
          <li>{t("custom_token_display")}</li>
          <li>{t("custom_token_refresh")}</li>
        </ul>
      </div>
    </div>
  );
};
