import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { LogOut, FileText, MessageSquare, CheckCircle, Clock, Lock } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: any) => void;
}

interface Requirement {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  is_anonymous: boolean;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, signOut } = useAuth();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [chatStats, setChatStats] = useState({ total: 0, pending: 0, accepted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [reqRes, chatRes] = await Promise.all([
        supabase
          .from('requirements')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('chat_requests')
          .select('status')
          .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`),
      ]);

      setRequirements(reqRes.data || []);

      const chats = chatRes.data || [];
      setChatStats({
        total: chats.length,
        pending: chats.filter(c => c.status === 'pending').length,
        accepted: chats.filter(c => c.status === 'accepted').length,
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {user?.name || 'My Profile'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {user?.primary_role === 'seeker' ? '🔍 Seeker' : '🛠 Provider'} · +91 {user?.phone || user?.phone_number}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'My Posts', value: requirements.length, icon: FileText, color: 'bg-teal-50 text-teal-600' },
            { label: 'Chat Requests', value: chatStats.total, icon: MessageSquare, color: 'bg-blue-50 text-blue-600' },
            { label: 'Active Chats', value: chatStats.accepted, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
            { label: 'Pending', value: chatStats.pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className={`inline-flex p-2 rounded-lg ${s.color} mb-2`}>
                <s.icon size={16} />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Plan banner */}
        <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #4db6ac, #26a69a)' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm">Free Plan</span>
            <Lock size={14} className="opacity-70" />
          </div>
          <p className="text-xs opacity-90 mb-3">
            1 post · 3 messages per chat · Contact locked
          </p>
          <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg py-2 text-xs font-bold transition-all">
            Upgrade to Premium ₹499/yr →
          </button>
        </div>

        {/* My Posts */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h2 className="font-bold text-sm text-gray-900">My Requirements</h2>
            <button
              onClick={() => onNavigate('post')}
              className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{ color: '#4db6ac' }}
            >
              + New Post
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" />
            </div>
          ) : requirements.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FileText size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No posts yet</p>
              <button
                onClick={() => onNavigate('post')}
                className="mt-3 px-4 py-2 rounded-lg text-white text-xs font-semibold"
                style={{ background: '#4db6ac' }}
              >
                Post Your First Requirement
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requirements.map((req) => (
                <div key={req.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-semibold text-gray-800 truncate">{req.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {req.category === 'real_estate' ? '🏠' : '🛠'} {getTimeAgo(req.created_at)}
                      {req.is_anonymous && ' · 🔒 Anonymous'}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                    req.status === 'active'
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trust info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          {[
            '✅ You approve who can chat with you',
            '✅ Your number is never shared without permission',
            '🔒 Contact details locked until approval + premium',
          ].map((t) => (
            <p key={t} className="text-xs text-gray-500">{t}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
