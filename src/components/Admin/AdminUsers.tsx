```tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setUsers(data || []);
    setLoading(false);
  };

  const handleBan = async (userId: string, banned: boolean) => {
    if (!confirm(`Are you sure you want to ${banned ? 'unban' : 'ban'} this user?`)) return;
    await supabase.from('users').update({ is_verified: banned }).eq('id', userId);
    loadUsers();
  };

  const filtered = users.filter(u =>
    search === '' ||
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || '').includes(search)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">User Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">{users.length} total users</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-teal-400 w-56" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Name', 'Phone', 'Role', 'Plan', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-900">{u.name || 'No name'}</td>
                <td className="px-4 py-3 text-slate-600">+91 {u.phone || u.phone_number}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${u.primary_role === 'provider' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                    {u.primary_role || 'seeker'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">Free</span>
                </td>
                <td className="px-4 py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${u.is_verified !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.is_verified !== false ? 'Active' : 'Banned'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleBan(u.id, u.is_verified === false)}
                    className={`text-xs font-semibold px-3 py-1 rounded-lg border ${u.is_verified === false ? 'border-green-400 text-green-600' : 'border-red-300 text-red-500'}`}>
                    {u.is_verified === false ? 'Unban' : 'Ban'}
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
