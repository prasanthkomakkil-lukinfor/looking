import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';

const CITIES = ['Mumbai','Pune','Nagpur','Hyderabad','Bangalore','Chennai','Kochi','Coimbatore','Calicut','Trivandrum','Gurgaon','Delhi','Noida'];
const CATEGORIES = {
  real_estate: ['Rent','Buy','Commercial','PG / Shared','Flatmate / Roommate'],
  services: ['Electrician','Plumber','Cleaner','AC Repair','Carpenter','Painter','Housemaid','Houseman'],
};

export function CreatePostPage({ onPostCreated }: { onPostCreated: () => void }) {
  const { user } = useAuth();
  const [category, setCategory] = useState<'real_estate'|'services'>('real_estate');
  const [subcategory, setSubcategory] = useState('Rent');
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

  const handleCategoryChange = (cat: 'real_estate'|'services') => {
    setCategory(cat);
    setSubcategory(CATEGORIES[cat][0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(''); setLoading(true);
    try {
      const { error: err } = await supabase.from('requirements').insert({
        user_id: user.id, category,
        subcategory_id: null,
        city, area: area.trim(), title: title.trim(),
        description: description.trim(),
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        is_anonymous: isAnonymous, status: 'active',
      });
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => onPostCreated(), 1500);
    } catch (e: any) {
      setError(e.message || 'Failed to create post');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-sm w-full">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Posted!</h2>
        <p className="text-gray-500 mb-6">Providers can now see your requirement.</p>
        <button onClick={onPostCreated} className="w-full py-3 rounded-xl text-white font-semibold" style={{background:'#4db6ac'}}>Go to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Post a Requirement</h2>
      <p className="text-gray-400 text-sm mb-4">Tell providers what you need</p>
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-4 flex gap-2 items-center">
        <Shield className="text-teal-600 flex-shrink-0" size={14}/>
        <p className="text-xs text-teal-800">You approve who contacts you. No spam.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {(['real_estate','services'] as const).map(cat => (
              <button key={cat} type="button" onClick={() => handleCategoryChange(cat)}
                className={`p-3 rounded-lg border-2 text-sm font-medium ${category===cat?'border-teal-400 bg-teal-50 text-teal-700':'border-gray-200 text-gray-600'}`}>
                {cat==='real_estate'?'🏠 Real Estate':'🛠 Services'}
              </button>
            ))}
