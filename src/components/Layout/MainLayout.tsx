import { useState } from 'react';
import { Home, PlusSquare, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { HomePage } from '../Home/HomePage';
import { CreatePostPage } from '../Posts/CreatePostPage';
import { ChatsPage } from '../Chat/ChatsPage';
import { DashboardPage } from '../Dashboard/DashboardPage';

type Tab = 'home' | 'post' | 'chats' | 'dashboard';

function AdminPanel() {
  const { user, signOut } = useAuth();
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f1f5f9'}}>
      <div style={{width:200,background:'#0f172a',display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:16,borderBottom:'1px solid #1e293b'}}>
          <div style={{color:'#fff',fontWeight:800,fontSize:14}}>LookingFor.in</div>
          <div style={{color:'#14b8a6',fontSize:10,fontWeight:700}}>SUPER ADMIN</div>
        </div>
        <div style={{flex:1,padding:16,color:'#94a3b8',fontSize:12}}>
          <p style={{marginBottom:8}}>⚡ Overview</p>
          <p style={{marginBottom:8}}>👥 Users</p>
          <p style={{marginBottom:8}}>📋 Requirements</p>
          <p style={{marginBottom:8}}>💬 Chats</p>
          <p style={{marginBottom:8}}>💰 Revenue</p>
          <p style={{marginBottom:8}}>📢 Broadcast</p>
          <p>⚙️ Settings</p>
        </div>
        <div style={{padding:'12px 16px',borderTop:'1px solid #1e293b'}}>
          <div style={{color:'#64748b',fontSize:11,marginBottom:4}}>+91 {user?.phone || user?.phone_number}</div>
          <button onClick={signOut} style={{color:'#ef4444',fontSize:11,background:'none',border:'none',cursor:'pointer',padding:0}}>Sign out</button>
        </div>
      </div>
      <div style={{flex:1,padding:24}}>
        <h1 style={{fontSize:22,fontWeight:800,color:'#0f172a',marginBottom:4}}>Command Center</h1>
        <p style={{fontSize:12,color:'#64748b',marginBottom:24}}>Welcome to the admin panel</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {[{l:'Total Users',i:'👤'},{l:'Requirements',i:'📋'},{l:'Chats',i:'💬'},{l:'Revenue',i:'💰'}].map(c=>(
            <div key={c.l} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:16}}>
              <div style={{fontSize:24,marginBottom:8}}>{c.i}</div>
              <div style={{fontSize:20,fontWeight:800,color:'#0f172a'}}>—</div>
              <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{c.l}</div>
            </div>
          ))}
        </div>
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

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'post', label: 'Post', icon: PlusSquare },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'dashboard', label: 'Me', icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <div className="flex-1 overflow-y-auto pb-20">
        {renderContent()}
      </div>
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

