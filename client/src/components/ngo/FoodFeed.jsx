import { useState } from 'react';
import FoodCard from './FoodCard';
import EmptyState from '../common/EmptyState';
import { Search, SlidersHorizontal } from 'lucide-react';

const FOOD_TYPES = ['ALL', 'VEG', 'NON_VEG', 'MIXED', 'BAKERY', 'PREPARED', 'RAW'];
const LOCATION_FILTERS = ['ALL', 'NEARBY'];

export default function FoodFeed({ listings, receiverId, onClaimed }) {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  let filtered = [...listings];

  // Type filter
  if (typeFilter !== 'ALL') {
    filtered = filtered.filter((l) => l.food_type === typeFilter);
  }

  // Location filter
  if (locationFilter === 'NEARBY') {
    filtered = filtered.filter((l) => l.is_nearby);
  }

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        (l.description || '').toLowerCase().includes(q) ||
        (l.donor_name || '').toLowerCase().includes(q) ||
        (l.pickup_address || '').toLowerCase().includes(q)
    );
  }

  const chipClass = (active) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer border ${
      active
        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
        : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--card-border)] hover:border-[var(--accent-primary)]/30'
    }`;

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-6 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search food, donor, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
          />
        </div>

        {/* Food Type Chips + Location */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--text-tertiary)] mr-1" />
          {FOOD_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={chipClass(typeFilter === type)}
            >
              {type === 'ALL' ? '🍽 All' : type === 'VEG' ? '🥬 Veg' : type === 'NON_VEG' ? '🍗 Non-Veg' : type === 'MIXED' ? '🍱 Mixed' : type === 'BAKERY' ? '🍞 Bakery' : type === 'PREPARED' ? '🍲 Prepared' : '🥕 Raw'}
            </button>
          ))}
          <div className="w-px h-6 bg-[var(--border-color)] mx-1" />
          {LOCATION_FILTERS.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocationFilter(loc)}
              className={chipClass(locationFilter === loc)}
            >
              {loc === 'ALL' ? '🌍 All Areas' : '📍 Nearby Only'}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No food matches your filters"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">
            Showing {filtered.length} of {listings.length} listings
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => (
              <FoodCard
                key={listing.food_id}
                listing={listing}
                receiverId={receiverId}
                onClaimed={onClaimed}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
