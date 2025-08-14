// 顶部导航栏组件
// Top navigation header component

import { useState, useEffect, useRef } from "react";
import { PageRoute, NavItem, Language } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { UserInfo } from "../../services/InternetIdentityService";

// 组件属性接口
interface HeaderProps {
  currentPage: PageRoute; // 当前页面路由
  onPageChange: (page: PageRoute) => void; // 页面切换回调
  walletAddress: string | null; // 钱包地址
  userInfo: UserInfo | null; // 用户信息
  isAuthenticated: boolean; // 认证状态
  onConnectWallet: () => void; // 连接钱包回调
  onDisconnectWallet: () => void; // 断开钱包回调
}

// 导航项配置
const navItems: NavItem[] = [
  {
    key: "dashboard",
    label: { en: "Dashboard", zh: "个人中心" },
    // icon: '📊',
    path: "/dashboard",
  },
  {
    key: "earn",
    label: { en: "Earn", zh: "收益" },
    // icon: '💰',
    path: "/earn",
  },
  {
    key: "borrow",
    label: { en: "Borrow", zh: "借贷" },
    // icon: '🏦',
    path: "/borrow",
  },
  {
    key: "explore",
    label: { en: "Explore", zh: "探索" },
    // icon: '🔍',
    path: "/explore",
  },
  {
    key: "migrate",
    label: { en: "Migrate", zh: "教程" },
    // icon: '🔄',
    path: "/migrate",
  },
];

// 顶部导航栏主组件
export const Header = ({
  currentPage,
  onPageChange,
  walletAddress,
  userInfo,
  isAuthenticated,
  onConnectWallet,
  onDisconnectWallet,
}: HeaderProps) => {
  // 多语言Hook
  const { t, language, toggleLanguage } = useLanguage();

  // 移动端菜单显示状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 钱包下拉菜单显示状态
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);

  // 钱包菜单的ref，用于检测点击外部
  const walletMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭钱包菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        walletMenuRef.current &&
        !walletMenuRef.current.contains(event.target as Node)
      ) {
        setIsWalletMenuOpen(false);
      }
    };

    if (isWalletMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isWalletMenuOpen]);

  // 格式化钱包地址显示
  const formatWalletAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 处理导航点击
  const handleNavClick = (page: PageRoute) => {
    onPageChange(page);
    setIsMobileMenuOpen(false); // 关闭移动端菜单
  };

  // 处理钱包断开连接
  const handleDisconnect = () => {
    onDisconnectWallet();
    setIsWalletMenuOpen(false);
  };

  return (
    // 固定在顶部的导航栏
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-blue-400/60 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 shadow-sm dark:border-blue-700/60 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 左侧：品牌标识 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-300 to-purple-200 bg-clip-text text-2xl font-bold text-transparent drop-shadow">
                ₿
              </div>
              <div className="text-xl font-bold text-white drop-shadow">
                BLend
              </div>
            </div>
          </div>

          {/* 中间：桌面端导航菜单 */}
          <nav className="hidden items-center space-x-1 md:flex">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                  currentPage === item.key
                    ? "bg-white/20 font-bold text-white shadow" // 选中态
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label[language as Language]}
              </button>
            ))}
          </nav>

          {/* 右侧：用户信息和语言切换 */}
          <div className="flex items-center space-x-4">
            {/* 语言切换按钮 */}
            <button
              onClick={toggleLanguage}
              className="rounded-lg border border-white/70 bg-white/20 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-white/30 hover:text-white active:scale-95"
            >
              {language === "en" ? "中文" : "EN"}
            </button>

            {/* 用户认证状态 */}
            {isAuthenticated ? (
              <div className="relative" ref={walletMenuRef}>
                <button
                  onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                  className="flex items-center space-x-2 rounded-lg border border-white/40 bg-white/20 px-4 py-2 text-white shadow transition-colors hover:bg-white/30"
                >
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-sm font-semibold">
                    {formatWalletAddress(walletAddress)}
                  </span>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isWalletMenuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {/* 用户信息 */}
                    <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {userInfo?.username || t("user")}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {walletAddress}
                      </div>
                      <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                        ✓ {t("authenticated")}
                      </div>
                    </div>

                    {/* 余额信息 */}
                    <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t("ckbtc_balance")}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {userInfo?.ckbtc_balance || 0} ckBTC
                      </div>
                    </div>

                    {/* 统计信息 */}
                    <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {t("total_earned")}
                          </div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {userInfo?.total_earned || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {t("total_borrowed")}
                          </div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {userInfo?.total_borrowed || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="px-2 py-1">
                      <button
                        onClick={handleDisconnect}
                        className="w-full rounded px-2 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        {t("disconnect")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="rounded-lg border border-white/70 bg-white/20 px-4 py-2 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-white/30 hover:text-white active:scale-95"
              >
                {t("authenticate")}
              </button>
            )}

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 md:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 移动端下拉菜单 */}
        {isMobileMenuOpen && (
          <div className="border-t border-white/20 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 py-4 md:hidden dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`flex items-center rounded-lg px-4 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                    currentPage === item.key
                      ? "bg-white/20 font-bold text-white"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="font-semibold">
                    {item.label[language as Language]}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
