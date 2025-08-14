// 探索页面组件 - 多Tab交互版
import { useState, useEffect } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { ExploreMarketsTable } from "../components/Explore/ExploreMarketsTable";

// 占位子组件
const ExploreVaultsTable = () => (
  <div className="py-12 text-center text-gray-400">Vaults Table (TODO)</div>
);
const ExploreMoreLinks = () => (
  <div className="py-12 text-center text-gray-400">More Links (TODO)</div>
);

export const ExplorePage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"markets" | "vaults" | "more">(
    () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("exploreActiveTab");
        if (stored === "markets" || stored === "vaults" || stored === "more")
          return stored;
      }
      return "markets";
    },
  );
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("exploreActiveTab", activeTab);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pt-24 pb-12 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
            {t("page_explore_title")}
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-400">
            {t("page_explore_subtitle")}
          </p>
        </div>
        {/* Tab切换栏 */}
        <div className="mb-6 flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-2 py-3 text-base font-semibold transition-colors ${activeTab === "markets" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-600"}`}
            onClick={() => setActiveTab("markets")}
          >
            {t("markets_tab")}
          </button>
          <button
            className={`px-2 py-3 text-base font-semibold transition-colors ${activeTab === "vaults" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-600"}`}
            onClick={() => setActiveTab("vaults")}
          >
            {t("vaults_tab")}
          </button>
          <button
            className={`px-2 py-3 text-base font-semibold transition-colors ${activeTab === "more" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-600"}`}
            onClick={() => setActiveTab("more")}
          >
            {t("more_tab")}
          </button>
        </div>
        {/* Tab内容区 */}
        <div>
          {activeTab === "markets" && <ExploreMarketsTable />}
          {activeTab === "vaults" && <ExploreVaultsTable />}
          {activeTab === "more" && <ExploreMoreLinks />}
        </div>
      </div>
    </div>
  );
};
