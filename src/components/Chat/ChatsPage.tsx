import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Clock, CheckCircle, XCircle, Shield } from 'lucide-react';

interface ChatRequest {
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  message: string;
  created_at: string;
  requirement_id: string;
  requester_id: string;
  requirement: { title: string; category: string } | null;
  requester: { name: string | null; phone: string | null } | null;
}

export function ChatsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_requests')
        .select(`
          *,
          requirement:requirement_id (title, category),
          requester:requester_id (name, phone)
        `)
        .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, status: 'accepted' | 'rejected' | 'blocked') => {
    setActionLoading(requestId);
    try {
      const { error } = await supabase
        .from('chat_requests')
        .update({ status })
        .eq('id', requestId);
      if (error) throw error;
      await loadRequests();
    } catch (err) {
      console.error('Error updating request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const statusConfig = {
    pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-700',  icon: Clock },
    accepted: { label: 'Accepted', color: 'bg-teal-100 text-teal-700',    icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600',      icon: XCircle },
    blocked:  { label: 'Blocked',  color: 'bg-gray-100 text-gray-500',    icon: XCircle },
  };

  const filtered = requests.filter(r =>
    activeFilter === 'all' ? true : r.status === activeFilter
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-extrabold text-gray-900">Chat Requests</h1>
          {pendingCount > 0 && (
            <span className="bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingCount} new
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-3">You decide who can chat with you</p>

        {/* Filters */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: `All (${requests.length})` },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'accepted', label: 'Active' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeFilter === f.id ? 'text-white' : 'bg-gray-100 text-gray-600'
              }`}
              style={activeFilter === f.id ? { background: '#4db6ac' } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trust signal */}
      <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-xs text-teal-700">
        <Shield size={12} /> REQUEST → APPROVAL → CHAT. You are always in control.
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <MessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No chat requests yet</p>
            <p className="text-gray-300 text-xs mt-1">
              {user?.primary_role === 'seeker'
                ? 'Providers will send requests when they see your posts'
                : 'Browse requirements and send chat requests'}
            </p>
          </div>
        ) : (
          filtered.map((req) => {
            const cfg = statusConfig[req.status];
            const StatusIcon = cfg.icon;
            const isOwner = req.requester_id !== user?.id;

            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                {/* Top row */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm text-gray-900">
                      {isOwner
                        ? (req.requester?.name || 'Anonymous Provider')
                        : 'Your Request'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Re: {req.requirement?.title || 'Requirement'}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                    <StatusIcon size={11} /> {cfg.label}
                  </span>
                </div>

                {/* Message */}
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mb-3 italic">
                  "{req.message}"
                </p>

                {/* Actions for pending requests (only if you're the seeker/owner) */}
                {req.status === 'pending' && isOwner && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(req.id, 'accepted')}
                      disabled={actionLoading === req.id}
                      className="flex-1 py-2 rounded-lg text-white text-xs font-semibold disabled:opacity-50"
                      style={{ background: '#4db6ac' }}
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'rejected')}
                      disabled={actionLoading === req.id}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold disabled:opacity-50"
                    >
                      ✗ Reject
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'blocked')}
                      disabled={actionLoading === req.id}
                      className="px-3 py-2 rounded-lg bg-red-50 text-red-500 text-xs font-semibold disabled:opacity-50"
                    >
                      Block
                    </button>
                  </div>
                )}

                {req.status === 'accepted' && (
                  <button
                    className="w-full py-2 rounded-lg text-white text-xs font-semibold"
                    style={{ background: '#4db6ac' }}
                  >
                    Open Chat →
                  </button>
                )}

                {req.status === 'pending' && !isOwner && (
                  <p className="text-xs text-amber-600 text-center">
                    ⏳ Waiting for approval...
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
