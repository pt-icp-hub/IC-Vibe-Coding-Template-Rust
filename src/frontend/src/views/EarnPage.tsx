// 收益页面组件 - 金库列表视图
// Earn page component - vault list view

import { useState, useEffect } from "react";
import { Vault } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { VaultListItem } from "../components/Earn/VaultListItem";
import { UserInfoDisplay } from "../components/UserInfoDisplay";
import { UserInfo } from "../services/InternetIdentityService";
import { createBackendService } from "../services/backendService";
import { HttpAgent } from "@dfinity/agent";

// 组件属性接口
interface EarnPageProps {
  walletAddress: string | null; // 钱包地址
  userInfo: UserInfo | null; // 用户信息
  isAuthenticated: boolean; // 认证状态
  principal: any; // Principal对象
  onError: (error: string) => void; // 错误处理回调
  setLoading: (loading: boolean) => void; // 加载状态设置
  onSelectVault: (vault: Vault) => void; // 选择金库回调
  onUserInfoUpdate?: (updatedUserInfo: UserInfo) => void; // 用户信息更新回调
}

// 收益页面主组件
export const EarnPage = ({
  walletAddress,
  userInfo,
  isAuthenticated,
  principal,
  onError,
  setLoading,
  onSelectVault,
  onUserInfoUpdate,
}: EarnPageProps) => {
  // 多语言Hook
  const { t } = useLanguage();

  // 金库列表状态
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setVaultsLoading] = useState(true);

  // 筛选文本状态
  const [filter, setFilter] = useState("");

  // 存款类型筛选状态
  const [depositFilter, setDepositFilter] = useState("All");

  // 管理者筛选状态
  const [curatorFilter, setCuratorFilter] = useState("All");

  // 初始化金库数据
  useEffect(() => {
    const loadVaults = async () => {
      try {
        setVaultsLoading(true);

        // 创建后端服务
        const agent = new HttpAgent({ host: "https://ic0.app" });
        const backendService = createBackendService(
          agent,
          "d72ol-biaaa-aaaai-q32jq-cai",
        );

        // 获取所有池子
        const pools = await backendService.getAllPools();

        // 转换为Vault格式
        const vaultsData: Vault[] = await Promise.all(
          pools.map(async (pool, index) => {
            // 获取池子的详细信息
            const poolInfo = await backendService.getPoolInfo(
              pool.token_id.toText(),
            );

            // 计算APY (这里使用池子的supply_apy)
            const apy = poolInfo.supply_apy;

            // 计算存款金额 (转换为可读格式)
            const deposits =
              Number(pool.amount) / Math.pow(10, pool.pool_account.decimals);

            // 计算流动性
            const liquidity =
              Number(pool.amount) / Math.pow(10, pool.pool_account.decimals);

            // 计算分配金额
            const allocation = Number(pool.amount);

            // 计算供应份额 (基于使用率)
            const supplyShare =
              pool.maximum_token > 0n
                ? (Number(pool.amount) / Number(pool.maximum_token)) * 100
                : 0;

            return {
              id: index.toString(),
              name: pool.name || `${pool.pool_account.name} Pool`,
              curator: pool.pool_account.name || "System",
              curatorIcon: "🏦",
              allocation,
              supplyShare,
              asset: pool.pool_account.name,
              deposits,
              apy,
              liquidity,
              totalDeposits: allocation,
              collateral: pool.collateral.map((c) => c.name),
              description: `${pool.name} lending pool with ${apy.toFixed(2)}% APY`,
              performanceData: {
                nativeApy: apy,
                wellBonus: 0,
                performanceFee: 0,
                netApy: apy,
                chartData: [],
              },
            };
          }),
        );

        setVaults(vaultsData);
      } catch (error) {
        console.error("Failed to load vaults:", error);
        onError("Failed to load vault data");

        // 如果加载失败，使用模拟数据作为后备
        const fallbackVaults: Vault[] = [
          {
            id: "1",
            name: "ICP Lending Pool",
            curator: "System",
            curatorIcon: "🏦",
            allocation: 1000000,
            supplyShare: 75.0,
            asset: "ICP",
            deposits: 1000.0,
            apy: 4.5,
            liquidity: 1000000,
            totalDeposits: 1000000,
            collateral: ["₿"],
            description: "ICP lending pool with 4.5% APY",
            performanceData: {
              nativeApy: 4.5,
              wellBonus: 0,
              performanceFee: 0,
              netApy: 4.5,
              chartData: [],
            },
          },
        ];
        setVaults(fallbackVaults);
      } finally {
        setVaultsLoading(false);
      }
    };

    loadVaults();
  }, [onError]);

  // 根据筛选条件过滤金库
  const filteredVaults = vaults.filter((vault) => {
    const matchesSearch =
      vault.name.toLowerCase().includes(filter.toLowerCase()) ||
      vault.curator.toLowerCase().includes(filter.toLowerCase()) ||
      vault.asset?.toLowerCase().includes(filter.toLowerCase());

    const matchesDeposit =
      depositFilter === "All" || vault.asset === depositFilter;
    const matchesCurator =
      curatorFilter === "All" || vault.curator === curatorFilter;

    return matchesSearch && matchesDeposit && matchesCurator;
  });

  // 获取唯一的存款类型
  const depositTypes = [
    "All",
    ...Array.from(new Set(vaults.map((v) => v.asset).filter(Boolean))),
  ];

  // 获取唯一的管理者
  const curators = [
    "All",
    ...Array.from(new Set(vaults.map((v) => v.curator))),
  ];

  return (
    // 页面主容器
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 pt-24 pb-12 dark:from-gray-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 用户信息显示 */}
        {/* <UserInfoDisplay
          userInfo={userInfo}
          isAuthenticated={isAuthenticated}
          principal={principal}
          onUserInfoUpdate={onUserInfoUpdate}
        /> */}

        {/* 页面头部 */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
            {t("page_earn_title")}
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-400">
            {t("page_earn_subtitle")}
          </p>
        </div>

        {/* 金库列表容器 */}
        <div className="rounded-3xl border border-gray-200/50 bg-white/50 p-4 shadow-xl backdrop-blur-2xl sm:p-6 dark:border-gray-700/50 dark:bg-gray-800/50">
          {/* 筛选和操作栏 */}
          <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDepositFilter("All")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold shadow transition-colors ${
                  depositFilter === "All"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100/70 text-gray-600 dark:bg-gray-700/70 dark:text-gray-300"
                }`}
              >
                {t("deposit")}: {t("all")}
              </button>
              <button
                onClick={() => setCuratorFilter("All")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  curatorFilter === "All"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100/70 text-gray-600 dark:bg-gray-700/70 dark:text-gray-300"
                }`}
              >
                {t("curator")}: {t("all")}
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
                placeholder={t("filter_vaults")}
                className="w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pr-4 pl-10 text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900/70 dark:text-white"
              />
            </div>
          </div>

          {/* 列表头部 */}
          <div className="grid grid-cols-12 gap-4 border-b border-gray-200/70 px-4 pb-3 text-xs font-medium text-gray-500 dark:border-gray-700/70 dark:text-gray-400">
            <div className="col-span-3">{t("vault")}</div>
            <div className="col-span-2">{t("deposits")}</div>
            <div className="col-span-2">{t("curator")}</div>
            <div className="col-span-2">{t("collateral")}</div>
            <div className="col-span-3 text-right">{t("apy")}</div>
          </div>

          {/* 金库列表 */}
          <div className="mt-2 space-y-2">
            {loading ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium">{t("loading_vaults")}</p>
              </div>
            ) : filteredVaults.length > 0 ? (
              filteredVaults.map((vault) => (
                <VaultListItem
                  key={vault.id}
                  vault={vault}
                  onSelect={onSelectVault}
                />
              ))
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium">{t("no_vaults_found")}</p>
                <p>{t("try_adjusting_filters")}</p>
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
                {t("page")} 1 {t("of")} 1
              </span>
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
