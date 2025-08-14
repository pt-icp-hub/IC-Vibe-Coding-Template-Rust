// 主应用组件
// Main application component with multi-page navigation

import React, { useState, useEffect } from "react";
import { Header } from "./components/Layout/Header";
import DashboardPage from "./views/DashboardPage";
import { EarnPage } from "./views/EarnPage";
import { BorrowPage } from "./views/BorrowPage";
import { ExplorePage } from "./views/ExplorePage";
import MigratePage from "./views/MigratePage";
import { VaultDetailPage } from "./views/VaultDetailPage";
import { MarketDetailPage } from "./views/MarketDetailPage";
import { internetIdentityService } from "./services/InternetIdentityService";
import { UserInfo } from "./services/InternetIdentityService";
import { Principal } from "@dfinity/principal";
import { MarketPair } from "./types";
import { Vault } from "./types";
import { PageRoute } from "./types";
import { useLanguage } from "./hooks/useLanguage";
import { LanguageProvider } from "./hooks/useLanguage";

// 错误提示组件
const ErrorBanner = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => (
  <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {message}
      </div>
      <button
        onClick={onClose}
        className="ml-2 text-red-400 hover:text-red-600 dark:hover:text-red-300"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
);

function App() {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<PageRoute>("dashboard");
  const [selectedMarket, setSelectedMarket] = useState<MarketPair | null>(null);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    principal: Principal | null;
    userInfo: UserInfo | null;
  }>({
    isAuthenticated: false,
    principal: null,
    userInfo: null,
  });

  // 初始化Internet Identity服务
  useEffect(() => {
    const initializeII = async () => {
      try {
        await internetIdentityService.initialize();
        const state = internetIdentityService.getAuthState();
        setAuthState(state);
        console.log("Internet Identity服务初始化完成");
      } catch (error) {
        console.error("Internet Identity服务初始化失败:", error);
        // setError("请先登录Internet Identity");
      }
    };

    initializeII();

    // 监听II登录成功事件
    const handleIILogin = async () => {
      const state = internetIdentityService.getAuthState();
      setAuthState(state);
      console.log("Internet Identity连接成功");
    };

    window.addEventListener("ii-login-success", handleIILogin);

    return () => {
      window.removeEventListener("ii-login-success", handleIILogin);
    };
  }, []);

  // 处理错误
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // 清除错误
  const clearError = () => {
    setError(null);
  };

  // 处理Internet Identity登录
  const handleConnectWallet = async () => {
    setLoading(true);
    clearError();

    try {
      // 调用登录方法
      await internetIdentityService.login();
      const state = internetIdentityService.getAuthState();
      setAuthState(state);
      console.log("登录成功，认证状态:", state);
    } catch (error) {
      console.error("Internet Identity连接失败:", error);

      // 根据错误类型显示不同的错误信息
      let errorMessage = t("internet_identity_failed");
      if (error instanceof Error) {
        if (error.message.includes("无法连接到后端服务")) {
          errorMessage =
            t("backend_connection_error") ||
            "无法连接到后端服务，请确保dfx正在运行";
        } else if (error.message.includes("用户取消")) {
          errorMessage =
            t("authentication_cancelled") || "用户取消了身份验证操作";
        } else {
          errorMessage = error.message;
        }
      }

      handleError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 处理Internet Identity登出
  const handleDisconnectWallet = async () => {
    try {
      await internetIdentityService.logout();
      setAuthState({
        isAuthenticated: false,
        principal: null,
        userInfo: null,
      });
    } catch (error) {
      handleError(t("logout_failed") || "登出失败");
    }
  };

  // 处理用户信息更新
  const handleUserInfoUpdate = (updatedUserInfo: any) => {
    setAuthState((prevState) => ({
      ...prevState,
      userInfo: updatedUserInfo,
    }));
  };

  // 处理页面切换
  const handlePageChange = (page: PageRoute) => {
    setCurrentPage(page);
    setSelectedMarket(null); // 切换主页面时，清除选中的市场
    setSelectedVault(null); // 切换主页面时，清除选中的金库
    clearError(); // 切换页面时清除错误
  };

  // 处理选择市场，进入详情页
  const handleSelectMarket = (market: MarketPair) => {
    setSelectedMarket(market);
  };

  // 从市场详情页返回市场列表
  const handleBackToMarkets = () => {
    setSelectedMarket(null);
  };

  // 处理选择金库，进入详情页
  const handleSelectVault = (vault: Vault) => {
    setSelectedVault(vault);
  };

  // 从金库详情页返回金库列表
  const handleBackToVaults = () => {
    setSelectedVault(null);
  };

  // 格式化Principal显示
  const formatPrincipal = (principal: any) => {
    if (!principal) return "";
    const principalText = principal.toText();
    return `${principalText.slice(0, 6)}...${principalText.slice(-4)}`;
  };

  // 渲染当前页面内容
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "earn":
        // 如果有选中的金库，则显示详情页，否则显示金库列表页
        return selectedVault ? (
          <VaultDetailPage
            vault={selectedVault}
            onBack={handleBackToVaults}
            isAuthenticated={authState.isAuthenticated}
          />
        ) : (
          <EarnPage
            walletAddress={
              authState.principal ? formatPrincipal(authState.principal) : null
            }
            userInfo={authState.userInfo}
            isAuthenticated={authState.isAuthenticated}
            principal={authState.principal}
            onError={handleError}
            setLoading={setLoading}
            onSelectVault={handleSelectVault}
            onUserInfoUpdate={handleUserInfoUpdate}
          />
        );
      case "borrow":
        // 如果有选中的市场，则显示详情页，否则显示市场列表页
        return selectedMarket ? (
          <MarketDetailPage
            market={selectedMarket}
            onBack={handleBackToMarkets}
            isAuthenticated={authState.isAuthenticated}
          />
        ) : (
          <BorrowPage
            walletAddress={
              authState.principal ? formatPrincipal(authState.principal) : null
            }
            onSelectMarket={handleSelectMarket}
          />
        );
      case "explore":
        return <ExplorePage />;
      case "migrate":
        return <MigratePage />;
      case "dashboard":
        return (
          <DashboardPage
            userInfo={authState.userInfo}
            isAuthenticated={authState.isAuthenticated}
            principal={authState.principal}
            onUserInfoUpdate={handleUserInfoUpdate}
          />
        );
      default:
        return (
          <DashboardPage
            userInfo={authState.userInfo}
            isAuthenticated={authState.isAuthenticated}
            principal={authState.principal}
            onUserInfoUpdate={handleUserInfoUpdate}
          />
        );
    }
  };

  return (
    // 主应用容器
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <Header
        currentPage={currentPage}
        onPageChange={handlePageChange}
        walletAddress={
          authState.principal ? formatPrincipal(authState.principal) : null
        }
        userInfo={authState.userInfo}
        isAuthenticated={authState.isAuthenticated}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
      />

      {/* 主要内容区域 */}
      <main>{renderCurrentPage()}</main>

      {/* 全局加载遮罩 */}
      {loading && !error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          {/* <Loader /> */}
        </div>
      )}

      {/* 全局错误显示 */}
      {error && <ErrorBanner message={error} onClose={clearError} />}
    </div>
  );
}

export default function AppWithLanguageProvider() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}
