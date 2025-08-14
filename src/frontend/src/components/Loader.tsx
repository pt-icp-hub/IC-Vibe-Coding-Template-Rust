import React from "react";

export function Loader() {
  return (
    <div className="flex items-center justify-center py-16">
      <svg
        className="animate-spin"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient
            id="apple-loader-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#4F8CFF" />
            <stop offset="100%" stopColor="#A259F7" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="24"
          cy="24"
          r="18"
          fill="none"
          stroke="url(#apple-loader-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80 40"
          filter="url(#glow)"
        />
      </svg>
    </div>
  );
}
