import { useState, useEffect, useRef } from "react";
import { Asset } from "../types";

// 市场统计数据接口
interface MarketStats {
  totalSupply: number;
  totalBorrow: number;
  availableLiquidity: number;
  utilizationRate: number;
  supplyRate: number;
  borrowRate: number;
}

// 组件属性接口
interface MarketDetailProps {
  asset: Asset;
  onClose: () => void;
  onSupply: (asset: Asset, amount: number) => Promise<void>;
  onBorrow: (asset: Asset, amount: number) => Promise<void>;
  onRepay: (asset: Asset, amount: number) => Promise<void>;
  onWithdraw: (asset: Asset, amount: number) => Promise<void>;
}

// 市场详情组件
export const MarketDetail = ({
  asset,
  onClose,
  onSupply,
  onBorrow,
  onRepay,
  onWithdraw,
}: MarketDetailProps) => {
  // 当前活动的操作标签 (supply: 供应, borrow: 借贷, repay: 还款, withdraw: 提取)
  const [activeTab, setActiveTab] = useState<
    "supply" | "borrow" | "repay" | "withdraw"
  >("supply");
  // 输入的金额
  const [amount, setAmount] = useState("");
  // 市场统计数据
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  // 是否正在处理交易
  const [isProcessing, setIsProcessing] = useState(false);

  // 模态框的ref，用于检测点击外部
  const modalRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭模态框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // 组件初始化时加载市场数据
  useEffect(() => {
    // 模拟市场统计数据 - 在真实应用中应该从后端获取
    const mockStats: MarketStats = {
      totalSupply: asset.tvl,
      totalBorrow: asset.tvl * 0.75,
      availableLiquidity: asset.tvl * 0.25,
      utilizationRate: 75,
      supplyRate: asset.apy,
      borrowRate: asset.borrowRate,
    };
    setMarketStats(mockStats);
  }, [asset]);

  // 格式化数字为货币格式
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  // 格式化百分比
  const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // 获取当前操作的最大可用金额
  const getMaxAmount = (): number => {
    switch (activeTab) {
      case "supply":
        return asset.balance; // 钱包余额
      case "borrow":
        return asset.balance * 0.8; // 可借贷金额 (基于抵押)
      case "repay":
        return asset.borrowed; // 已借贷金额
      case "withdraw":
        return asset.supplied; // 已供应金额
      default:
        return 0;
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证输入金额
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    setIsProcessing(true);

    try {
      // 根据当前标签执行相应操作
      switch (activeTab) {
        case "supply":
          await onSupply(asset, Number(amount));
          break;
        case "borrow":
          await onBorrow(asset, Number(amount));
          break;
        case "repay":
          await onRepay(asset, Number(amount));
          break;
        case "withdraw":
          await onWithdraw(asset, Number(amount));
          break;
      }
      setAmount(""); // 清空输入
    } finally {
      setIsProcessing(false);
    }
  };

  // 验证输入金额是否有效
  const isValidAmount =
    amount &&
    !isNaN(Number(amount)) &&
    Number(amount) > 0 &&
    Number(amount) <= getMaxAmount();

  // 获取操作按钮的样式类名
  const getButtonStyle = (tabType: string): string => {
    if (!isValidAmount || isProcessing) {
      return "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed";
    }

    switch (tabType) {
      case "supply":
        return "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 active:scale-95 shadow-lg hover:shadow-xl";
      case "borrow":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 active:scale-95 shadow-lg hover:shadow-xl";
      case "repay":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 active:scale-95 shadow-lg hover:shadow-xl";
      case "withdraw":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 active:scale-95 shadow-lg hover:shadow-xl";
      default:
        return "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      {/* 主要容器 - 使用毛玻璃效果和圆角设计 */}
      <div
        ref={modalRef}
        className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white/95 shadow-2xl backdrop-blur-xl dark:bg-gray-900/95"
      >
        {/* 头部区域 */}
        <div className="flex items-center justify-between border-b border-gray-200/50 p-6 dark:border-gray-700/50">
          {/* 资产信息显示 */}
          <div className="flex items-center space-x-4">
            <div className="text-3xl">{asset.icon}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {asset.symbol} Market
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {asset.name} Lending & Borrowing
              </p>
            </div>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-8 p-6">
          {/* 市场统计概览 */}
          {marketStats && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* 总供应量卡片 */}
              <div className="rounded-2xl border border-blue-200/50 bg-blue-50/70 p-4 backdrop-blur-lg dark:border-blue-800/50 dark:bg-blue-900/20">
                <div className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                  Total Supply
                </div>
                <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(marketStats.totalSupply)}
                </div>
                <div className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                  APY {formatPercent(marketStats.supplyRate)}
                </div>
              </div>

              {/* 总借贷量卡片 */}
              <div className="rounded-2xl border border-green-200/50 bg-green-50/70 p-4 backdrop-blur-lg dark:border-green-800/50 dark:bg-green-900/20">
                <div className="mb-1 text-sm font-medium text-green-600 dark:text-green-400">
                  Total Borrow
                </div>
                <div className="text-xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(marketStats.totalBorrow)}
                </div>
                <div className="mt-1 text-xs text-green-500 dark:text-green-400">
                  APY {formatPercent(marketStats.borrowRate)}
                </div>
              </div>

              {/* 可用流动性卡片 */}
              <div className="rounded-2xl border border-purple-200/50 bg-purple-50/70 p-4 backdrop-blur-lg dark:border-purple-800/50 dark:bg-purple-900/20">
                <div className="mb-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                  Available Liquidity
                </div>
                <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {formatCurrency(marketStats.availableLiquidity)}
                </div>
                <div className="mt-1 text-xs text-purple-500 dark:text-purple-400">
                  Ready to borrow
                </div>
              </div>

              {/* 利用率卡片 */}
              <div className="rounded-2xl border border-orange-200/50 bg-orange-50/70 p-4 backdrop-blur-lg dark:border-orange-800/50 dark:bg-orange-900/20">
                <div className="mb-1 text-sm font-medium text-orange-600 dark:text-orange-400">
                  Utilization Rate
                </div>
                <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  {formatPercent(marketStats.utilizationRate)}
                </div>
                {/* 利用率进度条 */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-orange-200 dark:bg-orange-800">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300"
                    style={{ width: `${marketStats.utilizationRate}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 主要内容区域 */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 左侧：操作面板 */}
            <div className="space-y-6">
              {/* 操作标签选择器 */}
              <div className="rounded-2xl bg-gray-100/70 p-1 backdrop-blur-lg dark:bg-gray-800/70">
                <div className="grid grid-cols-4 gap-1">
                  {/* 供应标签 */}
                  <button
                    onClick={() => setActiveTab("supply")}
                    className={`rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                      activeTab === "supply"
                        ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Supply
                  </button>

                  {/* 借贷标签 */}
                  <button
                    onClick={() => setActiveTab("borrow")}
                    className={`rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                      activeTab === "borrow"
                        ? "bg-white text-green-600 shadow-sm dark:bg-gray-700 dark:text-green-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Borrow
                  </button>

                  {/* 还款标签 */}
                  <button
                    onClick={() => setActiveTab("repay")}
                    className={`rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                      activeTab === "repay"
                        ? "bg-white text-orange-600 shadow-sm dark:bg-gray-700 dark:text-orange-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Repay
                  </button>

                  {/* 提取标签 */}
                  <button
                    onClick={() => setActiveTab("withdraw")}
                    className={`rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                      activeTab === "withdraw"
                        ? "bg-white text-purple-600 shadow-sm dark:bg-gray-700 dark:text-purple-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    Withdraw
                  </button>
                </div>
              </div>

              {/* 操作表单 */}
              <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/70">
                {/* 账户余额显示 */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {activeTab === "supply" && "Wallet Balance"}
                      {activeTab === "borrow" && "Borrowing Power"}
                      {activeTab === "repay" && "Outstanding Debt"}
                      {activeTab === "withdraw" && "Supplied Balance"}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {getMaxAmount().toFixed(4)} {asset.symbol}
                    </span>
                  </div>

                  {/* 当前APY显示 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {activeTab === "supply" || activeTab === "withdraw"
                        ? "Supply APY"
                        : "Borrow APY"}
                    </span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatPercent(
                        activeTab === "supply" || activeTab === "withdraw"
                          ? asset.apy
                          : asset.borrowRate,
                      )}
                    </span>
                  </div>
                </div>

                {/* 金额输入表单 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 金额输入框 */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)} // 更新输入金额
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max={getMaxAmount()}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-4 text-lg text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />

                      {/* 输入框右侧的MAX按钮和币种显示 */}
                      <div className="absolute top-1/2 right-3 flex -translate-y-1/2 transform items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setAmount(getMaxAmount().toString())} // 设置为最大金额
                          className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          MAX
                        </button>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {asset.symbol}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 快速金额选择按钮 */}
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((percentage) => (
                      <button
                        key={percentage}
                        type="button"
                        onClick={() =>
                          setAmount(
                            ((getMaxAmount() * percentage) / 100).toString(),
                          )
                        } // 设置为百分比金额
                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        {percentage}%
                      </button>
                    ))}
                  </div>

                  {/* 交易预览 */}
                  {amount && isValidAmount && (
                    <div className="space-y-3 rounded-xl bg-gray-50/70 p-4 dark:bg-gray-900/30">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Transaction Overview
                      </h4>

                      {/* 操作金额显示 */}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {activeTab === "supply" && "Supplying"}
                          {activeTab === "borrow" && "Borrowing"}
                          {activeTab === "repay" && "Repaying"}
                          {activeTab === "withdraw" && "Withdrawing"}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {Number(amount).toFixed(4)} {asset.symbol}
                        </span>
                      </div>

                      {/* 年化收益/成本显示 */}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {activeTab === "supply" || activeTab === "withdraw"
                            ? "Annual Earnings"
                            : "Annual Interest"}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            activeTab === "supply" || activeTab === "withdraw"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {activeTab === "supply" || activeTab === "withdraw"
                            ? "+"
                            : "-"}
                          {(
                            (Number(amount) *
                              (activeTab === "supply" ||
                              activeTab === "withdraw"
                                ? asset.apy
                                : asset.borrowRate)) /
                            100
                          ).toFixed(4)}{" "}
                          {asset.symbol}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 提交按钮 */}
                  <button
                    type="submit"
                    disabled={!isValidAmount || isProcessing}
                    className={`w-full rounded-xl px-6 py-4 text-lg font-semibold transition-all duration-200 ${getButtonStyle(activeTab)}`}
                  >
                    {isProcessing ? (
                      // 处理中的加载动画
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      // 按钮文本
                      `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ${asset.symbol}`
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* 右侧：市场信息面板 */}
            <div className="space-y-6">
              {/* 您的位置信息 */}
              <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/70">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Your Position
                </h3>

                <div className="space-y-4">
                  {/* 供应位置 */}
                  <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-3 dark:bg-blue-900/20">
                    <div>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Supplied
                      </div>
                      <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        {asset.supplied.toFixed(4)} {asset.symbol}
                      </div>
                    </div>
                    <div className="text-sm text-blue-500 dark:text-blue-400">
                      ≈ {formatCurrency(asset.supplied)}
                    </div>
                  </div>

                  {/* 借贷位置 */}
                  <div className="flex items-center justify-between rounded-xl bg-red-50/50 p-3 dark:bg-red-900/20">
                    <div>
                      <div className="text-sm font-medium text-red-600 dark:text-red-400">
                        Borrowed
                      </div>
                      <div className="text-lg font-bold text-red-900 dark:text-red-100">
                        {asset.borrowed.toFixed(4)} {asset.symbol}
                      </div>
                    </div>
                    <div className="text-sm text-red-500 dark:text-red-400">
                      ≈ {formatCurrency(asset.borrowed)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 市场信息 */}
              <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/70">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Market Information
                </h3>

                <div className="space-y-3">
                  {/* 抵押因子 */}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Collateral Factor
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatPercent(asset.collateralFactor)}
                    </span>
                  </div>

                  {/* 清算阈值 */}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Liquidation Threshold
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatPercent(asset.liquidationThreshold)}
                    </span>
                  </div>

                  {/* 总市值 */}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Value Locked
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(asset.tvl)}
                    </span>
                  </div>

                  {/* 利用率 */}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Utilization Rate
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatPercent(asset.utilization)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 利率历史图表占位符 */}
              <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/70">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Interest Rate History
                </h3>

                {/* 图表占位符 */}
                <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="text-center">
                    <div className="mb-2 text-3xl">📈</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Interactive chart coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
