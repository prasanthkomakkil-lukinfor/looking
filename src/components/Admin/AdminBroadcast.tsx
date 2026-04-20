## FILE 7: `src/components/Admin/AdminBroadcast.tsx`

```tsx
import { useState } from 'react';

export function AdminBroadcast() {
  const [target, setTarget] = useState('all');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const targets = [
    { id: 'all', label: 'All Users' },
    { id: 'seekers', label: 'Seekers Only' },
    { id: 'providers', label: 'Providers Only' },
    { id: 'premium', label: 'Premium Users' },
    { id: 'free', label: 'Free Users' },
  ];

  const templates = [
    { label: 'New Feature', msg: 'Hi {name}! 🎉 We just launched a new feature on LookingFor.in. Check it out now!' },
    { label: 'Premium Offer', msg: 'Hi {name}! 👑 Upgrade to Premium today and get unlimited posts & chats. Special offer: ₹499/year only!' },
    { label: 'Re-engagement', msg: 'Hi {name}! 👋 We miss you on LookingFor.in. Come back and post your requirement — hundreds of providers are waiting!' },
  ];

  const handleSend = async () => {
    if (!message.trim()) return;
    if (!confirm(`Send this message to ${target} users?`)) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-slate-900">WhatsApp Broadcast</h1>
        <p className="text-xs text-slate-400">Send messages to users via WhatsApp</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-bold text-slate-900 mb-4">📢 New Broadcast</div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-700 block mb-2">Target Audience</label>
            <div className="space-y-2">
              {targets.map(t => (
                <label key={t.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer ${target === t.id ? 'border-teal-400 bg-teal-50' : 'border-slate-200'}`}>
                  <input type="radio" name="target" value={t.id} checked={target === t.id} onChange={e => setTarget(e.target.value)} className="text-teal-500" />
                  <span className={`text-xs font-medium ${target === t.id ? 'text-teal-700' : 'text-slate-700'}`}>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-700 block mb-2">Templates</label>
            <div className="space-y-1.5">
              {templates.map(t => (
                <button key={t.label} onClick={() => setMessage(t.msg)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-xs text-slate-700 transition-all">
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-700 block mb-2">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
              placeholder="Type message... Use {name} to personalize"
              className="w-full border border-slate-200 rounded-lg p-3 text-xs outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
            <p className="text-xs text-slate-400 mt-1">{message.length}/500 characters</p>
          </div>

          {sent && <div className="bg-green-50 text-green-700 text-xs font-semibold p-2 rounded-lg mb-3 text-center">✅ Broadcast sent successfully!</div>}

          <button onClick={handleSend} disabled={sending || !message.trim()}
            className="w-full py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
            style={{ background: '#0d9488' }}>
            {sending ? 'Sending...' : `📤 Send Broadcast`}
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="text-sm font-bold text-slate-900 mb-3">⚠️ Broadcast Rules</div>
          {[
            'Max 1 broadcast per day to avoid spam',
            'Always use {name} to personalize',
            'No promotional content without consent',
            'Test with small group first',
            'Keep messages under 500 characters',
            'Always include opt-out option',
          ].map(r => <p key={r} className="text-xs text-slate-600 mb-2">• {r}</p>)}
        </div>
      </div>
    </div>
  );
}
```
