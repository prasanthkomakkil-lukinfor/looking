import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';

const CATEGORIES = {
  real_estate: ['Rent', 'Buy', 'Commercial', 'PG / Shared', 'Flatmate / Roommate'],
  services: ['Electrician', 'Plumber', 'Cleaner', 'AC Repair', 'Carpenter', 'Painter', 'Housemaid', 'Houseman'],
};

interface CreatePostPageProps {
  onPostCreated: () => void;
}

export function CreatePostPage({ onPostCreated }: CreatePostPageProps) {
  const { user } = useAuth();
  const [category, setCategory] = useState<'real_estate' | 'services'>('real_estate');
  const [subcategory, setSubcategory] = useState(CATEGORIES.real_estate[0]);
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCategoryChange = (cat: 'real_estate' | 'services') => {
    setCategory(cat);
    setSubcategory(CATEGORIES[cat][0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      const { error: insertError } = await supabase.from('requirements').insert({
        user_id: user.id,
        category,
        subcategory_id: null,
subcategory: subcategory,
        city: city.trim(),
        area: area.trim(),
        title: title.trim(),
        description: description.trim(),
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        is_anonymous: isAnonymous,
        status: 'active',
      });
      if (insertError) throw insertError;
      setSuccess(true);
      setTimeout(() => onPostCreated(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Posted Successfully!</h2>
          <p className="text-gray-500 mb-6">Providers can now see your requirement and send chat requests.</p>
          <button onClick={onPostCreated} className="w-full py-3 rounded-xl text-white font-semibold" style={{ background: '#4db6ac' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Post a Requirement</h2>
        <p className="text-gray-500 text-sm mt-1">Tell providers what you need</p>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-5 flex items-start gap-2">
        <Shield className="text-teal-600 flex-shrink-0 mt-0.5" size={16} />
        <p className="text-xs text-teal-800">You approve who contacts you. No spam. No unwanted calls.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm">

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-3">
            {(['real_estate', 'services'] as const).map((cat) => (
              <button key={cat} type="button" onClick={() => handleCategoryChange(cat)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  category === cat ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600'
                }`}>
                {cat === 'real_estate' ? '🏠 Real Estate' : '🛠 Services'}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Category</label>
          <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-400">
            {CATEGORIES[category].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Kozhikode"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-400"
              required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Area</label>
            <input type="text" value={area} onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Beach Road"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-400"
              required />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you looking for?"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-400"
            required />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you need in detail..."
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-400 resize-none"
            required />
        </div>

        {/* Budget */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Budget (₹)</label>
            <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="Optional" min="0"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Budget (₹)</label>
            <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="Optional" min="0"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
        </div>

        {/* Anonymous */}
        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)}
            className="mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
              {isAnonymous ? <EyeOff size={14} /> : <Eye size={14} />} Post Anonymously
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Your name and phone won't be visible to providers</p>
          </div>
        </label>

        {error && (
          <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm flex gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
          style={{ background: '#4db6ac' }}>
          {loading ? 'Posting...' : 'Post Requirement'}
        </button>
      </form>
    </div>
  );
}
