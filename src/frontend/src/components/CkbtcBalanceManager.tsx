// ckBTC余额管理组件
// ckBTC balance management component

import { useState, useEffect } from "react";
import {
  internetIdentityService,
  getCkbtcDepositState,
} from "../services/InternetIdentityService";
import { useLanguage } from "../hooks/useLanguage";

interface CkbtcBalanceManagerProps {
  currentBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

export const CkbtcBalanceManager = ({
  currentBalance,
  onBalanceUpdate,
}: CkbtcBalanceManagerProps) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [depositState, setDepositState] = useState<any>(null);

  // 定时刷新ckBTC余额
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const userInfo = await internetIdentityService.getUserInfo();
        if (userInfo && userInfo.ckbtc_balance !== currentBalance) {
          onBalanceUpdate(userInfo.ckbtc_balance);
        }
      } catch (e) {}
    }, 30000);
    return () => clearInterval(interval);
  }, [currentBalance, onBalanceUpdate]);

  // 定时查询充值进度
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const state = await getCkbtcDepositState();
        setDepositState(state);
      } catch (e) {}
    }, 10000); // 10秒刷新一次
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setError("请输入有效金额");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const numAmount = parseFloat(amount);
      let newBalance: number;

      if (activeTab === "deposit") {
        // 增加余额
        newBalance = await internetIdentityService.updateCkbtcBalance(
          currentBalance + numAmount,
        );
      } else {
        // 取出余额
        if (numAmount > currentBalance) {
          throw new Error("余额不足");
        }
        newBalance = await internetIdentityService.updateCkbtcBalance(
          currentBalance - numAmount,
        );
      }

      onBalanceUpdate(newBalance);
      setAmount("");
      setError(null);
    } catch (error) {
      console.error("更新ckBTC余额失败:", error);
      setError(error instanceof Error ? error.message : "操作失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 判断环境，动态设置NNS钱包跳转地址
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const nnsWalletUrl = isLocal
    ? "http://qsgjb-riaaa-aaaaa-aaaga-cai.localhost:8080/"
    : "https://nns.ic0.app/";

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      {/* 获取 ckBTC 说明区域 */}
      <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="mb-2 font-semibold">如何获得 ckBTC？</div>
        <ol className="list-inside list-decimal space-y-1 text-sm text-gray-700 dark:text-gray-200">
          <li>
            <span>
              使用 <b>NNS 钱包</b> 充值 BTC，系统自动为你铸造等量 ckBTC。
            </span>
            <a
              href={nnsWalletUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 underline"
            >
              前往 NNS 钱包
            </a>
          </li>
          <li>
            <span>
              在 DEX（如 <b>ICDex</b> 或 <b>ICPSwap</b>）用 ICP 兑换 ckBTC。
            </span>
            <a
              href="https://icdex.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 underline"
            >
              去 ICDex
            </a>
            <a
              href="https://icpswap.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 underline"
            >
              去 ICPSwap
            </a>
          </li>
          <li>
            <span>ckBTC 可随时 1:1 兑换回真实 BTC。</span>
          </li>
        </ol>
        {/* 跳转NNS钱包充值按钮 */}
        <div className="mt-4 flex justify-center">
          <a
            href={nnsWalletUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white shadow transition-colors hover:bg-blue-700"
          >
            去 NNS 钱包充值 BTC
          </a>
        </div>
        {/* 充值进度展示 */}
        {depositState && (
          <div className="mt-6 rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="mb-1 font-semibold">充值进度</div>
            <div className="text-xs text-gray-700 dark:text-gray-200">
              <div>
                充值地址：
                <span className="font-mono break-all">
                  {depositState.btcAddress}
                </span>
              </div>
              <div>
                已收到：{depositState.received} / {depositState.required} BTC
              </div>
              <div>
                确认数：{depositState.confirmations?.toString?.()} /{" "}
                {depositState.requiredConfirmations?.toString?.()}
              </div>
              <div>
                状态：
                {(() => {
                  const statusMap: Record<string, string> = {
                    pending: "等待BTC到账",
                    minting: "铸造中",
                    completed: "充值完成，ckBTC已到账",
                  };
                  return statusMap[depositState.status] || depositState.status;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* 当前余额显示 */}
      <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="text-sm text-blue-600 dark:text-blue-400">
          {t("current_balance")}
        </div>
        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
          {currentBalance.toFixed(8)} ckBTC
        </div>
      </div>

      {/* 操作标签页 */}
      <div className="mb-4 flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("deposit")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "deposit"
              ? "border-green-500 text-green-600 dark:text-green-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          {t("deposit")}
        </button>
        <button
          onClick={() => setActiveTab("withdraw")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "withdraw"
              ? "border-red-500 text-red-600 dark:text-red-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          {t("withdraw")}
        </button>
      </div>

      {/* 操作表单 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {activeTab === "deposit"
              ? t("deposit_amount")
              : t("withdraw_amount")}{" "}
            (ckBTC)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00000000"
            step="0.00000001"
            min="0"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 操作按钮 */}
        <button
          type="submit"
          disabled={isLoading || !amount}
          className={`w-full rounded-lg px-4 py-2 font-medium transition-colors ${
            activeTab === "deposit"
              ? "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400"
              : "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400"
          } disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              {t("processing")}
            </div>
          ) : activeTab === "deposit" ? (
            t("deposit_ckbtc")
          ) : (
            t("withdraw_ckbtc")
          )}
        </button>
      </form>

      {/* 快速金额按钮 */}
      <div className="mt-4">
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          {t("quick_amounts")}:
        </p>
        <div className="flex flex-wrap gap-2">
          {[0.001, 0.01, 0.1, 1].map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toString())}
              className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {quickAmount} ckBTC
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
