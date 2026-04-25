import { useState, useEffect } from 'react';
import { Home, PlusSquare, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { HomePage } from '../Home/HomePage';
import { CreatePostPage } from '../Posts/CreatePostPage';
import { ChatsPage } from '../Chat/ChatsPage';
import { DashboardPage } from '../Dashboard/DashboardPage';

type Tab = 'home'|'post'|'chats'|'dashboard';
type AdminTab = 'users'|'requirements'|'revenue'|'broadcast';

const td = { padding: '10px 12px' };
const th = { padding: '10px 12px', textAlign: 'left' as const, color: '#64748b', fontWeight: 700, borderBottom: '1px solid #e2e8f0' };

function Badge({ children, color }: { children: any, color: string }) {
  const colors: any = { green:{bg:'#dcfce7',text:'#16a34a'}, red:{bg:'#fee2e2',text:'#dc2626'}, teal:{bg:'#ccfbf1',text:'#0d9488'}, purple:{bg:'#ede9fe',text:'#7c3aed'}, gray:{bg:'#f1f5f9',text:'#64748b'}, amber:{bg:'#fef3c7',text:'#d97706'} };
  const c = colors[color] || colors.gray;
  return <span style={{ background:c.bg, color:c.text, padding:'2px 8px', borderRadius:20, fontWeight:700, fontSize:11 }}>{children}</span>;
}

function Btn({ children, onClick, color='teal', small, full, disabled }: any) {
  const colors: any = { teal:{border:'#99f6e4',text:'#0d9488',bg:'#fff'}, red:{border:'#fca5a5',text:'#dc2626',bg:'#fff'}, gray:{border:'#e2e8f0',text:'#64748b',bg:'#fff'}, solid:{border:'#0d9488',text:'#fff',bg:'#0d9488'} };
  const c = colors[color];
  return <button onClick={onClick} disabled={disabled} style={{ padding:small?'4px 10px':'8px 16px', borderRadius:6, border:`1px solid ${c.border}`, background:c.bg, color:c.text, fontSize:small?11:12, fontWeight:600, cursor:disabled?'not-allowed':'pointer', width:full?'100%':'auto', opacity:disabled?0.6:1 }}>{children}</button>;
}

function Sidebar({ section, setSection, user, signOut }: any) {
  return (
    <div style={{ width:200, background:'#0f172a', display:'flex', flexDirection:'column', flexShrink:0 }}>
      <div style={{ padding:16, borderBottom:'1px solid #1e293b' }}>
        <div style={{ color:'#fff', fontWeight:800, fontSize:14 }}>LookingFor.in</div>
        <div style={{ color:'#14b8a6', fontSize:10, fontWeight:700 }}>SUPER ADMIN</div>
      </div>
      <nav style={{ flex:1, paddingTop:8 }}>
        {[{id:'users',label:'Users',icon:'👥'},{id:'requirements',label:'Requirements',icon:'📋'},{id:'revenue',label:'Revenue',icon:'💰'},{id:'broadcast',label:'Broadcast',icon:'📢'}].map(item => (
          <button key={item.id} onClick={() => setSection(item.id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background:section===item.id?'rgba(20,184,166,0.15)':'transparent', borderLeft:section===item.id?'3px solid #14b8a6':'3px solid transparent', border:'none', borderRight:'none', borderTop:'none', borderBottom:'none', color:section===item.id?'#fff':'#94a3b8', fontSize:12, fontWeight:section===item.id?700:400, cursor:'pointer', textAlign:'left' }}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding:'12px 16px', borderTop:'1px solid #1e293b' }}>
        <div style={{ color:'#64748b', fontSize:11, marginBottom:4 }}>+91 {user?.phone||user?.phone_number}</div>
        <button onClick={signOut} style={{ color:'#ef4444', fontSize:11, background:'none', border:'none', cursor:'pointer', padding:0 }}>Sign out</button>
      </div>
    </div>
  );
}

function StatsBar({ stats }: any) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
      {[{label:'Total Users',value:stats.users,icon:'👤'},{label:'Requirements',value:stats.requirements,icon:'📋'},{label:'Chat Requests',value:stats.chats,icon:'💬'}].map(c => (
        <div key={c.label} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, color:'#64748b', fontWeight:600, marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:28, fontWeight:800, color:'#0f172a' }}>{c.value}</div>
          </div>
          <div style={{ fontSize:28 }}>{c.icon}</div>
        </div>
      ))}
    </div>
  );
}

function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); const {data} = await supabase.from('users').select('*').order('created_at',{ascending:false}); setUsers(data||[]); setLoading(false); };
  const handleBan = async (id:string, active:boolean) => { if(!confirm('Are you sure?'))return; await supabase.from('users').update({is_verified:!active}).eq('id',id); load(); };
  const handleAdmin = async (id:string) => { if(!confirm('Make admin?'))return; await supabase.from('users').update({is_admin:true}).eq('id',id); load(); };
  const filtered = users.filter(u => search===''||(u.name||'').toLowerCase().includes(search.toLowerCase())||(u.phone||'').includes(search)||(u.phone_number||'').includes(search));
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div><h1 style={{ fontSize:20, fontWeight:800, color:'#0f172a', margin:0 }}>User Management</h1><p style={{ fontSize:12, color:'#64748b', margin:'4px 0 0' }}>{users.length} total users</p></div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or phone..." style={{ border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px', fontSize:12, outline:'none', width:220 }} />
      </div>
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead><tr style={{ background:'#f8fafc' }}>{['Phone','Name','Role','Status','Admin','Joined','Actions'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {loading?<tr><td colSpan={7} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>Loading...</td></tr>
              :filtered.map(u=>(
                <tr key={u.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={td}>{u.phone||u.phone_number||'—'}</td>
                  <td style={{ ...td, fontWeight:600 }}>{u.name||'—'}</td>
                  <td style={td}><Badge color={u.primary_role==='provider'?'purple':'teal'}>{u.primary_role||'seeker'}</Badge></td>
                  <td style={td}><Badge color={u.is_verified===false?'red':'green'}>{u.is_verified===false?'Banned':'Active'}</Badge></td>
                  <td style={{ ...td, color:u.is_admin?'#0d9488':'#94a3b8', fontWeight:700 }}>{u.is_admin?'✅':'—'}</td>
                  <td style={{ ...td, color:'#94a3b8' }}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  <td style={td}><div style={{ display:'flex', gap:6 }}><Btn small color="red" onClick={()=>handleBan(u.id,u.is_verified!==false)}>{u.is_verified===false?'Unban':'Ban'}</Btn>{!u.is_admin&&<Btn small color="teal" onClick={()=>handleAdmin(u.id)}>Admin</Btn>}</div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RequirementsSection() {
  const [reqs, setReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); const {data} = await supabase.from('requirements').select('*').order('created_at',{ascending:false}); setReqs(data||[]); setLoading(false); };
  const handleDelete = async (id:string) => { if(!confirm('Delete?'))return; await supabase.from('requirements').delete().eq('id',id); load(); };
  const handleToggle = async (id:string,status:string) => { await supabase.from('requirements').update({status:status==='active'?'expired':'active'}).eq('id',id); load(); };
  const counts = { all:reqs.length, active:reqs.filter(r=>r.status==='active').length, expired:reqs.filter(r=>r.status==='expired').length };
  const filtered = reqs.filter(r=>(filter==='all'||r.status===filter)&&(search===''||(r.title||'').toLowerCase().includes(search.toLowerCase())||(r.city||'').toLowerCase().includes(search.toLowerCase())));
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div><h1 style={{ fontSize:20, fontWeight:800, color:'#0f172a', margin:0 }}>Requirements</h1><p style={{ fontSize:12, color:'#64748b', margin:'4px 0 0' }}>{reqs.length} total · {counts.active} active</p></div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title or city..." style={{ border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px', fontSize:12, outline:'none', width:220 }} />
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {[{id:'all',label:`All (${counts.all})`},{id:'active',label:`Active (${counts.active})`},{id:'expired',label:`Expired (${counts.expired})`}].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{ padding:'5px 14px', borderRadius:20, border:'none', background:filter===f.id?'#0d9488':'#f1f5f9', color:filter===f.id?'#fff':'#64748b', fontSize:11, fontWeight:600, cursor:'pointer' }}>{f.label}</button>
        ))}
      </div>
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead><tr style={{ background:'#f8fafc' }}>{['Title','Category','City','Budget','Anon','Status','Posted','Actions'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {loading?<tr><td colSpan={8} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>Loading...</td></tr>
              :filtered.length===0?<tr><td colSpan={8} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>No requirements found</td></tr>
              :filtered.map(r=>(
                <tr key={r.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ ...td, fontWeight:600, maxWidth:160 }}>{r.title}</td>
                  <td style={td}><Badge color={r.category==='real_estate'?'teal':'purple'}>{r.category==='real_estate'?'🏠 RE':'🛠 Svc'}</Badge></td>
                  <td style={{ ...td, color:'#64748b' }}>{r.city||r.location||'—'}</td>
                  <td style={{ ...td, color:'#64748b' }}>{r.budget_min?`₹${Number(r.budget_min).toLocaleString()}`:'—'}</td>
                  <td style={{ ...td, textAlign:'center' }}>{r.is_anonymous?'🔒':'👁'}</td>
                  <td style={td}><Badge color={r.status==='active'?'green':'gray'}>{r.status}</Badge></td>
                  <td style={{ ...td, color:'#94a3b8' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                  <td style={td}><div style={{ display:'flex', gap:6 }}><Btn small color="gray" onClick={()=>handleToggle(r.id,r.status)}>{r.status==='active'?'Expire':'Restore'}</Btn><Btn small color="red" onClick={()=>handleDelete(r.id)}>Delete</Btn></div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RevenueSection() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSub, setNewSub] = useState({ user_phone:'', plan:'individual', amount:'499', expires_days:'365' });
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');
  const plans = [{id:'individual',label:'Individual',price:499},{id:'service_pro',label:'Service Pro',price:1499},{id:'service_unlimited',label:'Service Unlimited',price:2499},{id:'re_agent',label:'RE Agent',price:3000}];
  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); const {data} = await supabase.from('subscriptions').select('*, user:user_id(phone,phone_number,name)').order('created_at',{ascending:false}); setSubs(data||[]); setLoading(false); };
  const total = subs.reduce((sum,s)=>sum+(s.amount||0),0);
  const active = subs.filter(s=>s.status==='active').length;
  const handleAddSub = async () => {
    if(!newSub.user_phone||!newSub.amount){setMsg('Please fill phone and amount');return;}
    setAdding(true); setMsg('');
    try {
      const {data:u} = await supabase.from('users').select('id').or(`phone.eq.${newSub.user_phone},phone_number.eq.${newSub.user_phone}`).maybeSingle();
      if(!u){setMsg('User not found');setAdding(false);return;}
      const exp = new Date(); exp.setDate(exp.getDate()+parseInt(newSub.expires_days));
      const {error} = await supabase.from('subscriptions').insert({user_id:u.id,plan:newSub.plan,amount:parseInt(newSub.amount),status:'active',expires_at:exp.toISOString()});
      if(error)throw error;
      setMsg('✅ Subscription added!'); setNewSub({user_phone:'',plan:'individual',amount:'499',expires_days:'365'}); load();
    } catch(e:any){setMsg('Error: '+e.message);}
    finally{setAdding(false);}
  };
  const handleCancel = async (id:string) => { if(!confirm('Cancel?'))return; await supabase.from('subscriptions').update({status:'cancelled'}).eq('id',id); load(); };
  return (
    <div>
      <div style={{ marginBottom:20 }}><h1 style={{ fontSize:20, fontWeight:800, color:'#0f172a', margin:0 }}>Revenue & Subscriptions</h1><p style={{ fontSize:12, color:'#64748b', margin:'4px 0 0' }}>{active} active · ₹{total.toLocaleString()} total</p></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[{label:'Total Revenue',value:`₹${total.toLocaleString()}`,icon:'💰',color:'#059669'},{label:'Active Subs',value:active,icon:'👑',color:'#0d9488'},{label:'Total Txns',value:subs.length,icon:'🧾',color:'#7c3aed'}].map(c=>(
          <div key={c.label} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div><div style={{ fontSize:11, color:'#64748b', fontWeight:600, marginBottom:4 }}>{c.label}</div><div style={{ fontSize:24, fontWeight:800, color:c.color }}>{c.value}</div></div>
            <div style={{ fontSize:28 }}>{c.icon}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:16 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:12 }}>Plan Breakdown</div>
          {plans.map(p=>(
            <div key={p.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
              <div><div style={{ fontSize:12, fontWeight:600, color:'#0f172a' }}>{p.label}</div><div style={{ fontSize:10, color:'#64748b' }}>₹{p.price}/yr</div></div>
              <div style={{ textAlign:'right' }}><div style={{ fontSize:12, fontWeight:700, color:'#0d9488' }}>{subs.filter(s=>s.plan===p.id&&s.status==='active').length} active</div><div style={{ fontSize:10, color:'#64748b' }}>₹{subs.filter(s=>s.plan===p.id).reduce((sum,s)=>sum+(s.amount||0),0).toLocaleString()} total</div></div>
            </div>
          ))}
        </div>
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:16 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:12 }}>➕ Add Subscription</div>
          {[{label:'User Phone',key:'user_phone',placeholder:'9999999999'},{label:'Amount (₹)',key:'amount',placeholder:'499'},{label:'Days',key:'expires_days',placeholder:'365'}].map(f=>(
            <div key={f.key} style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#64748b', marginBottom:4 }}>{f.label}</div>
              <input value={(newSub as any)[f.key]} onChange={e=>setNewSub({...newSub,[f.key]:e.target.value})} placeholder={f.placeholder} style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'7px 10px', fontSize:12, outline:'none', boxSizing:'border-box' as const }} />
            </div>
          ))}
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#64748b', marginBottom:4 }}>Plan</div>
            <select value={newSub.plan} onChange={e=>{const p=plans.find(pl=>pl.id===e.target.value);setNewSub({...newSub,plan:e.target.value,amount:p?String(p.price):''});}} style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'7px 10px', fontSize:12, outline:'none' }}>
              {plans.map(p=><option key={p.id} value={p.id}>{p.label} — ₹{p.price}</option>)}
            </select>
          </div>
          {msg&&<div style={{ fontSize:11, color:msg.includes('✅')?'#059669':'#dc2626', marginBottom:8, padding:'6px 10px', background:msg.includes('✅')?'#dcfce7':'#fee2e2', borderRadius:6 }}>{msg}</div>}
          <button onClick={handleAddSub} disabled={adding} style={{ width:'100%', padding:'8px', borderRadius:8, border:'none', background:'#0d9488', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', opacity:adding?0.7:1 }}>{adding?'Adding...':'Add Subscription'}</button>
        </div>
      </div>
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #e2e8f0', fontSize:14, fontWeight:700, color:'#0f172a' }}>Transaction History</div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead><tr style={{ background:'#f8fafc' }}>{['User','Plan','Amount','Status','Expires','Date','Actions'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {loading?<tr><td colSpan={7} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>Loading...</td></tr>
              :subs.length===0?<tr><td colSpan={7} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>No subscriptions yet</td></tr>
              :subs.map(s=>(
                <tr key={s.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={td}>{s.user?.name||s.user?.phone||s.user?.phone_number||'—'}</td>
                  <td style={td}><Badge color="teal">{s.plan}</Badge></td>
                  <td style={{ ...td, fontWeight:700, color:'#059669' }}>₹{s.amount}</td>
                  <td style={td}><Badge color={s.status==='active'?'green':s.status==='cancelled'?'red':'gray'}>{s.status}</Badge></td>
                  <td style={{ ...td, color:'#64748b' }}>{s.expires_at?new Date(s.expires_at).toLocaleDateString('en-IN'):'—'}</td>
                  <td style={{ ...td, color:'#94a3b8' }}>{new Date(s.created_at).toLocaleDateString('en-IN')}</td>
                  <td style={td}>{s.status==='active'&&<Btn small color="red" onClick={()=>handleCancel(s.id)}>Cancel</Btn>}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BroadcastSection() {
  const [target, setTarget] = useState('all');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  const templates = [
    { label: '🎉 New Feature', msg: 'Hi {name}! 🎉 We just launched new features on LookingFor.in. Post your requirement and connect with verified providers today!' },
    { label: '👑 Premium Offer', msg: 'Hi {name}! 👑 Upgrade to Premium for just ₹499/year and get unlimited posts, chats & contact access. Limited offer!' },
    { label: '👋 Re-engagement', msg: 'Hi {name}! 👋 We miss you on LookingFor.in. Come back and post your requirement — hundreds of providers are waiting!' },
    { label: '✅ Welcome', msg: 'Hi {name}! ✅ Welcome to LookingFor.in! Post your first requirement for free and get matched with trusted providers.' },
  ];

  const targets = [
    { id: 'all', label: 'All Users' },
    { id: 'seekers', label: 'Seekers Only' },
    { id: 'providers', label: 'Providers Only' },
    { id: 'free', label: 'Free Users' },
  ];

  useEffect(() => { loadCount(); loadHistory(); }, [target]);

  const loadCount = async () => {
    let query = supabase.from('users').select('id', { count: 'exact', head: true });
    if (target === 'seekers') query = query.eq('primary_role', 'seeker');
    if (target === 'providers') query = query.eq('primary_role', 'provider');
    const { count } = await query;
    setUserCount(count || 0);
  };

  const loadHistory = async () => {
    const { data } = await supabase.from('broadcast_history').select('*').order('created_at', { ascending: false }).limit(5);
    setHistory(data || []);
  };

  const handleSend = async () => {
    if (!message.trim()) { alert('Please write a message first'); return; }
    if (!confirm(`Send this message to ${userCount} users?`)) return;
    setSending(true);
    try {
      await supabase.from('broadcast_history').insert({ target, message, user_count: userCount, status: 'sent' });
      setSent(true);
      setMessage('');
      loadHistory();
      setTimeout(() => setSent(false), 4000);
    } catch (e) {
      alert('Failed to save broadcast record');
    } finally { setSending(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>WhatsApp Broadcast</h1>
        <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>Send messages to users via WhatsApp</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Compose */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>📢 New Broadcast</div>

          {/* Target */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Target Audience</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {targets.map(t => (
                <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: `1.5px solid ${target === t.id ? '#0d9488' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer', background: target === t.id ? '#f0fdfa' : '#fff' }}>
                  <input type="radio" name="target" value={t.id} checked={target === t.id} onChange={e => setTarget(e.target.value)} style={{ accentColor: '#0d9488' }} />
                  <span style={{ fontSize: 11, fontWeight: target === t.id ? 700 : 400, color: target === t.id ? '#0d9488' : '#64748b' }}>{t.label}</span>
                </label>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#0d9488', fontWeight: 600 }}>👥 {userCount} users will receive this message</div>
          </div>

          {/* Templates */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Quick Templates</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {templates.map(t => (
                <button key={t.label} onClick={() => setMessage(t.msg)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', color: '#0f172a', fontSize: 11, cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Message <span style={{ color: '#94a3b8', fontWeight: 400 }}>(use {'{name}'} to personalize)</span></div>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Type your message here..." style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 12, outline: 'none', resize: 'none', boxSizing: 'border-box' as const }} />
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{message.length}/500 characters</div>
          </div>

          {sent && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>✅ Broadcast recorded successfully!</div>}

          <button onClick={handleSend} disabled={sending || !message.trim()} style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#0d9488', color: '#fff', fontSize: 13, fontWeight: 700, cursor: sending || !message.trim() ? 'not-allowed' : 'pointer', opacity: sending || !message.trim() ? 0.6 : 1 }}>
            {sending ? 'Sending...' : `📤 Send to ${userCount} Users`}
          </button>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* History */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>📜 Broadcast History</div>
            {history.length === 0 ? (
              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>No broadcasts yet</p>
            ) : history.map((b, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < history.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.message}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#64748b' }}>
                  <span>👥 {b.user_count} users</span>
                  <span>🎯 {b.target}</span>
                  <span>📅 {new Date(b.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 10 }}>⚠️ Broadcast Rules</div>
            {['Max 1 broadcast per day', 'Use {name} to personalize messages', 'Keep messages under 500 characters', 'Never share personal user data', 'Always include value — no pure spam'].map(r => (
              <p key={r} style={{ fontSize: 11, color: '#78350f', margin: '0 0 6px' }}>• {r}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel() {
  const { user, signOut } = useAuth();
  const [section, setSection] = useState<AdminTab>('users');
  const [stats, setStats] = useState({ users: 0, requirements: 0, chats: 0 });
  useEffect(() => {
    Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('requirements').select('id', { count: 'exact', head: true }),
      supabase.from('chat_requests').select('id', { count: 'exact', head: true }),
    ]).then(([u, r, c]) => setStats({ users: u.count || 0, requirements: r.count || 0, chats: c.count || 0 }));
  }, []);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif' }}>
      <Sidebar section={section} setSection={setSection} user={user} signOut={signOut} />
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <StatsBar stats={stats} />
        {section === 'users' && <UsersSection />}
        {section === 'requirements' && <RequirementsSection />}
        {section === 'revenue' && <RevenueSection />}
        {section === 'broadcast' && <BroadcastSection />}
      </div>
    </div>
  );
}

export function MainLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  if (user?.is_admin) return <AdminPanel />;
  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomePage />;
      case 'post': return <CreatePostPage onPostCreated={() => setActiveTab('dashboard')} />;
      case 'chats': return <ChatsPage />;
      case 'dashboard': return <DashboardPage onNavigate={setActiveTab} />;
      default: return <HomePage />;
    }
  };
  const tabs = [{ id: 'home', label: 'Home', icon: Home }, { id: 'post', label: 'Post', icon: PlusSquare }, { id: 'chats', label: 'Chats', icon: MessageSquare }, { id: 'dashboard', label: 'Me', icon: User }] as const;
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <div className="flex-1 overflow-y-auto pb-20">{renderContent()}</div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className="flex-1 flex flex-col items-center py-3 gap-0.5">
              <Icon size={22} className={activeTab === id ? 'text-teal-500' : 'text-gray-400'} strokeWidth={activeTab === id ? 2.5 : 1.8} />
              <span className={`text-xs font-medium ${activeTab === id ? 'text-teal-500' : 'text-gray-400'}`}>{label}</span>
              {activeTab === id && <div className="w-1 h-1 rounded-full bg-teal-500 mt-0.5" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

