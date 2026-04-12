import { useState, useEffect } from 'react';
import { MapPin, Lock, MessageSquare, Shield, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory_id: string;
  city: string;
  area: string;
  budget_min: number | null;
  budget_max: number | null;
  is_anonymous: boolean;
  created_at: string;
  user_id: string;
}

export function HomePage() {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'real_estate' | 'services'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRequirements();
  }, [filter]);

  const loadRequirements = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('requirements')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('category', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRequirements(data || []);
    } catch (err) {
      console.error('Error loading requirements:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    return `Up to ₹${max?.toLocaleString()}`;
  };

  const getTimeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const filtered = requirements.filter(r =>
    search === '' ||
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-extrabold text-gray-900">LookingFor</h1>
          <span className="text-xs text-gray-400">{filtered.length} requirements</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">Browse requirements near you</p>

        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 mb-3">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'real_estate', label: '🏠 Real Estate' },
            { id: 'services', label: '🛠 Services' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f.id
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
              style={filter === f.id ? { background: '#4db6ac' } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trust signals */}
      <div className="flex gap-2 px-4 py-2 bg-teal-50">
        <div className="flex items-center gap-1 text-xs text-teal-700">
          <Shield size={12} /> You approve who contacts you
        </div>
        <div className="flex items-center gap-1 text-xs text-teal-700">
          <Lock size={12} /> Numbers always locked
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
            <p className="text-gray-400 text-sm mt-3">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-400 text-sm">No requirements found</p>
            <p className="text-gray-300 text-xs mt-1">Check back later</p>
          </div>
        ) : (
          filtered.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              {/* Tags */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                  {req.category === 'real_estate' ? '🏠 Real Estate' : '🛠 Services'}
                </span>
                {req.subcategory_id && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                    {req.subcategory_id}
                  </span>
                )}
                {req.is_anonymous && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 flex items-center gap-1">
                    <Lock size={10} /> Anonymous
                  </span>
                )}
                <span className="ml-auto text-xs text-gray-300">{getTimeAgo(req.created_at)}</span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 text-sm mb-1">{req.title}</h3>
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">{req.description}</p>

              {/* Location & Budget */}
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {req.area}, {req.city}
                </span>
                {formatBudget(req.budget_min, req.budget_max) && (
                  <span className="font-semibold text-gray-600">
                    {formatBudget(req.budget_min, req.budget_max)}
                  </span>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center justify-between">
                {user?.id !== req.user_id && (
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
                    style={{ background: '#4db6ac' }}
                  >
                    <MessageSquare size={13} /> Request Chat
                  </button>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-300 ml-auto">
                  <Lock size={11} /> Contact locked
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
