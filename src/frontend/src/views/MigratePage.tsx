import React from "react";
import { useLanguage } from "../hooks/useLanguage";

export default function MigratePage() {
  const { t, language } = useLanguage();
  // 跳转函数（假设用 window.location.hash 或其它路由方式）
  const goToEarn = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentPage", "earn");
      window.location.reload();
    }
  };
  const goToBorrow = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentPage", "borrow");
      window.location.reload();
    }
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 pt-24">
      <h1 className="mb-4 text-4xl font-bold">
        {language === "zh" ? "教程" : "Guide"}
      </h1>
      <p className="mb-8 text-gray-600">
        {t(
          "This page explains the underlying logic and advantages of the Earn and Borrow features on our platform.",
        )}
      </p>

      {/* Earn 机制介绍 */}
      <section className="mb-10">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {t("Earn: How You Earn Yield")}
          </h2>
          <button
            className="min-w-[140px] rounded bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 text-base font-semibold text-white shadow transition hover:from-blue-600 hover:to-purple-600"
            onClick={goToEarn}
          >
            {t("Go to Earn")}
          </button>
        </div>
        <div className="mt-4 rounded border-l-4 border-blue-400 bg-blue-50 p-4 text-blue-800">
          {t("earn_description")}
        </div>
        <ol className="mt-4 space-y-6">
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/60 text-lg font-bold text-white">
                1
              </span>
            </div>
            <div>
              <div className="mb-1 text-base font-semibold">
                {t("step1_title")}
              </div>
              <div className="text-gray-700">{t("step1_description")}</div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/60 text-lg font-bold text-white">
                2
              </span>
            </div>
            <div>
              <div className="mb-1 text-base font-semibold">
                {t("step2_title")}
              </div>
              <div className="text-gray-700">{t("step2_description")}</div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/60 text-lg font-bold text-white">
                3
              </span>
            </div>
            <div>
              <div className="mb-1 text-base font-semibold">
                {t("step3_title")}
              </div>
              <div className="text-gray-700">{t("step3_description")}</div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/60 text-lg font-bold text-white">
                4
              </span>
            </div>
            <div>
              <div className="mb-1 text-base font-semibold">
                {t("step4_title")}
              </div>
              <div className="text-gray-700">{t("step4_description")}</div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/60 text-lg font-bold text-white">
                5
              </span>
            </div>
            <div>
              <div className="mb-1 text-base font-semibold">
                {t("step5_title")}
              </div>
              <div className="text-gray-700">{t("step5_description")}</div>
            </div>
          </li>
        </ol>
      </section>

      {/* Borrow 机制介绍 */}
      <section className="mb-10">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {t("Borrow: How You Borrow Assets")}
          </h2>
          <button
            className="min-w-[140px] rounded bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 text-base font-semibold text-white shadow transition hover:from-blue-600 hover:to-purple-600"
            onClick={goToBorrow}
          >
            {t("Go to Borrow")}
          </button>
        </div>
        <div className="mt-4 rounded border-l-4 border-purple-400 bg-purple-50 p-4 text-purple-800">
          {t("borrow_description")}
        </div>
        <ol className="mt-4 space-y-6">
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-400/60 text-lg font-bold text-white">
                1
              </span>
            </div>
            <div>
              <div className="mb-1 text-base font-semibold">
                {t("borrow_step1_title")}
              </div>
              <div className="text-gray-700">
                {t("borrow_step1_description")}
              </div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-400/60 text-lg font-bold text-white">
                2
              </span>
            </div>
            <div>
              <div className="mb-1 text-base font-semibold">
                {t("borrow_step2_title")}
              </div>
              <div className="text-gray-700">
                {t("borrow_step2_description")}
              </div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-400/60 text-lg font-bold text-white">
                3
              </span>
            </div>
            <div>
              <div className="mb-1 text-base font-semibold">
                {t("borrow_step3_title")}
              </div>
              <div className="text-gray-700">
                {t("borrow_step3_description")}
              </div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-400/60 text-lg font-bold text-white">
                4
              </span>
            </div>
            <div>
              <div className="mb-1 text-base font-semibold">
                {t("borrow_step4_title")}
              </div>
              <div className="text-gray-700">
                {t("borrow_step4_description")}
              </div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-400/60 text-lg font-bold text-white">
                5
              </span>
            </div>
            <div>
              <div className="mb-1 text-base font-semibold">
                {t("borrow_step5_title")}
              </div>
              <div className="text-gray-700">
                {t("borrow_step5_description")}
              </div>
            </div>
          </li>
        </ol>
      </section>

      {/* FAQ区 */}
      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-2 font-semibold">{t("FAQ")}</h2>
        <ul className="space-y-2">
          <li>
            <div className="font-medium text-blue-700">
              {t("Is my asset safe?")}
            </div>
            <div className="text-sm text-gray-600">
              {t(
                "All operations are non-custodial and on-chain. You always control your assets.",
              )}
            </div>
          </li>
          <li>
            <div className="font-medium text-blue-700">
              {t("How is the interest rate determined?")}
            </div>
            <div className="text-sm text-gray-600">
              {t(
                "Interest rates are dynamically adjusted based on market supply and demand.",
              )}
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
