import { useState, useEffect, useRef } from "react";
import { Asset } from "../types";

// 流动性提供者组件属性接口
interface LiquidityProviderProps {
  asset: Asset; // 资产信息
  onSupply: (asset: Asset, amount: number) => Promise<void>; // 供应回调
  onWithdraw: (asset: Asset, amount: number) => Promise<void>; // 提取回调
  onClose: () => void; // 关闭回调
}

export const LiquidityProvider = ({
  asset,
  onSupply,
  onWithdraw,
  onClose,
}: LiquidityProviderProps) => {
  const [activeTab, setActiveTab] = useState<"supply" | "withdraw">("supply");
  const [amount, setAmount] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    setIsProcessing(true);
    try {
      if (activeTab === "supply") {
        await onSupply(asset, Number(amount));
      } else {
        await onWithdraw(asset, Number(amount));
      }
      setAmount("");
    } finally {
      setIsProcessing(false);
    }
  };

  const maxAmount = activeTab === "supply" ? asset.balance : asset.supplied;
  const isValidAmount =
    amount &&
    !isNaN(Number(amount)) &&
    Number(amount) > 0 &&
    Number(amount) <= maxAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{asset.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {asset.symbol}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {asset.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("supply")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "supply"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Supply
          </button>
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "withdraw"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Withdraw
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={maxAmount}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <div className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                  {asset.symbol}
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Available: {maxAmount.toFixed(2)} {asset.symbol}
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValidAmount || isProcessing}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </div>
              ) : (
                `${activeTab === "supply" ? "Supply" : "Withdraw"} ${asset.symbol}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
