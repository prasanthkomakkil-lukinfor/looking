## FILE 5: `src/components/Admin/AdminChats.tsx`

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function AdminChats() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('chat_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setChats(data || []);
    setLoading(false);
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
    blocked: 'bg-slate-100 text-slate-500',
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-slate-900">Chat Requests</h1>
        <p className="text-xs text-slate-400">{chats.length} total requests</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {['pending', 'accepted', 'rejected', 'blocked'].map(s => (
          <div key={s} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <div className="text-xl font-extrabold text-slate-900">{chats.filter(c => c.status === s).length}</div>
            <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${statusColor[s]}`}>{s}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Requester', 'Requirement', 'Message', 'Status', 'Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-400">Loading...</td></tr>
            ) : chats.map(c => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-900">{c.requester_id?.slice(0, 8)}...</td>
                <td className="px-4 py-3 text-slate-600">{c.requirement_id?.slice(0, 8)}...</td>
                <td className="px-4 py-3 text-slate-500 max-w-xs truncate italic">"{c.message}"</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${statusColor[c.status] || ''}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-400">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```
