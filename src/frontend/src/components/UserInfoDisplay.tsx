// 用户信息显示组件
// User information display component

import React, { useState } from "react";
import { Principal } from "@dfinity/principal";
import { useLanguage } from "../hooks/useLanguage";
import { UserInfo } from "../services/InternetIdentityService";
import { internetIdentityService } from "../services/InternetIdentityService";
import bitcoinLogo from "../assets/btc1.png";

// 移除旧的 accountIdentifierFromPrincipal 函数
// 移除 sha224 和 toHex 函数

function mask(str: string) {
  if (str.length <= 8) return str;
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
}

interface UserInfoDisplayProps {
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  principal: any;
  onUserInfoUpdate?: (updatedUserInfo: UserInfo) => void;
}

export const UserInfoDisplay = ({
  userInfo,
  isAuthenticated,
  principal,
  onUserInfoUpdate,
}: UserInfoDisplayProps) => {
  const { t } = useLanguage();
  const [showBalanceManager, setShowBalanceManager] = useState(false);
  const [showPrincipal, setShowPrincipal] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [accountId, setAccountId] = React.useState<string>("-");
  const [copyFeedback, setCopyFeedback] = useState<{
    type: "principal" | "account" | null;
    message: string;
  }>({ type: null, message: "" });
  const [showRechargeTip, setShowRechargeTip] = useState(false);

  // 使用推荐的 TokenBalanceService.generateAccountId 方法
  React.useEffect(() => {
    const generateAccountId = async () => {
      try {
        if (!principal) {
          setAccountId("-");
          return;
        }

        // 使用推荐的 TokenBalanceService 方法
        const tokenBalanceService =
          internetIdentityService.ensureTokenBalanceService();
        const id = await tokenBalanceService.generateAccountId(principal);
        setAccountId(id);
      } catch (error) {
        console.error("生成Account ID失败:", error);
        setAccountId("生成失败");
      }
    };

    generateAccountId();
  }, [principal]);

  // 复制到剪贴板并显示反馈
  const copyToClipboard = async (
    text: string,
    type: "principal" | "account",
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback({ type, message: "复制成功！" });
      // 3秒后清除反馈
      setTimeout(() => {
        setCopyFeedback({ type: null, message: "" });
      }, 3000);
    } catch (error) {
      console.error("复制失败:", error);
      setCopyFeedback({ type, message: "复制失败，请手动复制" });
      setTimeout(() => {
        setCopyFeedback({ type: null, message: "" });
      }, 3000);
    }
  };

  const formatPrincipal = (principal: any) => {
    if (!isAuthenticated || !principal) return "-";
    const principalText = principal.toText();
    return `${principalText.slice(0, 6)}...${principalText.slice(-4)}`;
  };

  // 使用默认数据或用户数据
  const displayUserInfo = {
    username: isAuthenticated && userInfo?.username ? userInfo.username : "-",
    ckbtc_balance:
      isAuthenticated && userInfo?.ckbtc_balance ? userInfo.ckbtc_balance : 0,
    total_earned:
      isAuthenticated && userInfo?.total_earned ? userInfo.total_earned : 0,
    total_borrowed:
      isAuthenticated && userInfo?.total_borrowed ? userInfo.total_borrowed : 0,
    created_at:
      isAuthenticated && userInfo?.created_at ? userInfo.created_at : BigInt(0),
    recent_activities: [],
  };

  // 处理余额更新
  const handleBalanceUpdate = (newBalance: number) => {
    if (onUserInfoUpdate && userInfo) {
      const updatedUserInfo = {
        ...userInfo,
        ckbtc_balance: newBalance,
      };
      onUserInfoUpdate(updatedUserInfo);
    }
  };

  return (
    <div className="space-y-6">
      {/* 用户信息头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center">
            <img src={bitcoinLogo} alt="Bitcoin Logo" className="h-12 w-12" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("user_info")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {displayUserInfo.username}
            </p>
          </div>
        </div>

        {/* 认证状态 */}
        <div className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 dark:from-green-900/20 dark:to-emerald-900/20">
          <div
            className={`h-3 w-3 rounded-full ${isAuthenticated ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-gray-400"}`}
          ></div>
          <span
            className={`text-sm font-medium ${isAuthenticated ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}
          >
            {isAuthenticated ? t("authenticated") : t("internet_identity")}
          </span>
        </div>
      </div>

      {/* 身份信息卡片 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Principal ID 卡片 */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-slate-800 dark:to-blue-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

          <div className="relative">
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                <svg
                  className="h-4 w-4 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("principal_id")}
                </h3>
              </div>
            </div>

            <div className="mb-3 flex items-center space-x-2">
              <div className="flex min-h-[44px] flex-1 items-center rounded-lg bg-white/80 p-3 font-mono text-sm text-gray-900 dark:bg-gray-800/80 dark:text-white">
                {isAuthenticated && principal
                  ? showPrincipal
                    ? principal.toText()
                    : mask(principal.toText())
                  : "-"}
              </div>
              {isAuthenticated && principal && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => setShowPrincipal((v) => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 transition-all duration-200 hover:from-blue-200 hover:to-purple-200 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-400 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50"
                    title={showPrincipal ? "隐藏" : "显示"}
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
                        d={
                          showPrincipal
                            ? "M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.221 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c2.042 0 3.97.613 5.542 1.675M19.542 12c-1.274 4.057-5.065 7-9.542 7-2.042 0-3.97-.613-5.542-1.675"
                        }
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      copyToClipboard(principal.toText(), "principal")
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 transition-all duration-200 hover:from-green-200 hover:to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50"
                    title="复制Principal ID"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15V5a2 2 0 012-2h10" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {copyFeedback.type === "principal" && copyFeedback.message && (
              <div className="mb-2 text-xs text-green-600 dark:text-green-400">
                {copyFeedback.message}
              </div>
            )}

            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>{t("principal_id_description")}</p>
              <p>{t("principal_id_purpose")}</p>
            </div>
          </div>
        </div>

        {/* Account ID 卡片 */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-slate-800 dark:to-purple-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

          <div className="relative">
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                <svg
                  className="h-4 w-4 text-purple-600 dark:text-purple-400"
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
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("account_id")}
                </h3>
              </div>
            </div>

            <div className="mb-3 flex items-start space-x-2">
              <div className="flex min-h-[44px] flex-1 items-center rounded-lg bg-white/80 p-3 font-mono text-sm break-all text-gray-900 dark:bg-gray-800/80 dark:text-white">
                {isAuthenticated
                  ? showAccount
                    ? accountId
                    : mask(accountId)
                  : "-"}
              </div>
              {isAuthenticated && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => setShowAccount((v) => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 transition-all duration-200 hover:from-purple-200 hover:to-pink-200 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-400 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50"
                    title={showAccount ? "隐藏" : "显示"}
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
                        d={
                          showAccount
                            ? "M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.221 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c2.042 0 3.97.613 5.542 1.675M19.542 12c-1.274 4.057-5.065 7-9.542 7-2.042 0-3.97-.613-5.542-1.675"
                        }
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => copyToClipboard(accountId, "account")}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 transition-all duration-200 hover:from-green-200 hover:to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50"
                    title="复制Account ID"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15V5a2 2 0 012-2h10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowRechargeTip((v) => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-600 transition-all duration-200 hover:from-orange-200 hover:to-yellow-200 dark:from-orange-900/30 dark:to-yellow-900/30 dark:text-orange-400 dark:hover:from-orange-900/50 dark:hover:to-yellow-900/50"
                    title="充值说明"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {copyFeedback.type === "account" && copyFeedback.message && (
              <div className="mb-2 text-xs text-green-600 dark:text-green-400">
                {copyFeedback.message}
              </div>
            )}

            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>{t("account_id_description")}</p>
              <p>{t("account_id_purpose")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 充值说明卡片 */}
      {showRechargeTip && (
        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-lg dark:from-orange-900/20 dark:to-yellow-900/20">
          <div className="mb-4 flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30">
              <svg
                className="h-4 w-4 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t("recharge_instructions_title")}
            </h3>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {t("recharge_instructions")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
