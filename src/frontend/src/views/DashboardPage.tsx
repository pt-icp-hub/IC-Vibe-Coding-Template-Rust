import React, { useState, useEffect } from "react"; // 导入React hooks
import { useLanguage } from "../hooks/useLanguage"; // 导入多语言Hook
import {
  internetIdentityService,
  UserInfo,
  EarnPosition,
  BorrowPosition,
} from "../services/InternetIdentityService"; // 导入II服务
import { UserInfoDisplay } from "../components/UserInfoDisplay";
import { TokenBalanceDisplay } from "../components/TokenBalanceDisplay";
import { Principal } from "@dfinity/principal";

// 新增 props 类型定义
interface DashboardPageProps {
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  principal: any;
  onUserInfoUpdate?: (updatedUserInfo: any) => void;
}

// 总览数据结构
interface PortfolioData {
  totalEarned: number; // 总收益
  totalBorrowed: number; // 总借贷
  netWorth: number; // 净资产
  healthFactor: number; // 健康因子
}

// 统计卡片组件
const StatCard = ({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
}) => (
  <div className="group relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:from-slate-800 dark:to-slate-700">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

    <div className="relative">
      <div className="mb-2 text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </div>
      <div className="flex items-center space-x-2">
        <div className="text-2xl font-bold text-gray-900 tabular-nums dark:text-white">
          {value}
        </div>
        {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
      </div>
    </div>
  </div>
);

// 修改导出函数签名，接收 props
export default function DashboardPage({
  userInfo,
  isAuthenticated,
  principal,
  onUserInfoUpdate,
}: DashboardPageProps) {
  const { t } = useLanguage(); // 多语言Hook
  const [activeTab, setActiveTab] = useState<"earn" | "borrow">("earn"); // 当前激活的标签页

  // 其余状态保留（收益、借贷位置、loading、error）
  const [earnPositions, setEarnPositions] = useState<EarnPosition[]>([]); // 收益位置
  const [borrowPositions, setBorrowPositions] = useState<BorrowPosition[]>([]); // 借贷位置
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误状态

  // 计算总览数据
  const calculatePortfolioData = (): PortfolioData => {
    if (!userInfo) {
      return {
        totalEarned: 0,
        totalBorrowed: 0,
        netWorth: 0,
        healthFactor: 0,
      };
    }
    return {
      totalEarned: userInfo.total_earned,
      totalBorrowed: userInfo.total_borrowed,
      netWorth:
        userInfo.ckbtc_balance +
        userInfo.total_earned -
        userInfo.total_borrowed,
      healthFactor: Number(userInfo.health_factor) || 0,
    };
  };

  // 加载用户数据
  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 检查认证状态
      const authState = internetIdentityService.getAuthState();
      // if (!authState.isAuthenticated) {
      //   // setError("请先登录Internet Identity");
      //   return;
      // }

      // 暂时注释掉不存在的后端方法调用
      // const [earnResult, borrowResult] = await Promise.allSettled([
      //   internetIdentityService.getEarnPositions(),
      //   internetIdentityService.getBorrowPositions(),
      // ]);

      // // 处理收益位置结果
      // if (earnResult.status === "fulfilled") {
      //   setEarnPositions(earnResult.value);
      // } else {
      //   console.error("加载收益位置失败:", earnResult.reason);
      // }

      // // 处理借贷位置结果
      // if (borrowResult.status === "fulfilled") {
      //   setBorrowPositions(borrowResult.value);
      // } else {
      //   console.error("加载借贷位置失败:", borrowResult.reason);
      // }
    } catch (error) {
      console.error("加载用户数据失败:", error);
      setError(error instanceof Error ? error.message : "加载数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  // 计算总览数据
  const portfolioData = calculatePortfolioData();

  // 默认占位userInfo
  const placeholderUserInfo = {
    principal: Principal.anonymous(),
    username: "-",
    ckbtc_balance: 0,
    total_earned: 0,
    total_borrowed: 0,
    health_factor: 0,
    created_at: BigInt(0),
    recent_activities: [],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* 第一个白框：用户信息和代币余额 */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          {/* 用户信息部分 */}
          <UserInfoDisplay
            userInfo={userInfo || placeholderUserInfo}
            isAuthenticated={isAuthenticated}
            principal={principal}
            onUserInfoUpdate={onUserInfoUpdate}
          />

          {/* 总览卡片区 */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t("Total Earned")}
              value={portfolioData.totalEarned.toFixed(2)}
              icon={
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              }
            />
            <StatCard
              title={t("Total Borrowed")}
              value={portfolioData.totalBorrowed.toFixed(2)}
              icon={
                <svg
                  className="h-6 w-6"
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
              }
            />
            <StatCard
              title={t("net_worth")}
              value={portfolioData.netWorth.toFixed(2)}
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
            />
            <StatCard
              title={t("health_factor")}
              value={
                isNaN(Number(portfolioData.healthFactor))
                  ? "0.00"
                  : portfolioData.healthFactor.toFixed(2)
              }
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              }
            />
          </div>

          {/* 代币余额显示 */}
          <TokenBalanceDisplay isAuthenticated={isAuthenticated} />
        </div>

        {/* 第二个白框：仓位切换 */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          {/* Tab切换栏 */}
          <div className="mb-6 flex space-x-8 border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-2 py-3 text-base font-semibold transition-colors ${activeTab === "earn" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-600"}`}
              onClick={() => setActiveTab("earn")}
            >
              {t("My Earn Positions")}
            </button>
            <button
              className={`px-2 py-3 text-base font-semibold transition-colors ${activeTab === "borrow" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-500 hover:text-purple-600"}`}
              onClick={() => setActiveTab("borrow")}
            >
              {t("My Borrow Positions")}
            </button>
          </div>

          {/* Tab内容区 - 扁平化表格 */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-600">
                    <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300">
                      {t("Asset")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300">
                      {t("Amount")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300">
                      {activeTab === "earn" ? t("APY") : t("Rate")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold tracking-wider text-gray-700 dark:text-gray-300">
                      {activeTab === "earn" ? t("Earned") : t("Health Factor")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === "earn" ? earnPositions : borrowPositions).map(
                    (pos) => (
                      <tr
                        key={pos.id}
                        className="border-b border-gray-200 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                          {pos.asset}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-700 tabular-nums dark:text-gray-200">
                          {pos.amount}
                        </td>
                        <td className="px-6 py-3 text-right text-blue-600 tabular-nums dark:text-blue-400">
                          {activeTab === "earn"
                            ? `${(pos as EarnPosition).apy}%`
                            : `${(pos as BorrowPosition).rate}%`}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-700 tabular-nums dark:text-gray-200">
                          {activeTab === "earn"
                            ? (pos as EarnPosition).earned
                            : (pos as BorrowPosition).health_factor}
                        </td>
                      </tr>
                    ),
                  )}
                  {/* 如果没有数据，显示空状态 */}
                  {(activeTab === "earn" ? earnPositions : borrowPositions)
                    .length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        {activeTab === "earn"
                          ? t("no_earn_positions")
                          : t("no_borrow_positions")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
