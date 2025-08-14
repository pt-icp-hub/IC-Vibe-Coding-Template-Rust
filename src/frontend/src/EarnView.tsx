// 从React导入必要的钩子函数
import React, { useState, useEffect } from "react";
import { Asset, Transaction } from "./types";
import { useLanguage } from "./hooks/useLanguage";
import {
  Dashboard,
  AssetPool,
  LiquidityProvider,
  TransactionHistory,
  MarketDetail,
} from "./components";

// 组件属性接口
interface EarnViewProps {
  onError: (error: string) => void; // 错误处理回调函数
  setLoading: (loading: boolean) => void; // 加载状态设置回调函数
}

// 主要的借贷平台视图组件
export const EarnView = ({ onError, setLoading }: EarnViewProps) => {
  // 钱包连接状态 - 存储连接的钱包地址
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  // 资产列表状态
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: "1",
      symbol: "USDC",
      name: "USD Coin",
      balance: 1000,
      apy: 2.5,
      tvl: 5000000,
      supplied: 500,
      borrowed: 0,
      icon: "💵",
      collateralFactor: 0.8,
      liquidationThreshold: 0.85,
      borrowRate: 3.2,
      utilization: 0.65,
      price: 1.0,
    },
    {
      id: "2",
      symbol: "USDT",
      name: "Tether",
      balance: 2000,
      apy: 2.8,
      tvl: 3000000,
      supplied: 800,
      borrowed: 200,
      icon: "💵",
      collateralFactor: 0.75,
      liquidationThreshold: 0.8,
      borrowRate: 3.5,
      utilization: 0.72,
      price: 1.0,
    },
    {
      id: "3",
      symbol: "DAI",
      name: "Dai",
      balance: 1500,
      apy: 3.1,
      tvl: 2000000,
      supplied: 300,
      borrowed: 100,
      icon: "💵",
      collateralFactor: 0.7,
      liquidationThreshold: 0.75,
      borrowRate: 3.8,
      utilization: 0.58,
      price: 1.0,
    },
    {
      id: "4",
      symbol: "FRAX",
      name: "Frax",
      balance: 800,
      apy: 2.2,
      tvl: 1500000,
      supplied: 200,
      borrowed: 50,
      icon: "💵",
      collateralFactor: 0.65,
      liquidationThreshold: 0.7,
      borrowRate: 4.1,
      utilization: 0.45,
      price: 1.0,
    },
  ]);
  // 交易历史状态
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // 总供应金额统计
  const [totalSupplied, setTotalSupplied] = useState(0);
  // 总收益统计
  const [totalEarned, setTotalEarned] = useState(0);
  // 平均年化收益率
  const [avgApy, setAvgApy] = useState(0);
  // 当前选中的资产 (用于模态框)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  // 流动性供应模态框显示状态
  const [showLiquidityModal, setShowLiquidityModal] = useState(false);
  // 市场详情模态框显示状态
  const [showMarketDetail, setShowMarketDetail] = useState(false);

  // 组件初始化时加载模拟数据
  useEffect(() => {
    // 模拟资产数据 - 在真实应用中应该从后端API获取
    const mockAssets: Asset[] = [
      {
        id: "1",
        symbol: "USDC",
        name: "USD Coin",
        balance: 1000, // 钱包余额
        apy: 5.2, // 供应APY
        tvl: 15000000, // 总锁仓价值
        supplied: 500, // 已供应金额
        borrowed: 50, // 已借贷金额
        icon: "💰",
        collateralFactor: 80, // 80%抵押因子
        liquidationThreshold: 85, // 85%清算阈值
        borrowRate: 7.5, // 借贷利率
        utilization: 75, // 利用率
        price: 1.0, // 添加价格属性
      },
      {
        id: "2",
        symbol: "USDT",
        name: "Tether",
        balance: 750,
        apy: 4.8,
        tvl: 12000000,
        supplied: 200,
        borrowed: 0, // 无借贷
        icon: "💵",
        collateralFactor: 75,
        liquidationThreshold: 80,
        borrowRate: 8.2,
        utilization: 68,
        price: 1.0, // 添加价格属性
      },
      {
        id: "3",
        symbol: "DAI",
        name: "Dai Stablecoin",
        balance: 500,
        apy: 6.1,
        tvl: 8000000,
        supplied: 100,
        borrowed: 25,
        icon: "🏦",
        collateralFactor: 77,
        liquidationThreshold: 82,
        borrowRate: 7.8,
        utilization: 72,
        price: 1.0, // 添加价格属性
      },
      {
        id: "4",
        symbol: "WETH",
        name: "Wrapped Ethereum",
        balance: 2.5,
        apy: 3.9,
        tvl: 25000000,
        supplied: 1.2,
        borrowed: 0.3,
        icon: "⚡",
        collateralFactor: 82,
        liquidationThreshold: 87,
        borrowRate: 6.5,
        utilization: 85,
        price: 1.0, // 添加价格属性
      },
    ];

    // 模拟交易历史数据
    const mockTransactions: Transaction[] = [
      {
        id: "1",
        type: "supply", // 供应交易
        asset: "USDC",
        amount: 100,
        timestamp: Date.now() - 3600000, // 1小时前
        txHash: "0x123...abc",
        status: "success",
      },
      {
        id: "2",
        type: "borrow", // 借贷交易
        asset: "USDT",
        amount: 50,
        timestamp: Date.now() - 7200000, // 2小时前
        txHash: "0x456...def",
        status: "success",
      },
    ];

    // 设置模拟数据到状态
    setAssets(mockAssets);
    setTransactions(mockTransactions);

    // 计算统计数据
    const totalSuppliedValue = mockAssets.reduce(
      (sum, asset) => sum + asset.supplied * 1,
      0,
    );
    const totalEarnedValue = mockAssets.reduce(
      (sum, asset) => sum + (asset.supplied * asset.apy) / 100,
      0,
    );
    const avgApyValue =
      mockAssets.reduce((sum, asset) => sum + asset.apy, 0) / mockAssets.length;

    // 更新统计状态
    setTotalSupplied(totalSuppliedValue);
    setTotalEarned(totalEarnedValue);
    setAvgApy(avgApyValue);
  }, []); // 空依赖数组表示仅在组件挂载时执行一次

  // 处理钱包连接
  const handleConnectWallet = async () => {
    setLoading(true); // 开始加载
    try {
      // 模拟钱包连接过程 - 真实应用中需要集成实际的钱包连接
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟1秒延迟
      setConnectedWallet("0x1234...5678"); // 设置模拟钱包地址
    } catch (error) {
      // onError("Failed to connect wallet"); // 连接失败时显示错误
    } finally {
      setLoading(false); // 结束加载
    }
  };

  // 处理资产供应操作
  const handleSupplyAsset = async (asset: Asset, amount: number) => {
    if (!connectedWallet) {
      onError("请先连接钱包");
      return;
    }

    setLoading(true);
    try {
      console.log(`供应 ${amount} ${asset.symbol}`);

      // 模拟交易处理
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 更新资产数据
      setAssets((prevAssets) =>
        prevAssets.map((a) =>
          a.id === asset.id
            ? {
                ...a,
                supplied: a.supplied + amount,
                balance: a.balance - amount,
              }
            : a,
        ),
      );

      // 添加交易记录
      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        type: "supply",
        asset: asset.symbol,
        amount: amount,
        timestamp: Date.now(),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: "success",
      };

      setTransactions((prev) => [newTransaction, ...prev]);

      // 更新总供应量
      setTotalSupplied((prev) => prev + amount);

      console.log(`成功供应 ${amount} ${asset.symbol}`);
    } catch (error) {
      console.error("供应失败:", error);
      onError("供应操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 处理资产借贷操作
  const handleBorrowAsset = async (asset: Asset, amount: number) => {
    if (!connectedWallet) {
      onError("请先连接钱包");
      return;
    }

    setLoading(true);
    try {
      console.log(`借贷 ${amount} ${asset.symbol}`);

      // 模拟交易处理
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 更新资产数据
      setAssets((prevAssets) =>
        prevAssets.map((a) =>
          a.id === asset.id
            ? {
                ...a,
                borrowed: a.borrowed + amount,
                balance: a.balance + amount,
              }
            : a,
        ),
      );

      // 添加交易记录
      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        type: "borrow",
        asset: asset.symbol,
        amount: amount,
        timestamp: Date.now(),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: "success",
      };

      setTransactions((prev) => [newTransaction, ...prev]);

      console.log(`成功借贷 ${amount} ${asset.symbol}`);
    } catch (error) {
      console.error("借贷失败:", error);
      onError("借贷操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 处理资产还款操作
  const handleRepayAsset = async (asset: Asset, amount: number) => {
    if (!connectedWallet) {
      onError("请先连接钱包");
      return;
    }

    setLoading(true);
    try {
      console.log(`还款 ${amount} ${asset.symbol}`);

      // 模拟交易处理
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 更新资产数据
      setAssets((prevAssets) =>
        prevAssets.map((a) =>
          a.id === asset.id
            ? {
                ...a,
                borrowed: Math.max(0, a.borrowed - amount),
                balance: a.balance - amount,
              }
            : a,
        ),
      );

      // 添加交易记录
      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        type: "repay",
        asset: asset.symbol,
        amount: amount,
        timestamp: Date.now(),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: "success",
      };

      setTransactions((prev) => [newTransaction, ...prev]);

      console.log(`成功还款 ${amount} ${asset.symbol}`);
    } catch (error) {
      console.error("还款失败:", error);
      onError("还款操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 处理资产提取操作
  const handleWithdrawAsset = async (asset: Asset, amount: number) => {
    if (!connectedWallet) {
      onError("请先连接钱包");
      return;
    }

    setLoading(true);
    try {
      console.log(`提取 ${amount} ${asset.symbol}`);

      // 模拟交易处理
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 更新资产数据
      setAssets((prevAssets) =>
        prevAssets.map((a) =>
          a.id === asset.id
            ? {
                ...a,
                supplied: Math.max(0, a.supplied - amount),
                balance: a.balance + amount,
              }
            : a,
        ),
      );

      // 添加交易记录
      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        type: "withdraw",
        asset: asset.symbol,
        amount: amount,
        timestamp: Date.now(),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: "success",
      };

      setTransactions((prev) => [newTransaction, ...prev]);

      // 更新总供应量
      setTotalSupplied((prev) => Math.max(0, prev - amount));

      console.log(`成功提取 ${amount} ${asset.symbol}`);
    } catch (error) {
      console.error("提取失败:", error);
      onError("提取操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 打开流动性供应模态框
  const openLiquidityModal = (asset: Asset) => {
    setSelectedAsset(asset); // 设置选中的资产
    setShowLiquidityModal(true); // 显示流动性模态框
  };

  // 打开市场详情模态框
  const openMarketDetail = (asset: Asset) => {
    setSelectedAsset(asset); // 设置选中的资产
    setShowMarketDetail(true); // 显示市场详情模态框
  };

  const { t } = useLanguage();

  return (
    // 主容器 - 全屏高度，渐变背景
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部导航栏 - 固定在页面顶部 */}
      <div className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* 左侧：品牌标识和描述 */}
            <div className="flex items-center space-x-4">
              {/* 品牌名称 - 使用渐变文字效果 */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                💰 BLend
              </div>
              {/* 品牌描述 - 在小屏幕上隐藏 */}
              <div className="hidden text-sm text-gray-500 sm:block dark:text-gray-400">
                Decentralized Lending Protocol
              </div>
            </div>

            {/* 右侧：钱包连接器 */}
            {/* <WalletConnector
              connectedWallet={connectedWallet}
              onConnect={handleConnectWallet}
            /> */}
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 仪表板组件 - 显示总体统计信息 */}
        <Dashboard
          totalSupplied={totalSupplied}
          totalEarned={totalEarned}
          avgApy={avgApy}
          connectedWallet={connectedWallet}
        />

        {/* 资产池列表区域 */}
        <div className="mt-8">
          {/* 标题 */}
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            Available Markets
          </h2>

          {/* 资产池网格布局 - 响应式设计 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset) => (
              <AssetPool
                key={asset.id} // React key for list rendering
                asset={asset} // 传递资产数据
                onSupply={() => openLiquidityModal(asset)} // 供应按钮回调
                onViewDetails={() => openMarketDetail(asset)} // 查看详情回调
                disabled={!connectedWallet} // 钱包未连接时禁用
                isAuthenticated={!!connectedWallet}
              />
            ))}
          </div>
        </div>

        {/* 交易历史组件 */}
        <div className="mt-8">
          <TransactionHistory
            transactions={transactions}
            connectedWallet={connectedWallet}
          />
        </div>
      </div>

      {/* 流动性供应模态框 - 条件渲染 */}
      {showLiquidityModal && selectedAsset && (
        <LiquidityProvider
          asset={selectedAsset}
          onSupply={handleSupplyAsset} // 供应操作回调
          onWithdraw={handleWithdrawAsset} // 提取操作回调
          onClose={() => setShowLiquidityModal(false)} // 关闭模态框回调
        />
      )}

      {/* 市场详情模态框 - 条件渲染 */}
      {showMarketDetail && selectedAsset && (
        <MarketDetail
          asset={selectedAsset}
          onClose={() => setShowMarketDetail(false)} // 关闭模态框回调
          onSupply={handleSupplyAsset} // 供应操作回调
          onBorrow={handleBorrowAsset} // 借贷操作回调
          onRepay={handleRepayAsset} // 还款操作回调
          onWithdraw={handleWithdrawAsset} // 提取操作回调
        />
      )}
    </div>
  );
};
