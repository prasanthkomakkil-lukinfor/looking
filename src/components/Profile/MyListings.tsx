import { useEffect, useState } from 'react';
import { Home, Briefcase, MapPin, IndianRupee, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/supabase';

type Listing = Database['public']['Tables']['listings']['Row'];

export function MyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'fulfilled' | 'expired'>('all');

  useEffect(() => {
    if (user) {
      loadMyListings();
    }
  }, [user, filter]);

  const loadMyListings = async () => {
    if (!user) return;

    setLoading(true);
    let query = supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading listings:', error);
    } else {
      setListings(data);
    }
    setLoading(false);
  };

  const updateListingStatus = async (listingId: string, newStatus: 'active' | 'fulfilled' | 'expired') => {
    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', listingId);

    if (error) {
      console.error('Error updating listing:', error);
    } else {
      loadMyListings();
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (error) {
      console.error('Error deleting listing:', error);
    } else {
      loadMyListings();
    }
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget not specified';
    if (min && max) return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
    if (min) return `₹${min.toLocaleString('en-IN')}+`;
    if (max) return `Up to ₹${max.toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      fulfilled: 'bg-blue-100 text-blue-700',
      expired: 'bg-gray-100 text-gray-700',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          My Listings
        </h2>
        <p className="text-gray-600">
          Manage your posted requirements
        </p>
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {['all', 'active', 'fulfilled', 'expired'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              filter === status
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600">No listings found.</p>
          <p className="text-gray-500 text-sm mt-2">Create a new listing to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {listing.category === 'real_estate' ? (
                    <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                      <Home size={20} />
                    </div>
                  ) : (
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                      <Briefcase size={20} />
                    </div>
                  )}
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {listing.category.replace('_', ' ')}
                  </span>
                </div>
                {getStatusBadge(listing.status)}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {listing.title}
              </h3>

              <p className="text-gray-700 mb-4 line-clamp-2">
                {listing.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <IndianRupee size={16} className="text-gray-400" />
                  <span>{formatBudget(listing.budget_min, listing.budget_max)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                {listing.status === 'active' && (
                  <button
                    onClick={() => updateListingStatus(listing.id, 'fulfilled')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <CheckCircle size={16} />
                    Mark as Fulfilled
                  </button>
                )}

                {listing.status === 'fulfilled' && (
                  <button
                    onClick={() => updateListingStatus(listing.id, 'active')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    Reactivate
                  </button>
                )}

                {listing.status === 'expired' && (
                  <button
                    onClick={() => updateListingStatus(listing.id, 'active')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    Reactivate
                  </button>
                )}

                <button
                  onClick={() => deleteListing(listing.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium ml-auto"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
