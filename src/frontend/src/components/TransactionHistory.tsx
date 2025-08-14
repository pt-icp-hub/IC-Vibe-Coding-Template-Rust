// 交易记录接口定义
interface Transaction {
  id: string; // 交易唯一标识符
  type: "supply" | "withdraw" | "borrow" | "repay"; // 交易类型：供应、提取、借贷、还款
  asset: string; // 涉及的资产符号
  amount: number; // 交易金额
  timestamp: number; // 交易时间戳
  txHash: string; // 交易哈希
  status: "pending" | "success" | "failed"; // 交易状态
}

// 交易历史组件的属性接口
interface TransactionHistoryProps {
  transactions: Transaction[]; // 交易记录列表
  connectedWallet: string | null; // 连接的钱包地址
}

// 交易历史组件 - 显示用户的交易记录和状态
export const TransactionHistory = ({
  transactions,
  connectedWallet,
}: TransactionHistoryProps) => {
  // 格式化时间戳为可读的日期格式
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short", // 短月份名称
      day: "numeric", // 日期数字
      hour: "2-digit", // 2位数小时
      minute: "2-digit", // 2位数分钟
    });
  };

  // 根据交易状态获取相应的颜色样式
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": // 成功状态 - 绿色
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      case "pending": // 待处理状态 - 黄色
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
      case "failed": // 失败状态 - 红色
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
      default: // 默认状态 - 灰色
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  // 根据交易类型获取相应的图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "supply": // 供应图标
        return "📥";
      case "withdraw": // 提取图标
        return "📤";
      case "borrow": // 借贷图标
        return "💳";
      case "repay": // 还款图标
        return "💰";
      default:
        return "📋";
    }
  };

  // 根据交易类型获取相应的文字颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case "supply": // 供应 - 蓝色
        return "text-blue-600 dark:text-blue-400";
      case "withdraw": // 提取 - 橙色
        return "text-orange-600 dark:text-orange-400";
      case "borrow": // 借贷 - 绿色
        return "text-green-600 dark:text-green-400";
      case "repay": // 还款 - 紫色
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  // 如果钱包未连接，显示提示界面
  if (!connectedWallet) {
    return (
      <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-8 text-center shadow-lg backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/70">
        {/* 文档图标 */}
        <div className="mb-4 text-4xl">📋</div>

        {/* 标题 */}
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Transaction History
        </h3>

        {/* 提示文本 */}
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet to view your transaction history
        </p>
      </div>
    );
  }

  return (
    // 主容器 - 使用毛玻璃效果
    <div className="rounded-2xl border border-gray-200/50 bg-white/70 shadow-lg backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/70">
      {/* 头部区域 */}
      <div className="border-b border-gray-200/50 px-6 py-4 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          {/* 标题 */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>

          {/* 实时状态指示器 */}
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Live
            </span>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {/* 如果没有交易记录，显示空状态 */}
        {transactions.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-4xl">🚀</div>
            <p className="text-gray-600 dark:text-gray-400">
              No transactions yet. Make your first supply to get started!
            </p>
          </div>
        ) : (
          // 交易记录列表
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl bg-gray-50/70 p-4 transition-all duration-200 hover:bg-gray-100/70 dark:bg-gray-700/70 dark:hover:bg-gray-600/70"
              >
                {/* 左侧：交易信息 */}
                <div className="flex items-center space-x-4">
                  {/* 交易类型图标 */}
                  <div className="text-2xl">{getTypeIcon(tx.type)}</div>

                  <div>
                    {/* 交易类型和金额 */}
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-semibold capitalize ${getTypeColor(tx.type)}`}
                      >
                        {tx.type}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tx.amount.toFixed(4)} {tx.asset}
                      </span>
                    </div>

                    {/* 时间和交易哈希 */}
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(tx.timestamp)}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">
                        •
                      </span>
                      {/* 交易哈希链接 */}
                      <button
                        onClick={() =>
                          window.open(
                            `https://etherscan.io/tx/${tx.txHash}`,
                            "_blank",
                          )
                        }
                        className="text-sm text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {tx.txHash}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 右侧：状态和加载指示器 */}
                <div className="flex items-center space-x-3">
                  {/* 状态标签 */}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(tx.status)}`}
                  >
                    {tx.status}
                  </span>

                  {/* 待处理状态的加载动画 */}
                  {tx.status === "pending" && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 如果有交易记录，显示"查看全部"按钮 */}
        {transactions.length > 0 && (
          <div className="mt-6 text-center">
            <button className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              View All Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
