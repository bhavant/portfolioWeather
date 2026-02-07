/**
 * RecentSearches Component
 *
 * Displays a horizontal, scrollable list of up to 5 recent search terms.
 * Each pill is clickable and triggers a new weather fetch for that term.
 * Most recent search appears first (leftmost).
 */

import { RecentSearchesProps } from '../types';

export function RecentSearches({ searches, onSelect }: RecentSearchesProps) {
  // Don't render anything if there are no recent searches
  if (searches.length === 0) return null;

  return (
    <div className="w-full max-w-xl mx-auto mt-4">
      {/* Section label */}
      <p className="text-xs uppercase tracking-wider opacity-60 mb-2">
        Recent Searches
      </p>

      {/* Horizontal scrollable pill list */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
        role="list"
        aria-label="Recent searches"
      >
        {searches.map((search) => (
          <button
            key={search}
            onClick={() => onSelect(search)}
            role="listitem"
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm
                       bg-white/15 backdrop-blur-sm border border-white/20
                       hover:bg-white/25 active:scale-95
                       transition-all duration-200 whitespace-nowrap"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
}
