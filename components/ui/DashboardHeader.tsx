"use client";

/*
 * Standard dashboard header — use at the top of every dashboard.
 *
 * Props:
 *   title       (required) — page h1
 *   subtitle    (required) — context line below title (date range, cohort, etc.)
 *   updatedAt   (optional) — "pending" shows amber badge; any string shows gray "Last updated" badge; omit for no badge
 *   onDownload  (optional) — renders "↓ Download CSV" button when provided
 *   filters     (optional) — ReactNode slot for date pickers, selects, toggles; rendered below the title row
 *   className   (optional) — override outer margin; default "mb-8" (use "mb-3"/"mb-4" when filters or status strip follow)
 */

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  updatedAt?: string;
  onDownload?: () => void;
  filters?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  subtitle,
  updatedAt,
  onDownload,
  filters,
  className = "mb-8",
}: DashboardHeaderProps) {
  const isPending = updatedAt === "pending";

  return (
    <div className={className}>
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-4xl font-bold tracking-tight text-gray-900 dark:text-zinc-100"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">{subtitle}</p>
          {updatedAt !== undefined && (
            <span
              className={`inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full ${
                isPending
                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                  : "bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400"
              }`}
            >
              {isPending ? "⏳ Data pending" : `Last updated: ${updatedAt}`}
            </span>
          )}
        </div>
        {onDownload && (
          <button
            onClick={onDownload}
            className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
          >
            ↓ Download CSV
          </button>
        )}
      </div>
      {filters && <div className="mt-4">{filters}</div>}
    </div>
  );
}
