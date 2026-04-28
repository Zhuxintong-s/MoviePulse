import React from 'react';
import { ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const FilterBar = ({ 
  currentSort, 
  onSortChange, 
  genres = [], 
  regions = [] 
}) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const categories = [
    { id: 'popular', label: 'Popular' },
    { id: 'now_playing', label: 'Now Playing' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'top_rated', label: 'Top Rated' }
  ];

  const FilterSection = ({ title, children, className }) => (
    <div className={cn("mb-6 md:mb-8", className)}>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-l-2 border-rose-200 pl-2">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );

  const SortButton = ({ active, onClick, children, className }) => (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border w-full text-left",
        active 
          ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20 z-10 scale-[1.02]" 
          : "bg-white border-gray-100 text-gray-500 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50/30",
        className
      )}
    >
      {children}
    </button>
  );

  const getSortDescription = () => {
    const dimMap = {
      popular: 'Popular',
      now_playing: 'Now Playing',
      upcoming: 'Upcoming',
      top_rated: 'Top Rated',
      year: 'Year',
      type: 'Genre',
      stars: 'Rating',
      letter: 'Letter',
      region: 'Region'
    };
    const dirMap = {
      desc: 'Descending',
      asc: 'Ascending'
    };
    return `Active: ${dimMap[currentSort.dimension] || 'Popular'}${currentSort.dimension === 'year' ? ` (${dirMap[currentSort.direction]})` : ''}`;
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="sticky top-20">
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <Filter size={18} />
              <span className="font-black text-sm uppercase tracking-tighter">Smart Filter</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{getSortDescription()}</p>
          </div>

          <div className="space-y-6">
            {/* Categories & Main Sorts */}
            <FilterSection title="Explore">
              <div className="flex flex-col gap-1.5 w-full">
                {categories.map(cat => (
                  <SortButton 
                    key={cat.id}
                    active={currentSort.dimension === cat.id}
                    onClick={() => onSortChange(cat.id, 'desc')}
                  >
                    {cat.label}
                  </SortButton>
                ))}
                
                {/* Year Sort - Peer to categories */}
                <SortButton 
                  active={currentSort.dimension === 'year'} 
                  onClick={() => onSortChange('year', currentSort.dimension === 'year' && currentSort.direction === 'desc' ? 'asc' : 'desc')}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Release Year</span>
                    {currentSort.dimension === 'year' && (
                      currentSort.direction === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />
                    )}
                  </div>
                </SortButton>
              </div>
            </FilterSection>

            {/* Region Filter - New Peer Group */}
            <FilterSection title="Region">
              <div className="flex flex-col gap-1.5 w-full">
                {regions.map(region => (
                  <SortButton
                    key={region}
                    active={currentSort.dimension === 'region' && currentSort.value === region}
                    onClick={() => onSortChange('region', 'desc', region)}
                  >
                    {region}
                  </SortButton>
                ))}
              </div>
            </FilterSection>

            {/* Genre Filter */}
            <FilterSection title="Genre">
              <div className="grid grid-cols-2 gap-1.5 w-full">
                {genres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => onSortChange('type', 'desc', genre)}
                    className={cn(
                      "px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border text-center truncate",
                      currentSort.dimension === 'type' && currentSort.value === genre
                        ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                        : "bg-white border-gray-100 text-gray-500 hover:border-rose-200 hover:text-rose-500"
                    )}
                    title={genre}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Letter Filter - Also a peer group */}
            <FilterSection title="Alphabet">
              <div className="grid grid-cols-6 gap-1 w-full">
                {letters.map(letter => (
                  <button
                    key={letter}
                    onClick={() => onSortChange('letter', 'asc', letter)}
                    className={cn(
                      "h-8 flex items-center justify-center rounded-lg text-[10px] font-black transition-all border",
                      currentSort.dimension === 'letter' && currentSort.value === letter
                        ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                        : "bg-gray-50 text-gray-400 border-transparent hover:border-rose-200 hover:text-rose-500"
                    )}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </FilterSection>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterBar;
