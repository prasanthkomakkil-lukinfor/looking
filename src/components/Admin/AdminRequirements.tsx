```tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function AdminRequirements() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('requirements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setRequirements(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this requirement?')) return;
    await supabase.from('requirements').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Requirements</h1>
          <p className="text-xs text-slate-400">{requirements.length} loaded</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Title', 'Category', 'Location', 'Budget', 'Posted', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
            ) : requirements.map(r => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-900 max-w-xs truncate">{r.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${r.category === 'real_estate' ? 'bg-teal-100 text-teal-700' : 'bg-purple-100 text-purple-700'}`}>
                    {r.category === 'real_estate' ? '🏠 RE' : '🛠 Svc'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{r.city || r.location || '—'}</td>
                <td className="px-4 py-3 text-slate-600">
                  {r.budget_min || r.budget_max ? `₹${(r.budget_min || 0).toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3 text-slate-400">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(r.id)}
                    className="text-xs font-semibold px-3 py-1 rounded-lg border border-red-300 text-red-500">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```
