export function Abbr({ children, tip }: { children: React.ReactNode; tip: string }) {
  return (
    <span className="relative inline-block group">
      <span className="border-b border-dotted border-gray-400 cursor-help">
        {children}
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 w-48 rounded-lg bg-gray-900 px-3 py-2 text-center text-xs leading-relaxed text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-lg">
        {tip}
      </span>
    </span>
  );
}
