## FILE 8: `src/components/Admin/AdminSettings.tsx`

```tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function AdminSettings() {
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [dangerInput, setDangerInput] = useState<Record<string, string>>({});

  const handleDangerAction = async (action: string, key: string) => {
    if (dangerInput[key] !== 'CONFIRM') {
      alert('Please type CONFIRM to proceed');
      return;
    }
    if (!confirm(`Execute: ${action}?`)) return;

    if (action === 'Delete all expired posts') {
      await supabase.from('requirements').delete().eq('status', 'expired');
      alert('Done!');
    } else if (action === 'Clear OTP records') {
      await supabase.from('otp_verifications').delete().lt('expires_at', new Date().toISOString());
      alert('Done!');
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-slate-900">Platform Settings</h1>
        <p className="text-xs text-slate-400">Configure global platform behaviour</p>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Limits */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-bold text-slate-900 mb-4">📊 Platform Limits</div>
          {[
            { label: 'Free posts per user', defaultVal: '1' },
            { label: 'Free messages per chat', defaultVal: '3' },
            { label: 'Post expiry (days)', defaultVal: '30' },
            { label: 'OTP expiry (minutes)', defaultVal: '10' },
          ].map(s => (
            <div key={s.label} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
              <span className="text-xs text-slate-700">{s.label}</span>
              <input defaultValue={s.defaultVal}
                className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
          ))}
          <button className="mt-4 px-4 py-2 rounded-lg text-white text-xs font-semibold" style={{ background: '#0d9488' }}>
            Save Changes
          </button>
        </div>

        {/* Promo codes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-bold text-slate-900 mb-4">🎟️ Promo Codes</div>
          <div className="flex gap-2 mb-4">
            <input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Code (e.g. LAUNCH50)"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-teal-400" />
            <input value={promoDiscount} onChange={e => setPromoDiscount(e.target.value)}
              placeholder="% off" className="w-16 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none" />
            <button className="px-3 py-2 rounded-lg text-white text-xs font-semibold" style={{ background: '#0d9488' }}>
              Create
            </button>
          </div>
          <div className="text-xs text-slate-400 text-center py-4">No promo codes yet</div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <div className="text-sm font-bold text-red-600 mb-4">🚨 Danger Zone</div>
        <div className="grid grid-cols-2 gap-4">
          {[
            'Delete all expired posts',
            'Clear OTP records',
            'Export full database',
            'Reset all free limits',
          ].map(action => (
            <div key={action} className="bg-white border border-red-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-900 mb-3">{action}</div>
              <input
                value={dangerInput[action] || ''}
                onChange={e => setDangerInput(prev => ({ ...prev, [action]: e.target.value }))}
                placeholder='Type "CONFIRM" to proceed'
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none mb-2" />
              <button onClick={() => handleDangerAction(action, action)}
                className="w-full py-2 rounded-lg text-white text-xs font-semibold bg-red-500">
                Execute
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## FILE 9: Update `src/App.tsx` — Add admin routing

Add this inside `AppContent`, before `return <MainLayout />`:

```tsx
// Add this import at top
import { AdminLayout } from './components/Admin/AdminLayout';

// Add this check before return <MainLayout />
if (user.is_admin) {
  return <AdminLayout />;
}
```
