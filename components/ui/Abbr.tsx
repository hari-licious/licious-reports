export function Abbr({ children, tip, align = "center" }: {
  children: React.ReactNode;
  tip: string;
  align?: "left" | "center" | "right";
}) {
  const pos =
    align === "left"  ? "left-0" :
    align === "right" ? "right-0" :
    "left-1/2 -translate-x-1/2";

  return (
    <span className="relative inline-block group">
      <span className="border-b border-dotted border-gray-400 cursor-help">
        {children}
      </span>
      <span className={`pointer-events-none absolute bottom-full ${pos} z-50 mb-2 w-48 rounded-lg bg-gray-900 px-3 py-2 text-center text-xs leading-relaxed text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-lg`}>
        {tip}
      </span>
    </span>
  );
}
