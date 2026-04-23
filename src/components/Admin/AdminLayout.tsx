import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminRequirements } from './AdminRequirements';
import { AdminChats } from './AdminChats';
import { AdminRevenue } from './AdminRevenue';
import { AdminBroadcast } from './AdminBroadcast';
import { AdminSettings } from './AdminSettings';

type AdminTab = 'overview'|'users'|'requirements'|'chats'|'revenue'|'broadcast'|'settings';

const tabs = [
  { id: 'overview', label: 'Overview', icon: '⚡' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'requirements', label: 'Requirements', icon: '📋' },
  { id: 'chats', label: 'Chats', icon: '💬' },
  { id: 'revenue', label: 'Revenue', icon: '💰' },
  { id: 'broadcast', label: 'Broadcast', icon: '📢' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
] as const;

export function AdminLayout() {
  const [active, setActive] = useState<AdminTab>('overview');
  const { signOut } = useAuth();

  const renderContent = () => {
    switch (active) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'requirements': return <AdminRequirements />;
      case 'chats': return <AdminChats />;
      case 'revenue': return <AdminRevenue />;
      case 'broadcast': return <AdminBroadcast />;
      case 'settings': return <AdminSettings />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#f1f5f9', fontFamily:'sans-serif'}}>
      {/* Sidebar */}
      <div style={{width:200, background:'#0f172a', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'16px', borderBottom:'1px solid #1e293b'}}>
          <div style={{color:'#fff', fontWeight:800, fontSize:14}}>LookingFor.in</div>
          <div style={{color:'#14b8a6', fontSize:10, fontWeight:700, marginTop:2}}>SUPER ADMIN</div>
        </div>
        <nav style={{flex:1, paddingTop:8}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActive(t.id as AdminTab)}
              style={{
                width:'100%', display:'flex', alignItems:'center', gap:10,
                padding:'10px 16px', textAlign:'left', cursor:'pointer',
                background: active === t.id ? 'rgba(20,184,166,0.15)' : 'transparent',
                borderLeft: active === t.id ? '3px solid #14b8a6' : '3px solid transparent',
                border:'none', color: active === t.id ? '#fff' : '#94a3b8',
                fontSize:12, fontWeight: active === t.id ? 700 : 400,
              }}>
              <span style={{fontSize:14}}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div style={{padding:'12px 16px', borderTop:'1px solid #1e293b', display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:28, height:28, borderRadius:'50%', background:'#14b8a6', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700}}>A</div>
          <div>
            <div style={{color:'#fff', fontSize:11, fontWeight:600}}>Admin</div>
            <button onClick={signOut} style={{color:'#64748b', fontSize:10, background:'none', border:'none', cursor:'pointer', padding:0}}>Sign out</button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <div style={{background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:12, color:'#64748b'}}>
            <span style={{color:'#0d9488', fontWeight:700}}>Admin</span> › {tabs.find(t => t.id === active)?.label}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <div style={{width:8, height:8, borderRadius:'50%', background:'#10b981'}}/>
            <span style={{fontSize:11, color:'#10b981', fontWeight:700}}>Live</span>
          </div>
        </div>
        <div style={{flex:1, overflow:'auto', padding:24}}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
