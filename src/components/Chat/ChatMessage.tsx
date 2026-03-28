import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Lock, AlertCircle, Send, ArrowUp } from 'lucide-react';

interface ChatMessageProps {
  chatRequestId: string;
  seekerId: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_number: number;
  created_at: string;
}

const FREE_MESSAGE_LIMIT = 3;

export function ChatMessage({ chatRequestId, seekerId }: ChatMessageProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    if (user) {
      loadMessages();
      checkPremium();
    }
  }, [user, chatRequestId]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_request_id', chatRequestId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);

      // Count user's messages
      const userMsgs = (data || []).filter((m) => m.sender_id === user?.id).length;
      setUserMessageCount(userMsgs);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPremium = async () => {
    if (!user) return;

    try {
      const { count } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString().split('T')[0]);

      setIsPremium((count || 0) > 0);
    } catch (err) {
      console.error('Error checking premium:', err);
    }
  };

  const canSendMessage = () => {
    if (isPremium) return true;
    return userMessageCount < FREE_MESSAGE_LIMIT;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || !canSendMessage()) return;

    setSending(true);

    try {
      const messageNumber = userMessageCount + 1;

      const { error } = await supabase.from('chat_messages').insert({
        chat_request_id: chatRequestId,
        sender_id: user.id,
        content: newMessage.trim(),
        message_number: messageNumber,
        is_contact_revealed: contactVisible,
      });

      if (error) throw error;

      setNewMessage('');
      setUserMessageCount(messageNumber);
      loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading messages...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col">
      {/* Contact Protection Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start gap-3">
        <Lock size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900">Contact details are locked</p>
          <p className="text-blue-700 text-xs mt-1">
            {isPremium ? 'Premium: Contact visible' : 'Upgrade to premium to unlock contact details'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_id === user?.id
                    ? 'bg-green-100 text-green-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">Message {msg.message_number}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Limit Warning */}
      {!isPremium && userMessageCount >= FREE_MESSAGE_LIMIT && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-900">Message limit reached</p>
            <p className="text-red-700 text-xs mt-1">Upgrade to premium for unlimited messages</p>
          </div>
        </div>
      )}

      {/* Send Message Form */}
      <form onSubmit={handleSendMessage} className="space-y-3">
        {!isPremium && userMessageCount < FREE_MESSAGE_LIMIT && (
          <div className="text-xs text-gray-500 text-center">
            {FREE_MESSAGE_LIMIT - userMessageCount} message{FREE_MESSAGE_LIMIT - userMessageCount !== 1 ? 's' : ''} left
          </div>
        )}

        {canSendMessage() ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-orange-900 mb-2">Upgrade to continue conversation</p>
            <button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
              <ArrowUp size={16} />
              Upgrade to Premium
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
