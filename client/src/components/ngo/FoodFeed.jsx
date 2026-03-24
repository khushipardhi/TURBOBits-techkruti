import FoodCard from './FoodCard';
import EmptyState from '../common/EmptyState';
import { Search } from 'lucide-react';

export default function FoodFeed({ listings, receiverId, onClaimed }) {
  if (listings.length === 0) {
    return <EmptyState icon={Search} title="No food available right now" description="Check back soon — donors post new food regularly." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <FoodCard
          key={listing.food_id}
          listing={listing}
          receiverId={receiverId}
          onClaimed={onClaimed}
        />
      ))}
    </div>
  );
}
