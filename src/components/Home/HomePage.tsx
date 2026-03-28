import { useState, useEffect } from 'react';
import { MapPin, DollarSign, Eye, Lock, MessageSquare, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ChatRequestModal } from '../Chat/ChatRequestModal';

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
  views_count: number;
  created_at: string;
  user: {
    id: string;
    name: string | null;
  };
}

export function HomePage() {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [filter, setFilter] = useState<'all' | 'real_estate' | 'services'>('all');

  useEffect(() => {
    loadRequirements();
  }, [filter]);

  const loadRequirements = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('requirements')
        .select(`
          *,
          user:user_id (
            id,
            name
          )
        `)
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
    if (!min && !max) return 'Budget not specified';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    return `Up to ₹${max?.toLocaleString()}`;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse Requirements</h2>
        <p className="text-gray-600 mb-4">
          {user?.primary_role === 'provider'
            ? 'Find requirements and send chat requests to connect with seekers'
            : 'View all posted requirements'}
        </p>

        {/* Trust Signals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <Shield size={16} />
            <span>Seekers approve all contacts</span>
          </div>
          <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <Lock size={16} />
            <span>Numbers locked until approval</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('real_estate')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
            filter === 'real_estate'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Real Estate
        </button>
        <button
          onClick={() => setFilter('services')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
            filter === 'services'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Services
        </button>
      </div>

      {/* Requirements Grid */}
      {requirements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600 text-lg">No requirements found</p>
          <p className="text-gray-500 text-sm mt-2">Check back later or post a requirement</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requirements.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {req.category === 'real_estate' ? '🏠 Real Estate' : '💼 Services'}
                      </span>
                      {req.is_anonymous && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Lock size={12} /> Anonymous
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{req.title}</h3>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{req.description}</p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="flex-shrink-0" />
                    <span>{req.area}, {req.city}</span>
                  </div>
                  {(req.budget_min || req.budget_max) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign size={16} className="flex-shrink-0" />
                      <span>{formatBudget(req.budget_min, req.budget_max)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye size={14} /> {req.views_count}
                    </span>
                    <span>{getTimeAgo(req.created_at)}</span>
                  </div>
                </div>

                {user?.primary_role === 'provider' && (
                  <button
                    onClick={() => setSelectedRequirement(req)}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    <MessageSquare size={18} />
                    Request Chat
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Request Modal */}
      {selectedRequirement && user?.primary_role === 'provider' && (
        <ChatRequestModal
          requirement={selectedRequirement}
          onClose={() => setSelectedRequirement(null)}
          onSuccess={() => {
            setSelectedRequirement(null);
            loadRequirements();
          }}
        />
      )}
    </div>
  );
}
