import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type AdminTab = 'users'|'requirements'|'revenue'|'broadcast';

const cell = { padding: '10px 12px', fontSize: 12, color: '#0f172a' };
const head = { padding: '10px 12px', textAlign: 'left' as const, fontSize: 11, color: '#64748b', fontWeight: 700, borderBottom: '1px solid #e2e8f0', background: '#f8fafc' };

function Badge({ label, color }: { label: string, color: string }) {
  const map: any = { green: { bg: '#dcfce7', fg: '#16a34a' }, red: { bg: '#fee2e2', fg: '#dc2626' }, teal: { bg: '#ccfbf1', fg: '#0d9488' }, purple: { bg: '#ede9fe', fg: '#7c3aed' }, amber: { bg: '#fef3c7', fg: '#d97706' }, gray: { bg: '#f1f5f9', fg: '#64748b' } };
  const c = map[color] || map.gray;
  return <span style={{ background: c.bg, color: c.fg, padding: '2px 8px', borderRadius: 20, fontWeight: 700, fontSize: 11 }}>{label}</span>;
}

function Btn({ label, color = 'teal', onClick, disabled }: any) {
  const map: any = { teal: { b: '#99f6e4', c: '#0d9488' }, red: { b: '#fca5a5', c: '#dc2626' }, amber: { b: '#fde68a', c: '#d97706' }, gray: { b: '#e2e8f0', c: '#64748b' } };
  const s = map[color] || map.gray;
  return <button disabled={disabled} onClick={onClick} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${s.b}`, background: '#fff', color: s.c, fontSize: 11, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>{label}</button>;
}

function AdModal({ req, onClose, onApprove, onReject }: any) {
  if (!req) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>{req.title}</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>{new Date(req.created_at).toLocaleDateString('en-IN')}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[{ l: 'Category', v: req.category === 'real_estate' ? '🏠 Real Estate' : '🛠 Services' }, { l: 'Sub-Category', v: req.subcategory || '—' }, { l: 'City', v: req.city || req.location || '—' }, { l: 'Area', v: req.area || '—' }, { l: 'Min Budget', v: req.budget_min ? `₹${Number(req.budget_min).toLocaleString()}` : '—' }, { l: 'Max Budget', v: req.budget_max ? `₹${Number(req.budget_max).toLocaleString()}` : '—' }, { l: 'Anonymous', v: req.is_anonymous ? 'Yes 🔒' : 'No 👁' }, { l: 'Status', v: req.status }].map(f => (
            <div key={f.l} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{f.l}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{f.v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>DESCRIPTION</div>
          <p style={{ fontSize: 13, color: '#0f172a', margin: 0, lineHeight: 1.6 }}>{req.description || 'No description.'}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onApprove} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#0d9488', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>✅ Approve</button>
          <button onClick={onReject} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>❌ Reject</button>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'ban' | 'suspend' | 'activate' | 'admin') => {
    const msgs: any = { ban: 'Permanently ban?', suspend: 'Suspend for 7 days?', activate: 'Reactivate?', admin: 'Make admin?' };
    if (!confirm(msgs[action])) return;
    const updates: any = { ban: { is_verified: false, suspension_reason: 'banned' }, suspend: { is_verified: false, suspension_reason: 'suspended' }, activate: { is_verified: true, suspension_reason: null }, admin: { is_admin: true } };
    await supabase.from('users').update(updates[action]).eq('id', id);
    load();
  };

  const counts = { all: users.length, active: users.filter(u => u.is_verified !== false).length, banned: users.filter(u => u.suspension_reason === 'banned').length, suspended: users.filter(u => u.suspension_reason === 'suspended').length };
  const filtered = users
    .filter(u => filter === 'all' || (filter === 'active' && u.is_verified !== false) || (filter === 'banned' && u.suspension_reason === 'banned') || (filter === 'suspended' && u.suspension_reason === 'suspended'))
    .filter(u => search === '' || (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.phone || '').includes(search) || (u.phone_number || '').includes(search));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div><h1 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Users</h1><p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{users.length} total</p></div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 12px', fontSize: 12, outline: 'none', width: 180 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {[{ id: 'all', label: `All (${counts.all})` }, { id: 'active', label: `Active (${counts.active})` }, { id: 'suspended', label: `Suspended (${counts.suspended})` }, { id: 'banned', label: `Banned (${counts.banned})` }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: '4px 12px', borderRadius: 20, border: 'none', background: filter === f.id ? '#0d9488' : '#f1f5f9', color: filter === f.id ? '#fff' : '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{f.label}</button>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead><tr>{['Phone', 'Name', 'Role', 'Status', 'Joined', 'Actions'].map(h => <th key={h} style={head}>{h}</th>)}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
                : filtered.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={cell}>{u.phone || u.phone_number || '—'}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{u.name || '—'}</td>
                    <td style={cell}><Badge label={u.primary_role || 'seeker'} color={u.primary_role === 'provider' ? 'purple' : 'teal'} /></td>
                    <td style={cell}><Badge label={u.suspension_reason === 'banned' ? 'Banned' : u.suspension_reason === 'suspended' ? 'Suspended' : 'Active'} color={u.suspension_reason === 'banned' ? 'red' : u.suspension_reason === 'suspended' ? 'amber' : 'green'} /></td>
                    <td style={{ ...cell, color: '#94a3b8' }}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                    <td style={cell}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {u.is_verified !== false && <Btn label="Suspend" color="amber" onClick={() => handleAction(u.id, 'suspend')} />}
                        {u.is_verified !== false && <Btn label="Ban" color="red" onClick={() => handleAction(u.id, 'ban')} />}
                        {u.is_verified === false && <Btn label="Activate" color="teal" onClick={() => handleAction(u.id, 'activate')} />}
                        {!u.is_admin && <Btn label="Admin" color="gray" onClick={() => handleAction(u.id, 'admin')} />}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RequirementsSection() {
  const [reqs, setReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('requirements').select('*').order('created_at', { ascending: false });
    setReqs(data || []);
    setLoading(false);
  };

  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('requirements').update({ approval_status: status, status: status === 'approved' ? 'active' : 'rejected' }).eq('id', id);
    setSelected(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await supabase.from('requirements').delete().eq('id', id);
    setSelected(null);
    load();
  };

  const counts = { pending: reqs.filter(r => !r.approval_status || r.approval_status === 'pending').length, approved: reqs.filter(r => r.approval_status === 'approved').length, rejected: reqs.filter(r => r.approval_status === 'rejected').length, all: reqs.length };
  const filtered = reqs
    .filter(r => filter === 'all' || (filter === 'pending' && (!r.approval_status || r.approval_status === 'pending')) || (filter === 'approved' && r.approval_status === 'approved') || (filter === 'rejected' && r.approval_status === 'rejected'))
    .filter(r => search === '' || (r.title || '').toLowerCase().includes(search.toLowerCase()) || (r.city || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <AdModal req={selected} onClose={() => setSelected(null)} onApprove={() => handleApproval(selected.id, 'approved')} onReject={() => handleApproval(selected.id, 'rejected')} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div><h1 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Requirements</h1><p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{counts.pending} pending approval</p></div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 12px', fontSize: 12, outline: 'none', width: 180 }} />
      </div>
      {counts.pending > 0 && <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#92400e', fontWeight: 600 }}>⚠️ {counts.pending} ads waiting for approval</div>}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {[{ id: 'pending', label: `⏳ Pending (${counts.pending})` }, { id: 'approved', label: `✅ Approved (${counts.approved})` }, { id: 'rejected', label: `❌ Rejected (${counts.rejected})` }, { id: 'all', label: `All (${counts.all})` }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: '4px 12px', borderRadius: 20, border: 'none', background: filter === f.id ? '#0d9488' : '#f1f5f9', color: filter === f.id ? '#fff' : '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{f.label}</button>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
            <thead><tr>{['Title', 'Category', 'City', 'Budget', 'Approval', 'Posted', 'Actions'].map(h => <th key={h} style={head}>{h}</th>)}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
                : filtered.length === 0 ? <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No requirements found</td></tr>
                  : filtered.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...cell, fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</td>
                      <td style={cell}><Badge label={r.category === 'real_estate' ? '🏠 RE' : '🛠 Svc'} color={r.category === 'real_estate' ? 'teal' : 'purple'} /></td>
                      <td style={{ ...cell, color: '#64748b' }}>{r.city || r.location || '—'}</td>
                      <td style={{ ...cell, color: '#64748b' }}>{r.budget_min ? `₹${Number(r.budget_min).toLocaleString()}` : '—'}</td>
                      <td style={cell}><Badge label={r.approval_status || 'pending'} color={r.approval_status === 'approved' ? 'green' : r.approval_status === 'rejected' ? 'red' : 'amber'} /></td>
                      <td style={{ ...cell, color: '#94a3b8' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                      <td style={cell}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          <Btn label="View" color="gray" onClick={() => setSelected(r)} />
                          {(!r.approval_status || r.approval_status === 'pending') && <Btn label="✅" color="teal" onClick={() => handleApproval(r.id, 'approved')} />}
                          {(!r.approval_status || r.approval_status === 'pending') && <Btn label="❌" color="red" onClick={() => handleApproval(r.id, 'rejected')} />}
                          <Btn label="🗑" color="red" onClick={() => handleDelete(r.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BroadcastSection() {
  const [target, setTarget] = useState('all');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState<'compose' | 'preview'>('compose');
  const [history, setHistory] = useState<any[]>([]);

  const templates = [
    { label: '🎉 New Feature', msg: 'Hi {name}! 🎉 We just launched new features on LookingFor.in. Post your requirement and connect with verified providers today!' },
    { label: '👑 Premium Offer', msg: 'Hi {name}! 👑 Upgrade to Premium for ₹499/year — unlimited posts and chats. Limited offer!' },
    { label: '👋 Re-engage', msg: 'Hi {name}! 👋 We miss you on LookingFor.in. Come back and post your requirement — providers are waiting!' },
    { label: '✅ Welcome', msg: 'Hi {name}! ✅ Welcome to LookingFor.in! Post your first requirement for free today.' },
  ];

  useEffect(() => { loadUsers(); loadHistory(); }, [target]);

  const loadUsers = async () => {
    let q = supabase.from('users').select('id,name,phone,phone_number').neq('is_verified', false);
    if (target === 'seekers') q = q.eq('primary_role', 'seeker');
    if (target === 'providers') q = q.eq('primary_role', 'provider');
    const { data } = await q;
    setUsers(data || []);
  };

  const loadHistory = async () => {
    const { data } = await supabase.from('broadcast_history').select('*').order('created_at', { ascending: false }).limit(5);
    setHistory(data || []);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await supabase.from('broadcast_history').insert({ target, message, user_count: users.length, status: 'sent' });
      let delay = 0;
      users.slice(0, 30).forEach(u => {
        const phone = u.phone || u.phone_number;
        if (!phone) return;
        const text = message.replace(/{name}/g, u.name || 'there');
        setTimeout(() => { window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, '_blank'); }, delay);
        delay += 2000;
      });
      await loadHistory();
      setStep('compose');
      setMessage('');
      alert(`✅ WhatsApp opened for ${Math.min(users.length, 30)} users. Click Send in each window.`);
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setSending(false); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>WhatsApp Broadcast</h1>
      <p style={{ fontSize: 11, color: '#64748b', marginBottom: 14 }}>Opens WhatsApp for each user with message pre-filled</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          {step === 'compose' ? (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Target ({users.length} users)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[{ id: 'all', label: 'All Users' }, { id: 'seekers', label: 'Seekers' }, { id: 'providers', label: 'Providers' }].map(t => (
                    <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', border: `1.5px solid ${target === t.id ? '#0d9488' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer', background: target === t.id ? '#f0fdfa' : '#fff' }}>
                      <input type="radio" name="target" value={t.id} checked={target === t.id} onChange={e => setTarget(e.target.value)} style={{ accentColor: '#0d9488' }} />
                      <span style={{ fontSize: 11, fontWeight: target === t.id ? 700 : 400, color: target === t.id ? '#0d9488' : '#64748b' }}>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Templates</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {templates.map(t => <button key={t.label} onClick={() => setMessage(t.msg)} style={{ padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', fontSize: 11, cursor: 'pointer', textAlign: 'left' }}>{t.label}</button>)}
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Message (use {'{name}'} to personalize)</div>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Type message..." style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 12, outline: 'none', resize: 'none', boxSizing: 'border-box' as const }} />
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{message.length}/500</div>
              </div>
              <button onClick={() => { if (!message.trim()) { alert('Write a message first'); return; } setStep('preview'); }} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: '#0d9488', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Preview & Send →
              </button>
            </>
          ) : (
            <>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginBottom: 4 }}>Preview (first user):</div>
                <p style={{ fontSize: 13, color: '#0f172a', margin: 0 }}>{message.replace(/{name}/g, users[0]?.name || 'Ravi')}</p>
              </div>
              <div style={{ background: '#fef3c7', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 12, color: '#92400e' }}>
                Will open WhatsApp for <strong>{Math.min(users.length, 30)} users</strong> (2s apart). Click Send in each window.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('compose')} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>← Back</button>
                <button onClick={handleSend} disabled={sending} style={{ flex: 2, padding: 10, borderRadius: 8, border: 'none', background: '#25d366', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: sending ? 0.7 : 1 }}>
                  {sending ? 'Opening...' : '📱 Send via WhatsApp'}
                </button>
              </div>
            </>
          )}
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>📜 History</div>
          {history.length === 0 ? <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>No broadcasts yet</p>
            : history.map((b, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: i < history.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.message}</p>
                <div style={{ fontSize: 11, color: '#64748b' }}>👥 {b.user_count} · 🎯 {b.target} · {new Date(b.created_at).toLocaleDateString('en-IN')}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export function AdminPanel() {
  const { user, signOut } = useAuth();
  const [section, setSection] = useState<AdminTab>('requirements');
  const [stats, setStats] = useState({ users: 0, requirements: 0, pending: 0, chats: 0 });
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('requirements').select('id', { count: 'exact', head: true }),
      supabase.from('requirements').select('id', { count: 'exact', head: true }).or('approval_status.eq.pending,approval_status.is.null'),
      supabase.from('chat_requests').select('id', { count: 'exact', head: true }),
    ]).then(([u, r, p, c]) => setStats({ users: u.count || 0, requirements: r.count || 0, pending: p.count || 0, chats: c.count || 0 }));
  }, []);

  const items = [{ id: 'requirements', label: 'Requirements', icon: '📋' }, { id: 'users', label: 'Users', icon: '👥' }, { id: 'revenue', label: 'Revenue', icon: '💰' }, { id: 'broadcast', label: 'Broadcast', icon: '📢' }];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif' }}>
      {/* Mobile menu button */}
      <button onClick={() => setShowNav(!showNav)} style={{ display: 'none', position: 'fixed', top: 12, left: 12, zIndex: 200, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 18, cursor: 'pointer' }}>☰</button>

      {/* Sidebar */}
      <div style={{ width: 200, background: '#0f172a', display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: '100vh' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #1e293b' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>LookingFor.in</div>
          <div style={{ color: '#14b8a6', fontSize: 10, fontWeight: 700 }}>SUPER ADMIN</div>
        </div>
        <nav style={{ flex: 1, paddingTop: 8 }}>
          {items.map(item => (
            <button key={item.id} onClick={() => setSection(item.id as AdminTab)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: section === item.id ? 'rgba(20,184,166,0.15)' : 'transparent', borderLeft: section === item.id ? '3px solid #14b8a6' : '3px solid transparent', border: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', color: section === item.id ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: section === item.id ? 700 : 400, cursor: 'pointer', textAlign: 'left' }}>
              <span>{item.icon}</span>{item.label}
              {item.id === 'requirements' && stats.pending > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 20, marginLeft: 'auto' }}>{stats.pending}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b' }}>
          <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>+91 {user?.phone || user?.phone_number}</div>
          <button onClick={signOut} style={{ color: '#ef4444', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[{ label: 'Users', value: stats.users, icon: '👤' }, { label: 'Requirements', value: stats.requirements, icon: '📋' }, { label: 'Pending Approval', value: stats.pending, icon: '⏳' }, { label: 'Chats', value: stats.chats, icon: '💬' }].map(c => (
            <div key={c.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{c.value}</div>
              </div>
              <div style={{ fontSize: 24 }}>{c.icon}</div>
            </div>
          ))}
        </div>
        {section === 'users' && <UsersSection />}
        {section === 'requirements' && <RequirementsSection />}
        {section === 'revenue' && <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 40, textAlign: 'center' }}><div style={{ fontSize: 40, marginBottom: 12 }}>💰</div><h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Revenue</h2><p style={{ color: '#64748b' }}>Coming soon</p></div>}
        {section === 'broadcast' && <BroadcastSection />}
      </div>
    </div>
  );
}

