"use client";

import { useTheme } from "@/components/ui/ThemeProvider";

export function useChartTheme() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return {
    gridStroke: dark ? "#3F3F46" : "#E5E7EB",
    tickFill:   dark ? "#A1A1AA" : "#9CA3AF",
    tooltipStyle: {
      backgroundColor: dark ? "#27272A" : "#ffffff",
      border:          `1px solid ${dark ? "#3F3F46" : "#E5E7EB"}`,
      borderRadius:    "12px",
      boxShadow:       "0 4px 16px rgba(0,0,0,0.08)",
      fontSize:        12,
      color:           dark ? "#F4F4F5" : "#111827",
    },
    legendProps: {
      iconType:     "circle" as const,
      iconSize:     8,
      wrapperStyle: { fontSize: 11, paddingTop: 12, color: dark ? "#A1A1AA" : "#6B7280" },
    },
  };
}
