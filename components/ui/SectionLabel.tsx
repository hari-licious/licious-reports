/*
 * Eyebrow label used before each content section.
 * Style: small, uppercase, gray-400, wide tracking.
 * Always renders with mb-3; add extra top margin at the call site when needed.
 */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}
