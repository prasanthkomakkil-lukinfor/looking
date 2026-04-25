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

// ─── Shared helpers ───────────────────────────────────────────────
const cell = { padding:'10px 12px', fontSize:12, color:'#0f172a' };
const head = { padding:'10px 12px', textAlign:'left' as const, fontSize:11, color:'#64748b', fontWeight:700, borderBottom:'1px solid #e2e8f0', background:'#f8fafc' };
const card = { background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' as const, marginBottom:16 };

function Badge({ label, color }: { label:string, color:string }) {
  const map:any = {
    green:{bg:'#dcfce7',fg:'#16a34a'}, red:{bg:'#fee2e2',fg:'#dc2626'},
    teal:{bg:'#ccfbf1',fg:'#0d9488'}, purple:{bg:'#ede9fe',fg:'#7c3aed'},
    amber:{bg:'#fef3c7',fg:'#d97706'}, gray:{bg:'#f1f5f9',fg:'#64748b'},
  };
  const c = map[color]||map.gray;
  return <span style={{background:c.bg,color:c.fg,padding:'2px 8px',borderRadius:20,fontWeight:700,fontSize:11,whiteSpace:'nowrap'}}>{label}</span>;
}

function ActionBtn({ label, color='teal', onClick, disabled }:any) {
  const map:any={teal:{b:'#99f6e4',c:'#0d9488'},red:{b:'#fca5a5',c:'#dc2626'},amber:{b:'#fde68a',c:'#d97706'},gray:{b:'#e2e8f0',c:'#64748b'}};
  const s=map[color]||map.gray;
  return <button disabled={disabled} onClick={onClick} style={{padding:'4px 10px',borderRadius:6,border:`1px solid ${s.b}`,background:'#fff',color:s.c,fontSize:11,fontWeight:600,cursor:disabled?'not-allowed':'pointer',opacity:disabled?0.5:1}}>{label}</button>;
}

// Modal for full ad details
function AdModal({ req, onClose, onApprove, onReject }:any) {
  if (!req) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:560,maxHeight:'90vh',overflow:'auto',padding:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <div>
            <h2 style={{fontSize:18,fontWeight:800,color:'#0f172a',margin:0}}>{req.title}</h2>
            <p style={{fontSize:12,color:'#64748b',margin:'4px 0 0'}}>Posted {new Date(req.created_at).toLocaleDateString('en-IN')}</p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#64748b'}}>✕</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          {[
            {l:'Category',v:req.category==='real_estate'?'🏠 Real Estate':'🛠 Services'},
            {l:'Sub-Category',v:req.subcategory||'—'},
            {l:'City',v:req.city||req.location||'—'},
            {l:'Area',v:req.area||'—'},
            {l:'Min Budget',v:req.budget_min?`₹${Number(req.budget_min).toLocaleString()}`:'—'},
            {l:'Max Budget',v:req.budget_max?`₹${Number(req.budget_max).toLocaleString()}`:'—'},
            {l:'Anonymous',v:req.is_anonymous?'Yes 🔒':'No 👁'},
            {l:'Status',v:req.status},
          ].map(f=>(
            <div key={f.l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{f.l}</div>
              <div style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{f.v}</div>
            </div>
          ))}
        </div>
        <div style={{background:'#f8fafc',borderRadius:8,padding:12,marginBottom:16}}>
          <div style={{fontSize:10,color:'#94a3b8',fontWeight:600,marginBottom:6}}>DESCRIPTION</div>
          <p style={{fontSize:13,color:'#0f172a',margin:0,lineHeight:1.6}}>{req.description||'No description provided.'}</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onApprove} style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:'#0d9488',color:'#fff',fontWeight:700,cursor:'pointer',fontSize:13}}>✅ Approve</button>
          <button onClick={onReject} style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid #fca5a5',background:'#fff',color:'#dc2626',fontWeight:700,cursor:'pointer',fontSize:13}}>❌ Reject</button>
          <button onClick={onClose} style={{padding:'10px 16px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',fontWeight:600,cursor:'pointer',fontSize:13}}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────
function Sidebar({ section, setSection, user, signOut, isMobile, show, setShow }:any) {
  const items = [{id:'users',label:'Users',icon:'👥'},{id:'requirements',label:'Requirements',icon:'📋'},{id:'revenue',label:'Revenue',icon:'💰'},{id:'broadcast',label:'Broadcast',icon:'📢'}];
  if (isMobile && !show) return (
    <button onClick={()=>setShow(true)} style={{position:'fixed',top:12,left:12,zIndex:200,background:'#0f172a',color:'#fff',border:'none',borderRadius:8,padding:'8px 12px',fontSize:20,cursor:'pointer'}}>☰</button>
  );
  return (
    <>
      {isMobile && <div onClick={()=>setShow(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99}} />}
      <div style={{width:200,background:'#0f172a',display:'flex',flexDirection:'column',flexShrink:0,position:isMobile?'fixed':'relative',top:0,left:0,height:'100vh',zIndex:100}}>
        <div style={{padding:16,borderBottom:'1px solid #1e293b',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{color:'#fff',fontWeight:800,fontSize:14}}>LookingFor.in</div>
            <div style={{color:'#14b8a6',fontSize:10,fontWeight:700}}>SUPER ADMIN</div>
          </div>
          {isMobile && <button onClick={()=>setShow(false)} style={{background:'none',border:'none',color:'#94a3b8',fontSize:16,cursor:'pointer'}}>✕</button>}
        </div>
        <nav style={{flex:1,paddingTop:8}}>
          {items.map(item=>(
            <button key={item.id} onClick={()=>{setSection(item.id);if(isMobile)setShow(false);}} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 16px',background:section===item.id?'rgba(20,184,166,0.15)':'transparent',borderLeft:section===item.id?'3px solid #14b8a6':'3px solid transparent',border:'none',borderRight:'none',borderTop:'none',borderBottom:'none',color:section===item.id?'#fff':'#94a3b8',fontSize:12,fontWeight:section===item.id?700:400,cursor:'pointer',textAlign:'left'}}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{padding:'12px 16px',borderTop:'1px solid #1e293b'}}>
          <div style={{color:'#64748b',fontSize:11,marginBottom:4}}>+91 {user?.phone||user?.phone_number}</div>
          <button onClick={signOut} style={{color:'#ef4444',fontSize:11,background:'none',border:'none',cursor:'pointer',padding:0}}>Sign out</button>
        </div>
      </div>
    </>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────
function StatsBar({ stats }:any) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:24}}>
      {[{label:'Total Users',value:stats.users,icon:'👤'},{label:'Requirements',value:stats.requirements,icon:'📋'},{label:'Pending Approval',value:stats.pending,icon:'⏳'},{label:'Chat Requests',value:stats.chats,icon:'💬'}].map(c=>(
        <div key={c.label} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,marginBottom:4}}>{c.label}</div>
            <div style={{fontSize:24,fontWeight:800,color:'#0f172a'}}>{c.value}</div>
          </div>
          <div style={{fontSize:24}}>{c.icon}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Users Section ────────────────────────────────────────────────
function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(()=>{load();},[]);

  const load = async () => {
    setLoading(true);
    const {data} = await supabase.from('users').select('*').order('created_at',{ascending:false});
    setUsers(data||[]);
    setLoading(false);
  };

  const handleAction = async (id:string, action:'ban'|'suspend'|'activate'|'admin') => {
    const msgs:any = {ban:'Permanently ban this user?',suspend:'Suspend this user for 7 days?',activate:'Reactivate this user?',admin:'Make this user an admin?'};
    if(!confirm(msgs[action]))return;
    const updates:any = {
      ban:{is_verified:false,suspension_reason:'banned'},
      suspend:{is_verified:false,suspension_reason:'suspended'},
      activate:{is_verified:true,suspension_reason:null},
      admin:{is_admin:true},
    };
    await supabase.from('users').update(updates[action]).eq('id',id);
    load();
  };

  const counts = {all:users.length, active:users.filter(u=>u.is_verified!==false).length, banned:users.filter(u=>u.is_verified===false&&u.suspension_reason==='banned').length, suspended:users.filter(u=>u.is_verified===false&&u.suspension_reason==='suspended').length};
  const filtered = users
    .filter(u=>filter==='all'||(filter==='active'&&u.is_verified!==false)||(filter==='banned'&&u.is_verified===false&&u.suspension_reason==='banned')||(filter==='suspended'&&u.is_verified===false&&u.suspension_reason==='suspended'))
    .filter(u=>search===''||(u.name||'').toLowerCase().includes(search.toLowerCase())||(u.phone||'').includes(search)||(u.phone_number||'').includes(search));

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
        <div><h1 style={{fontSize:18,fontWeight:800,color:'#0f172a',margin:0}}>User Management</h1><p style={{fontSize:11,color:'#64748b',margin:'2px 0 0'}}>{users.length} total users</p></div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or phone..." style={{border:'1px solid #e2e8f0',borderRadius:8,padding:'7px 12px',fontSize:12,outline:'none',width:200}} />
      </div>
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        {[{id:'all',label:`All (${counts.all})`},{id:'active',label:`Active (${counts.active})`},{id:'suspended',label:`Suspended (${counts.suspended})`},{id:'banned',label:`Banned (${counts.banned})`}].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{padding:'4px 12px',borderRadius:20,border:'none',background:filter===f.id?'#0d9488':'#f1f5f9',color:filter===f.id?'#fff':'#64748b',fontSize:11,fontWeight:600,cursor:'pointer'}}>{f.label}</button>
        ))}
      </div>
      <div style={card}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
            <thead><tr>{['Phone','Name','Role','Status','Admin','Joined','Actions'].map(h=><th key={h} style={head}>{h}</th>)}</tr></thead>
            <tbody>
              {loading?<tr><td colSpan={7} style={{padding:24,textAlign:'center',color:'#94a3b8'}}>Loading...</td></tr>
                :filtered.map(u=>(
                  <tr key={u.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={cell}>{u.phone||u.phone_number||'—'}</td>
                    <td style={{...cell,fontWeight:600}}>{u.name||'—'}</td>
                    <td style={cell}><Badge label={u.primary_role||'seeker'} color={u.primary_role==='provider'?'purple':'teal'}/></td>
                    <td style={cell}><Badge label={u.is_verified===false?(u.suspension_reason==='banned'?'Banned':'Suspended'):'Active'} color={u.is_verified===false?(u.suspension_reason==='banned'?'red':'amber'):'green'}/></td>
                    <td style={{...cell,color:u.is_admin?'#0d9488':'#94a3b8',fontWeight:700}}>{u.is_admin?'✅':'—'}</td>
                    <td style={{...cell,color:'#94a3b8'}}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                    <td style={cell}>
                      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                        {u.is_verified!==false&&<ActionBtn label="Suspend" color="amber" onClick={()=>handleAction(u.id,'suspend')}/>}
                        {u.is_verified!==false&&<ActionBtn label="Ban" color="red" onClick={()=>handleAction(u.id,'ban')}/>}
                        {u.is_verified===false&&<ActionBtn label="Activate" color="teal" onClick={()=>handleAction(u.id,'activate')}/>}
                        {!u.is_admin&&<ActionBtn label="Admin" color="gray" onClick={()=>handleAction(u.id,'admin')}/>}
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

// ─── Requirements Section ─────────────────────────────────────────
function RequirementsSection() {
  const [reqs, setReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);

  useEffect(()=>{load();},[]);

  const load = async () => {
    setLoading(true);
    const {data} = await supabase.from('requirements').select('*').order('created_at',{ascending:false});
    setReqs(data||[]);
    setLoading(false);
  };

  const handleApproval = async (id:string, status:'approved'|'rejected') => {
    await supabase.from('requirements').update({approval_status:status, status:status==='approved'?'active':'rejected'}).eq('id',id);
    setSelected(null);
    load();
  };

  const handleDelete = async (id:string) => {
    if(!confirm('Delete this requirement?'))return;
    await supabase.from('requirements').delete().eq('id',id);
    setSelected(null);
    load();
  };

  const counts = {pending:reqs.filter(r=>r.approval_status==='pending'||!r.approval_status).length, approved:reqs.filter(r=>r.approval_status==='approved').length, rejected:reqs.filter(r=>r.approval_status==='rejected').length, all:reqs.length};
  const filtered = reqs
    .filter(r=>filter==='all'||(filter==='pending'&&(!r.approval_status||r.approval_status==='pending'))||(filter==='approved'&&r.approval_status==='approved')||(filter==='rejected'&&r.approval_status==='rejected'))
    .filter(r=>search===''||(r.title||'').toLowerCase().includes(search.toLowerCase())||(r.city||'').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <AdModal req={selected} onClose={()=>setSelected(null)} onApprove={()=>handleApproval(selected.id,'approved')} onReject={()=>handleApproval(selected.id,'rejected')} />
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
        <div><h1 style={{fontSize:18,fontWeight:800,color:'#0f172a',margin:0}}>Requirements</h1><p style={{fontSize:11,color:'#64748b',margin:'2px 0 0'}}>{counts.pending} pending approval</p></div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title or city..." style={{border:'1px solid #e2e8f0',borderRadius:8,padding:'7px 12px',fontSize:12,outline:'none',width:200}} />
      </div>

      {counts.pending > 0 && (
        <div style={{background:'#fef3c7',border:'1px solid #fde68a',borderRadius:10,padding:'10px 14px',marginBottom:12,fontSize:12,color:'#92400e',fontWeight:600}}>
          ⚠️ {counts.pending} ads waiting for your approval
        </div>
      )}

      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        {[{id:'pending',label:`⏳ Pending (${counts.pending})`},{id:'approved',label:`✅ Approved (${counts.approved})`},{id:'rejected',label:`❌ Rejected (${counts.rejected})`},{id:'all',label:`All (${counts.all})`}].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{padding:'4px 12px',borderRadius:20,border:'none',background:filter===f.id?'#0d9488':'#f1f5f9',color:filter===f.id?'#fff':'#64748b',fontSize:11,fontWeight:600,cursor:'pointer'}}>{f.label}</button>
        ))}
      </div>

      <div style={card}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:580}}>
            <thead><tr>{['Title','Category','City','Budget','Anon','Approval','Posted','Actions'].map(h=><th key={h} style={head}>{h}</th>)}</tr></thead>
            <tbody>
              {loading?<tr><td colSpan={8} style={{padding:24,textAlign:'center',color:'#94a3b8'}}>Loading...</td></tr>
                :filtered.length===0?<tr><td colSpan={8} style={{padding:24,textAlign:'center',color:'#94a3b8'}}>No requirements found</td></tr>
                :filtered.map(r=>(
                  <tr key={r.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={{...cell,fontWeight:600,maxWidth:160,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.title}</td>
                    <td style={cell}><Badge label={r.category==='real_estate'?'🏠 RE':'🛠 Svc'} color={r.category==='real_estate'?'teal':'purple'}/></td>
                    <td style={{...cell,color:'#64748b'}}>{r.city||r.location||'—'}</td>
                    <td style={{...cell,color:'#64748b'}}>{r.budget_min?`₹${Number(r.budget_min).toLocaleString()}`:'—'}</td>
                    <td style={{...cell,textAlign:'center'}}>{r.is_anonymous?'🔒':'👁'}</td>
                    <td style={cell}><Badge label={r.approval_status||'pending'} color={r.approval_status==='approved'?'green':r.approval_status==='rejected'?'red':'amber'}/></td>
                    <td style={{...cell,color:'#94a3b8'}}>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                    <td style={cell}>
                      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                        <ActionBtn label="View Full" color="gray" onClick={()=>setSelected(r)}/>
                        {(!r.approval_status||r.approval_status==='pending')&&<ActionBtn label="✅" color="teal" onClick={()=>handleApproval(r.id,'approved')}/>}
                        {(!r.approval_status||r.approval_status==='pending')&&<ActionBtn label="❌" color="red" onClick={()=>handleApproval(r.id,'rejected')}/>}
                        <ActionBtn label="🗑" color="red" onClick={()=>handleDelete(r.id)}/>
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

// ─── Revenue Section ──────────────────────────────────────────────
function RevenueSection() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSub, setNewSub] = useState({user_phone:'',plan:'individual',amount:'499',expires_days:'365'});
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');
  const plans = [{id:'individual',label:'Individual',price:499},{id:'service_pro',label:'Service Pro',price:1499},{id:'service_unlimited',label:'Service Unlimited',price:2499},{id:'re_agent',label:'RE Agent',price:3000}];
  useEffect(()=>{load();},[]);
  const load = async () => {setLoading(true);const {data}=await supabase.from('subscriptions').select('*,user:user_id(phone,phone_number,name)').order('created_at',{ascending:false});setSubs(data||[]);setLoading(false);};
  const total = subs.reduce((s,x)=>s+(x.amount||0),0);
  const active = subs.filter(s=>s.status==='active').length;
  const handleAdd = async () => {
    if(!newSub.user_phone||!newSub.amount){setMsg('Fill phone and amount');return;}
    setAdding(true);setMsg('');
    try {
      const {data:u}=await supabase.from('users').select('id').or(`phone.eq.${newSub.user_phone},phone_number.eq.${newSub.user_phone}`).maybeSingle();
      if(!u){setMsg('User not found');setAdding(false);return;}
      const exp=new Date();exp.setDate(exp.getDate()+parseInt(newSub.expires_days));
      const {error}=await supabase.from('subscriptions').insert({user_id:u.id,plan:newSub.plan,amount:parseInt(newSub.amount),status:'active',expires_at:exp.toISOString()});
      if(error)throw error;
      setMsg('✅ Added!');setNewSub({user_phone:'',plan:'individual',amount:'499',expires_days:'365'});load();
    }catch(e:any){setMsg('Error: '+e.message);}
    finally{setAdding(false);}
  };
  const handleCancel = async (id:string) => {if(!confirm('Cancel?'))return;await supabase.from('subscriptions').update({status:'cancelled'}).eq('id',id);load();};
  return (
    <div>
      <div style={{marginBottom:16}}><h1 style={{fontSize:18,fontWeight:800,color:'#0f172a',margin:0}}>Revenue & Subscriptions</h1><p style={{fontSize:11,color:'#64748b',margin:'2px 0 0'}}>{active} active · ₹{total.toLocaleString()} total</p></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:16}}>
        {[{label:'Total Revenue',value:`₹${total.toLocaleString()}`,icon:'💰',color:'#059669'},{label:'Active Subs',value:active,icon:'👑',color:'#0d9488'},{label:'Transactions',value:subs.length,icon:'🧾',color:'#7c3aed'}].map(c=>(
          <div key={c.label} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontSize:10,color:'#64748b',fontWeight:600,marginBottom:4}}>{c.label}</div><div style={{fontSize:20,fontWeight:800,color:c.color}}>{c.value}</div></div>
            <div style={{fontSize:24}}>{c.icon}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,marginBottom:16}}>
        <div style={{...card,marginBottom:0,padding:16}}>
          <div style={{fontSize:13,fontWeight:700,color:'#0f172a',marginBottom:12}}>Plan Breakdown</div>
          {plans.map(p=><div key={p.id} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #f1f5f9'}}><div><div style={{fontSize:12,fontWeight:600,color:'#0f172a'}}>{p.label}</div><div style={{fontSize:10,color:'#64748b'}}>₹{p.price}/yr</div></div><div style={{textAlign:'right'}}><div style={{fontSize:12,fontWeight:700,color:'#0d9488'}}>{subs.filter(s=>s.plan===p.id&&s.status==='active').length} active</div></div></div>)}
        </div>
        <div style={{...card,marginBottom:0,padding:16}}>
          <div style={{fontSize:13,fontWeight:700,color:'#0f172a',marginBottom:12}}>➕ Add Subscription</div>
          {[{label:'User Phone',key:'user_phone',placeholder:'9999999999'},{label:'Amount (₹)',key:'amount',placeholder:'499'},{label:'Days',key:'expires_days',placeholder:'365'}].map(f=>(
            <div key={f.key} style={{marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:600,color:'#64748b',marginBottom:4}}>{f.label}</div>
              <input value={(newSub as any)[f.key]} onChange={e=>setNewSub({...newSub,[f.key]:e.target.value})} placeholder={f.placeholder} style={{width:'100%',border:'1px solid #e2e8f0',borderRadius:8,padding:'7px 10px',fontSize:12,outline:'none',boxSizing:'border-box' as const}} />
            </div>
          ))}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:600,color:'#64748b',marginBottom:4}}>Plan</div>
            <select value={newSub.plan} onChange={e=>{const p=plans.find(pl=>pl.id===e.target.value);setNewSub({...newSub,plan:e.target.value,amount:p?String(p.price):''});}} style={{width:'100%',border:'1px solid #e2e8f0',borderRadius:8,padding:'7px 10px',fontSize:12,outline:'none'}}>
              {plans.map(p=><option key={p.id} value={p.id}>{p.label} — ₹{p.price}</option>)}
            </select>
          </div>
          {msg&&<div style={{fontSize:11,color:msg.includes('✅')?'#059669':'#dc2626',marginBottom:8,padding:'6px 10px',background:msg.includes('✅')?'#dcfce7':'#fee2e2',borderRadius:6}}>{msg}</div>}
          <button onClick={handleAdd} disabled={adding} style={{width:'100%',padding:'8px',borderRadius:8,border:'none',background:'#0d9488',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',opacity:adding?0.7:1}}>{adding?'Adding...':'Add Subscription'}</button>
        </div>
      </div>
      <div style={card}>
        <div style={{padding:'12px 16px',borderBottom:'1px solid #e2e8f0',fontSize:13,fontWeight:700,color:'#0f172a'}}>Transaction History</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:500}}>
            <thead><tr>{['User','Plan','Amount','Status','Expires','Date','Actions'].map(h=><th key={h} style={head}>{h}</th>)}</tr></thead>
            <tbody>
              {loading?<tr><td colSpan={7} style={{padding:24,textAlign:'center',color:'#94a3b8'}}>Loading...</td></tr>
                :subs.length===0?<tr><td colSpan={7} style={{padding:24,textAlign:'center',color:'#94a3b8'}}>No subscriptions yet</td></tr>
                :subs.map(s=>(
                  <tr key={s.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={cell}>{s.user?.name||s.user?.phone||s.user?.phone_number||'—'}</td>
                    <td style={cell}><Badge label={s.plan} color="teal"/></td>
                    <td style={{...cell,fontWeight:700,color:'#059669'}}>₹{s.amount}</td>
                    <td style={cell}><Badge label={s.status} color={s.status==='active'?'green':s.status==='cancelled'?'red':'gray'}/></td>
                    <td style={{...cell,color:'#64748b'}}>{s.expires_at?new Date(s.expires_at).toLocaleDateString('en-IN'):'—'}</td>
                    <td style={{...cell,color:'#94a3b8'}}>{new Date(s.created_at).toLocaleDateString('en-IN')}</td>
                    <td style={cell}>{s.status==='active'&&<ActionBtn label="Cancel" color="red" onClick={()=>handleCancel(s.id)}/>}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Broadcast Section ────────────────────────────────────────────
function BroadcastSection() {
  const [target, setTarget] = useState('all');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [step, setStep] = useState<'compose'|'preview'>('compose');

  const templates = [
    {label:'🎉 New Feature',msg:'Hi {name}! 🎉 We just launched new features on LookingFor.in. Post your requirement and connect with verified providers today!'},
    {label:'👑 Premium Offer',msg:'Hi {name}! 👑 Upgrade to Premium for just ₹499/year — unlimited posts, chats & contact access. Limited time offer!'},
    {label:'👋 Re-engagement',msg:'Hi {name}! 👋 We miss you on LookingFor.in. Come back and post your requirement — hundreds of providers are waiting!'},
    {label:'✅ Welcome',msg:'Hi {name}! ✅ Welcome to LookingFor.in! Post your first requirement for free and get matched with trusted providers.'},
  ];

  useEffect(()=>{loadUsers();loadHistory();},[target]);

  const loadUsers = async () => {
    let q = supabase.from('users').select('id,name,phone,phone_number').eq('is_verified',true);
    if(target==='seekers') q=q.eq('primary_role','seeker');
    if(target==='providers') q=q.eq('primary_role','provider');
    const {data}=await q;
    setUsers(data||[]);
  };

  const loadHistory = async () => {
    const {data}=await supabase.from('broadcast_history').select('*').order('created_at',{ascending:false}).limit(5);
    setHistory(data||[]);
  };

  const handlePreview = () => {
    if(!message.trim()){alert('Please write a message');return;}
    setStep('preview');
  };

  // Opens WhatsApp for each user one by one
  const handleSend = async () => {
    setSending(true);
    try {
      // Save to history
      await supabase.from('broadcast_history').insert({target,message,user_count:users.length,status:'sent'});
      // Open WhatsApp links for each user
      let delay = 0;
      users.slice(0,50).forEach(u => {
        const phone = u.phone || u.phone_number;
        if(!phone) return;
        const name = u.name || 'there';
        const personalised = message.replace(/{name}/g, name);
        setTimeout(()=>{
          window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(personalised)}`,'_blank');
        }, delay);
        delay += 1500;
      });
      await loadHistory();
      setStep('compose');
      setMessage('');
      alert(`✅ WhatsApp opened for ${Math.min(users.length,50)} users. Send each message from WhatsApp.`);
    } catch(e:any){
      alert('Error: '+e.message);
    } finally { setSending(false); }
  };

  return (
    <div>
      <div style={{marginBottom:16}}><h1 style={{fontSize:18,fontWeight:800,color:'#0f172a',margin:0}}>WhatsApp Broadcast</h1><p style={{fontSize:11,color:'#64748b',margin:'2px 0 0'}}>Send personalized WhatsApp messages to users</p></div>

      <div style={{background:'#fef3c7',border:'1px solid #fde68a',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:12,color:'#92400e'}}>
        ⚠️ <strong>How it works:</strong> Click "Preview & Send" → WhatsApp will open for each user with the message pre-filled → You click Send in each WhatsApp window. Max 50 users per broadcast.
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
        <div style={{...card,marginBottom:0,padding:20}}>
          {step==='compose'?(
            <>
              <div style={{fontSize:13,fontWeight:700,color:'#0f172a',marginBottom:16}}>📢 Compose Message</div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:'#64748b',marginBottom:8}}>Target Audience</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[{id:'all',label:'All Users'},{id:'seekers',label:'Seekers'},{id:'providers',label:'Providers'},{id:'free',label:'Free Users'}].map(t=>(
                    <label key={t.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',border:`1.5px solid ${target===t.id?'#0d9488':'#e2e8f0'}`,borderRadius:8,cursor:'pointer',background:target===t.id?'#f0fdfa':'#fff'}}>
                      <input type="radio" name="target" value={t.id} checked={target===t.id} onChange={e=>setTarget(e.target.value)} style={{accentColor:'#0d9488'}}/>
                      <span style={{fontSize:11,fontWeight:target===t.id?700:400,color:target===t.id?'#0d9488':'#64748b'}}>{t.label}</span>
                    </label>
                  ))}
                </div>
                <div style={{marginTop:8,fontSize:11,color:'#0d9488',fontWeight:600}}>👥 {users.length} users selected</div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:'#64748b',marginBottom:8}}>Quick Templates</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                  {templates.map(t=><button key={t.label} onClick={()=>setMessage(t.msg)} style={{padding:'6px 8px',border:'1px solid #e2e8f0',borderRadius:8,background:'#f8fafc',color:'#0f172a',fontSize:11,cursor:'pointer',textAlign:'left'}}>{t.label}</button>)}
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:'#64748b',marginBottom:6}}>Message <span style={{color:'#94a3b8',fontWeight:400}}>(use {'{name}'} to personalize)</span></div>
                <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={5} placeholder="Type your message..." style={{width:'100%',border:'1px solid #e2e8f0',borderRadius:8,padding:'10px 12px',fontSize:12,outline:'none',resize:'none',boxSizing:'border-box' as const}}/>
                <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>{message.length}/500</div>
              </div>
              <button onClick={handlePreview} disabled={!message.trim()||users.length===0} style={{width:'100%',padding:'10px',borderRadius:8,border:'none',background:'#0d9488',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',opacity:!message.trim()||users.length===0?0.5:1}}>
                Preview & Send →
              </button>
            </>
          ):(
            <>
              <div style={{fontSize:13,fontWeight:700,color:'#0f172a',marginBottom:12}}>👁 Preview</div>
              <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:14,marginBottom:14}}>
                <div style={{fontSize:11,color:'#16a34a',fontWeight:700,marginBottom:6}}>Sample message for first user:</div>
                <p style={{fontSize:13,color:'#0f172a',margin:0,lineHeight:1.6}}>{message.replace(/{name}/g,users[0]?.name||'Ravi')}</p>
              </div>
              <div style={{background:'#fef3c7',borderRadius:8,padding:10,marginBottom:14,fontSize:12,color:'#92400e'}}>
                This will open WhatsApp for <strong>{Math.min(users.length,50)} users</strong>. Each window opens 1.5s apart. You'll need to click Send in each WhatsApp window.
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setStep('compose')} style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',fontWeight:600,cursor:'pointer',fontSize:13}}>← Back</button>
                <button onClick={handleSend} disabled={sending} style={{flex:2,padding:'10px',borderRadius:8,border:'none',background:'#25d366',color:'#fff',fontWeight:700,cursor:'pointer',fontSize:13,opacity:sending?0.7:1}}>
                  {sending?'Opening WhatsApp...':'📱 Open WhatsApp & Send'}
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{...card,marginBottom:0,padding:16}}>
            <div style={{fontSize:13,fontWeight:700,color:'#0f172a',marginBottom:12}}>📜 Broadcast History</div>
            {history.length===0?<p style={{fontSize:12,color:'#94a3b8',textAlign:'center',padding:'12px 0'}}>No broadcasts yet</p>
              :history.map((b,i)=>(
                <div key={i} style={{padding:'8px 0',borderBottom:i<history.length-1?'1px solid #f1f5f9':'none'}}>
                  <p style={{fontSize:12,fontWeight:600,color:'#0f172a',margin:'0 0 4px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{b.message}</p>
                  <div style={{display:'flex',gap:10,fontSize:11,color:'#64748b'}}>
                    <span>👥 {b.user_count}</span>
                    <span>🎯 {b.target}</span>
                    <span>{new Date(b.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
          </div>
          <div style={{background:'#fef3c7',border:'1px solid #fde68a',borderRadius:12,padding:16}}>
            <div style={{fontSize:13,fontWeight:700,color:'#92400e',marginBottom:8}}>⚠️ Rules</div>
            {['Max 1 broadcast per day','Use {name} to personalize','Keep under 500 characters','Max 50 users per broadcast','Never share user personal data'].map(r=><p key={r} style={{fontSize:11,color:'#78350f',margin:'0 0 5px'}}>• {r}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────
function AdminPanel() {
  const {user,signOut} = useAuth();
  const [section, setSection] = useState<AdminTab>('requirements');
  const [stats, setStats] = useState({users:0,requirements:0,pending:0,chats:0});
  const [showSidebar, setShowSidebar] = useState(false);
  const isMobile = window.innerWidth < 768;

  useEffect(()=>{
    Promise.all([
      supabase.from('users').select('id',{count:'exact',head:true}),
      supabase.from('requirements').select('id',{count:'exact',head:true}),
      supabase.from('requirements').select('id',{count:'exact',head:true}).or('approval_status.eq.pending,approval_status.is.null'),
      supabase.from('chat_requests').select('id',{count:'exact',head:true}),
    ]).then(([u,r,p,c])=>setStats({users:u.count||0,requirements:r.count||0,pending:p.count||0,chats:c.count||0}));
  },[]);

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f1f5f9',fontFamily:'sans-serif'}}>
      <Sidebar section={section} setSection={setSection} user={user} signOut={signOut} isMobile={isMobile} show={showSidebar} setShow={setShowSidebar}/>
      <div style={{flex:1,overflow:'auto',padding:isMobile?'16px 12px 16px 12px':'24px',marginLeft:isMobile?0:0,paddingTop:isMobile?52:24}}>
        <StatsBar stats={stats}/>
        {section==='users'&&<UsersSection/>}
        {section==='requirements'&&<RequirementsSection/>}
        {section==='revenue'&&<RevenueSection/>}
        {section==='broadcast'&&<BroadcastSection/>}
      </div>
    </div>
  );
}

// ─── User Post Management (for regular users) ─────────────────────
// Added to DashboardPage — users can complete/cancel their posts
// This is handled via Supabase directly in DashboardPage component

// ─── Main Layout ──────────────────────────────────────────────────
export function MainLayout() {
  const {user} = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  if(user?.is_admin) return <AdminPanel/>;
  const renderContent = () => {
    switch(activeTab){
      case 'home': return <HomePage/>;
      case 'post': return <CreatePostPage onPostCreated={()=>setActiveTab('dashboard')}/>;
      case 'chats': return <ChatsPage/>;
      case 'dashboard': return <DashboardPage onNavigate={setActiveTab}/>;
      default: return <HomePage/>;
    }
  };
  const tabs=[{id:'home',label:'Home',icon:Home},{id:'post',label:'Post',icon:PlusSquare},{id:'chats',label:'Chats',icon:MessageSquare},{id:'dashboard',label:'Me',icon:User}] as const;
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{maxWidth:480,margin:'0 auto'}}>
      <div className="flex-1 overflow-y-auto pb-20">{renderContent()}</div>
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:480,background:'#fff',borderTop:'1px solid #e5e7eb',zIndex:50}}>
        <div style={{display:'flex'}}>
          {tabs.map(({id,label,icon:Icon})=>(
            <button key={id} onClick={()=>setActiveTab(id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'10px 0 8px',background:'none',border:'none',cursor:'pointer',gap:2}}>
              <Icon size={22} color={activeTab===id?'#14b8a6':'#9ca3af'} strokeWidth={activeTab===id?2.5:1.8}/>
              <span style={{fontSize:10,fontWeight:activeTab===id?700:400,color:activeTab===id?'#14b8a6':'#9ca3af'}}>{label}</span>
              {activeTab===id&&<div style={{width:4,height:4,borderRadius:'50%',background:'#14b8a6'}}/>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

