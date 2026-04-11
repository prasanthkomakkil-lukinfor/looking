import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingFlowProps {
  onComplete: (role: 'seeker' | 'provider') => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'seeker' | 'provider'>('seeker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name'); return; }
    setLoading(true);
    const result = await updateProfile(name, role);
    if (result.success) {
      onComplete(role);
    } else {
      setError(result.error || 'Failed to save profile');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">👋</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome!</h1>
          <p className="text-gray-500 text-sm mt-1">Let's set up your profile</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prashanth K"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">I am primarily a...</label>
            <div className="space-y-2">
              {[
                { value: 'seeker', label: '🔍 Seeker', desc: 'I post requirements & approve who contacts me' },
                { value: 'provider', label: '🛠 Provider', desc: 'I offer services & respond to requirements' },
              ].map((r) => (
                <div
                  key={r.value}
                  onClick={() => setRole(r.value as 'seeker' | 'provider')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    role === r.value ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`font-semibold text-sm ${role === r.value ? 'text-teal-700' : 'text-gray-800'}`}>{r.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
            style={{ background: '#4db6ac' }}
          >
            {loading ? 'Saving...' : 'Continue →'}
          </button>
        </form>
      </div>
    </div>
  );
}
