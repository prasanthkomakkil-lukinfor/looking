import { useState } from 'react';
import { Home, PlusSquare, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { HomePage } from '../Home/HomePage';
import { CreatePostPage } from '../Posts/CreatePostPage';
import { ChatsPage } from '../Chat/ChatsPage';
import { DashboardPage } from '../Dashboard/DashboardPage';
import { AdminPanel } from '../Admin/AdminPanel';

type Tab = 'home'|'post'|'chats'|'dashboard';

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
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 64 }}>
        {renderContent()}
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#fff', borderTop: '1px solid #e5e7eb', zIndex: 50 }}>
        <div style={{ display: 'flex' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 8px', background: 'none', border: 'none', cursor: 'pointer', gap: 2 }}>
              <Icon size={22} color={activeTab === id ? '#14b8a6' : '#9ca3af'} strokeWidth={activeTab === id ? 2.5 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: activeTab === id ? 700 : 400, color: activeTab === id ? '#14b8a6' : '#9ca3af' }}>{label}</span>
              {activeTab === id && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#14b8a6' }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

