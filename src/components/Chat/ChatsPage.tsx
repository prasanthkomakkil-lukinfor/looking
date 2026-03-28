import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MessageSquare, CheckCircle, XCircle } from 'lucide-react';

interface ChatRequest {
  id: string;
  status: string;
  intro_message: string;
  created_at: string;
  requirement: {
    title: string;
  };
  provider: {
    name: string | null;
  };
  seeker: {
    name: string | null;
  };
}

export function ChatsPage() {
  const { user } = useAuth();
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'all'>('pending');

  useEffect(() => {
    loadChats();
  }, [filter]);

  const loadChats = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let query = supabase
        .from('chat_requests')
        .select(`
          *,
          requirement: requirement_id (
            title
          ),
          provider: provider_id (
            name
          ),
          seeker: seeker_id (
            name
          )
        `)
        .or(`seeker_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter.toUpperCase());
      }

      const { data, error } = await query;
      if (error) throw error;
      setChatRequests(data || []);
    } catch (err) {
      console.error('Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('chat_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      loadChats();
    } catch (err) {
      console.error('Error updating chat status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Chat Requests</h2>
        <p className="text-gray-600">Manage your chat requests and conversations</p>
      </div>

      <div className="flex gap-3 mb-6">
        {(['pending', 'accepted', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {chatRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No chat requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chatRequests.map((chat) => (
            <div key={chat.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(chat.status)}`}>
                      {chat.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{chat.requirement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {user?.id === chat.seeker_id
                      ? `From: ${chat.provider.name || 'Provider'}`
                      : `To: ${chat.seeker.name || 'Seeker'}`}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{chat.intro_message}</p>

              {user?.id === chat.seeker_id && chat.status === 'PENDING' && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleUpdateStatus(chat.id, 'ACCEPTED')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <CheckCircle size={18} />
                    Accept
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(chat.id, 'REJECTED')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
