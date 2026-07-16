import { SectionLabel } from "./SectionLabel";

/*
 * Standard glossary rendered at the bottom of every dashboard.
 * items — array of { term, def } pairs; order is preserved.
 * Renders its own "GLOSSARY" SectionLabel — do not add one at the call site.
 */

interface GlossaryItem {
  term: string;
  def: string;
}

export function GlossarySection({ items }: { items: GlossaryItem[] }) {
  return (
    <div className="mt-8">
      <SectionLabel>Glossary</SectionLabel>
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          {items.map(({ term, def }) => (
            <div key={term}>
              <dt className="text-xs font-semibold text-gray-700 dark:text-zinc-300">{term}</dt>
              <dd className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{def}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
