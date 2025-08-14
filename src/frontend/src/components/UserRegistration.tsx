// 用户注册组件
// 处理新用户的注册流程

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../hooks/useLanguage";

// 用户注册组件属性接口
interface UserRegistrationProps {
  onRegister: (username: string) => Promise<void>; // 注册回调
  onCancel: () => void; // 取消回调
  isLoading?: boolean; // 加载状态
}

// 用户注册组件
export const UserRegistration: React.FC<UserRegistrationProps> = ({
  onRegister,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useLanguage(); // 多语言Hook
  const [username, setUsername] = useState(""); // 用户名状态
  const [error, setError] = useState(""); // 错误信息状态

  // 模态框的ref，用于检测点击外部
  const modalRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭模态框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCancel]);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止默认表单提交

    // 验证用户名
    if (!username.trim()) {
      setError("请输入用户名");
      return;
    }

    if (username.length < 3) {
      setError("用户名至少需要3个字符");
      return;
    }

    try {
      setError(""); // 清除错误信息
      await onRegister(username.trim()); // 调用注册函数
    } catch (error) {
      setError(error instanceof Error ? error.message : "注册失败");
    }
  };

  // 处理用户名输入变化
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value); // 更新用户名
    if (error) {
      setError(""); // 清除错误信息
    }
  };

  return (
    // 注册表单容器
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
      >
        {/* 标题 */}
        <h2 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {t("register_user")}
        </h2>

        {/* 描述 */}
        <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
          {t("register_description")}
        </p>

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户名输入框 */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("username")}
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder={t("enter_username")}
              autoFocus
            />
          </div>

          {/* 错误信息显示 */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* 按钮组 */}
          <div className="flex space-x-3 pt-4">
            {/* 取消按钮 */}
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-gray-100 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {t("cancel")}
            </button>

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {t("registering")}
                </div>
              ) : (
                t("register")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
