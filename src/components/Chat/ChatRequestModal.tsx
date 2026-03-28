import { useState } from 'react';
import { X, Send, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Requirement {
  id: string;
  title: string;
  user_id: string;
}

interface ChatRequestModalProps {
  requirement: Requirement;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChatRequestModal({ requirement, onClose, onSuccess }: ChatRequestModalProps) {
  const { user } = useAuth();
  const [introMessage, setIntroMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !introMessage.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('chat_requests')
        .insert({
          requirement_id: requirement.id,
          provider_id: user.id,
          seeker_id: requirement.user_id,
          intro_message: introMessage.trim(),
          status: 'PENDING',
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send chat request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
          <p className="text-gray-600">The seeker will review your request and get back to you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Send Chat Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Requesting to chat about: <span className="font-semibold">{requirement.title}</span>
            </p>
          </div>

          <div>
            <label htmlFor="intro" className="block text-sm font-medium text-gray-700 mb-2">
              Introduction Message
            </label>
            <textarea
              id="intro"
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you're interested in this requirement. Be brief and professional."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {introMessage.length}/500 characters
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
              <Shield size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Seeker Approval Required</p>
                <p className="text-xs mt-1">Your contact details stay hidden until they accept your request</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Be Genuine</p>
                <p className="text-xs mt-1">Write a professional message explaining why you're interested</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !introMessage.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
