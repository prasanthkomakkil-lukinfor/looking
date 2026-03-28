import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BarChart3, MessageSquare, FileText, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalPosts: number;
  activePosts: number;
  totalChats: number;
  acceptedChats: number;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    activePosts: 0,
    totalChats: 0,
    acceptedChats: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user?.id]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Get posts count
      const { count: totalPosts } = await supabase
        .from('requirements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: activePosts } = await supabase
        .from('requirements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Get chats count
      const { count: totalChats } = await supabase
        .from('chat_requests')
        .select('*', { count: 'exact', head: true })
        .or(`seeker_id.eq.${user.id},provider_id.eq.${user.id}`);

      const { count: acceptedChats } = await supabase
        .from('chat_requests')
        .select('*', { count: 'exact', head: true })
        .or(`seeker_id.eq.${user.id},provider_id.eq.${user.id}`)
        .eq('status', 'ACCEPTED');

      setStats({
        totalPosts: totalPosts || 0,
        activePosts: activePosts || 0,
        totalChats: totalChats || 0,
        acceptedChats: acceptedChats || 0,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Active Posts',
      value: stats.activePosts,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Chat Requests',
      value: stats.totalChats,
      icon: MessageSquare,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Accepted Chats',
      value: stats.acceptedChats,
      icon: BarChart3,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Your activity overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <p className="font-semibold text-gray-900">Manage Posts</p>
            <p className="text-sm text-gray-600">View and edit your requirements</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <p className="font-semibold text-gray-900">View Messages</p>
            <p className="text-sm text-gray-600">Check pending chat requests</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <p className="font-semibold text-gray-900">Upgrade Plan</p>
            <p className="text-sm text-gray-600">Get premium features</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <p className="font-semibold text-gray-900">Profile Settings</p>
            <p className="text-sm text-gray-600">Update your information</p>
          </button>
        </div>
      </div>
    </div>
  );
}
