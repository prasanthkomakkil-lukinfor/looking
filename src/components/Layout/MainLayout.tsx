import { useState } from 'react';
import { Home, PlusSquare, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { HomePage } from '../Home/HomePage';
import { CreatePostPage } from '../Posts/CreatePostPage';
import { ChatsPage } from '../Chat/ChatsPage';
import { DashboardPage } from '../Dashboard/DashboardPage';
import { AdminLayout } from '../Admin/AdminLayout';

type Tab = 'home' | 'post' | 'chats' | 'dashboard';

export function MainLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // ✅ Admin check here
  if (user?.is_admin) {
    return <AdminLayout />;
  }

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
