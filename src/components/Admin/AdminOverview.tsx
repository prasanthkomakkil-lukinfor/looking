```tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, requirements: 0, chats: 0, revenue: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [users, reqs, chats, subs] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('requirements').select('id', { count: 'exact', head: true }),
      supabase.from('chat_requests').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('amount').eq('status', 'active'),
    ]);
    const revenue = (subs.data || []).reduce((sum, s) => sum + s.amount, 0);
    setStats({ users: users.count || 0, requirements: reqs.count || 0, chats: chats.count || 0, revenue });
  };

  const cards = [
    { label: 'Total Users', value: stats.users, icon: '👤', color: 'text-teal-600 bg-teal-50' },
    { label: 'Requirements', value: stats.requirements, icon: '📋', color: 'text-purple-600 bg-purple-50' },
    { label: 'Chat Requests', value: stats.chats, icon: '💬', color: 'text-amber-600 bg-amber-50' },
    { label: 'Revenue (₹)', value: `₹${stats.revenue.toLocaleString()}`, icon: '💰', color: 'text-green-600 bg-green-50' },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-slate-900">Command Center</h1>
        <p className="text-xs text-slate-400 mt-0.5">Platform overview · Live data</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-slate-400 font-semibold mb-1">{c.label}</div>
                <div className="text-2xl font-extrabold text-slate-900">{c.value}</div>
              </div>
              <div className={`p-2.5 rounded-lg text-lg ${c.color}`}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="text-sm font-bold text-slate-900 mb-3">Quick Actions</div>
        <div className="flex gap-3 flex-wrap">
          {[
            { label: '📢 Send Broadcast', color: 'bg-teal-500' },
            { label: '🎟️ Create Promo Code', color: 'bg-purple-500' },
            { label: '📊 Export Report', color: 'bg-blue-500' },
            { label: '🚫 Review Reports', color: 'bg-red-500' },
          ].map(a => (
            <button key={a.label} className={`${a.color} text-white text-xs font-semibold px-4 py-2 rounded-lg`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```
