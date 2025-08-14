import React, { useState, useEffect } from "react";
import { Principal } from "@dfinity/principal";
import { localTokenService } from "../services/LocalTokenService";

interface LocalTokenManagerProps {
  principal: Principal;
}

export const LocalTokenManager: React.FC<LocalTokenManagerProps> = ({
  principal,
}) => {
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [mintAmount, setMintAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化服务
  useEffect(() => {
    const initService = async () => {
      try {
        await localTokenService.initialize();
        setIsInitialized(true);
        await refreshBalance();
      } catch (error) {
        setError("初始化本地代币服务失败");
        console.error("初始化失败:", error);
      }
    };

    initService();
  }, []);

  // 刷新余额
  const refreshBalance = async () => {
    try {
      const newBalance = await localTokenService.getBalance(principal);
      setBalance(newBalance);
    } catch (error) {
      console.error("刷新余额失败:", error);
    }
  };

  // 铸造代币
  const handleMint = async () => {
    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      setError("请输入有效金额");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const amount = BigInt(parseFloat(mintAmount) * 10 ** 8); // 转换为最小单位
      await localTokenService.mintTokens(principal, amount);
      setSuccess(`成功铸造 ${mintAmount} MYT`);
      setMintAmount("");
      await refreshBalance();
    } catch (error) {
      setError(`铸造失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 转账
  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setError("请输入有效金额");
      return;
    }

    if (!transferTo) {
      setError("请输入接收方 Principal");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const toPrincipal = Principal.fromText(transferTo);
      const amount = BigInt(parseFloat(transferAmount) * 10 ** 8);

      await localTokenService.transfer(principal, toPrincipal, amount);
      setSuccess(`成功转账 ${transferAmount} MYT`);
      setTransferAmount("");
      setTransferTo("");
      await refreshBalance();
    } catch (error) {
      setError(`转账失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold">本地代币管理</h3>
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">正在初始化本地代币服务...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold">本地代币管理 (ckBTC)</h3>

      {/* 当前余额 */}
      <div className="mb-6 rounded-lg bg-blue-50 p-4">
        <div className="mb-1 text-sm text-blue-600">当前余额</div>
        <div className="text-2xl font-bold text-blue-900">
          {localTokenService.formatBalance(balance)} ckBTC
        </div>
        <button
          onClick={refreshBalance}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          刷新余额
        </button>
      </div>

      {/* 错误和成功消息 */}
      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded border border-green-400 bg-green-100 p-3 text-green-700">
          {success}
        </div>
      )}

      {/* 铸造代币 */}
      <div className="mb-6 rounded-lg border p-4">
        <h4 className="mb-3 font-semibold">铸造代币</h4>
        <div className="space-y-3">
          <input
            type="number"
            placeholder="输入铸造数量 (例如: 100)"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="w-full rounded border p-2"
            step="0.00000001"
            min="0"
          />
          <button
            onClick={handleMint}
            disabled={loading || !mintAmount}
            className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "铸造中..." : "铸造 ckBTC"}
          </button>
        </div>
      </div>

      {/* 转账 */}
      <div className="mb-6 rounded-lg border p-4">
        <h4 className="mb-3 font-semibold">转账</h4>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="接收方 Principal (例如: 2vxsx-fae)"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
            className="w-full rounded border p-2"
          />
          <input
            type="number"
            placeholder="转账数量 (例如: 10)"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="w-full rounded border p-2"
            step="0.00000001"
            min="0"
          />
          <button
            onClick={handleTransfer}
            disabled={loading || !transferAmount || !transferTo}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "转账中..." : "转账 ckBTC"}
          </button>
        </div>
      </div>

      {/* 代币信息 */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h4 className="mb-2 font-semibold">代币信息</h4>
        <div className="space-y-1 text-sm">
          <p>
            <strong>代币名称:</strong> ckBTC (Local)
          </p>
          <p>
            <strong>代币符号:</strong> ckBTC
          </p>
          <p>
            <strong>小数位数:</strong> 8
          </p>
          <p>
            <strong>Ledger Canister:</strong> q3fc5-haaaa-aaaaa-aaahq-cai
          </p>
          <p>
            <strong>环境:</strong> 本地开发
          </p>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="mt-4">
        <h4 className="mb-2 font-semibold">快速铸造</h4>
        <div className="flex flex-wrap gap-2">
          {[1, 10, 100, 1000].map((amount) => (
            <button
              key={amount}
              onClick={() => setMintAmount(amount.toString())}
              className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
            >
              {amount} ckBTC
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
