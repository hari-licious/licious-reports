// Shared design tokens for all dashboards

export const COLOR_CTRL = "#94A3B8";  // control group / pre period
export const COLOR_POST = "#2563EB";  // post period
export const COLOR_TEST = "#16A34A";  // test group

export const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  fontSize: 12,
  color: "#111827",
};

export const LEGEND_PROPS = {
  iconType: "circle" as const,
  iconSize: 8,
  wrapperStyle: { fontSize: 11, paddingTop: 12, color: "#6B7280" },
};
