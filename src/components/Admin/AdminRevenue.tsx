## FILE 6: `src/components/Admin/AdminRevenue.tsx`

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function AdminRevenue() {
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
    setSubs(data || []);
  };

  const total = subs.reduce((sum, s) => sum + (s.amount || 0), 0);
  const active = subs.filter(s => s.status === 'active').length;

  const plans = [
    { name: 'Individual ₹499/yr', count: subs.filter(s => s.plan === 'individual').length },
    { name: 'Service Pro ₹1499/yr', count: subs.filter(s => s.plan === 'service_pro').length },
    { name: 'Service Unlimited ₹2499/yr', count: subs.filter(s => s.plan === 'service_unlimited').length },
    { name: 'RE Agent ₹3000/yr', count: subs.filter(s => s.plan === 're_agent').length },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-slate-900">Revenue</h1>
        <p className="text-xs text-slate-400">{active} active subscriptions</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Revenue', value: `₹${total.toLocaleString()}`, color: 'text-green-600 bg-green-50' },
          { label: 'Active Subs', value: active, color: 'text-teal-600 bg-teal-50' },
          { label: 'Total Txns', value: subs.length, color: 'text-purple-600 bg-purple-50' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-400 font-semibold mb-1">{c.label}</div>
            <div className={`text-2xl font-extrabold ${c.color.split(' ')[0]}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900 mb-3">Plan Breakdown</div>
          {plans.map(p => (
            <div key={p.name} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
              <span className="text-xs text-slate-700">{p.name}</span>
              <span className="text-xs font-bold text-teal-600">{p.count} users</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900 mb-3">Recent Transactions</div>
          {subs.slice(0, 6).map((s, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
              <div>
                <div className="text-xs font-semibold text-slate-900">{s.plan}</div>
                <div className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString('en-IN')}</div>
              </div>
              <span className="text-xs font-bold text-green-600">₹{s.amount}</span>
            </div>
          ))}
          {subs.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No transactions yet</p>}
        </div>
      </div>
    </div>
  );
}
```
