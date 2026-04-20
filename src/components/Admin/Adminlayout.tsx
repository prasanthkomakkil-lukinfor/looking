```tsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminRequirements } from './AdminRequirements';
import { AdminChats } from './AdminChats';
import { AdminRevenue } from './AdminRevenue';
import { AdminBroadcast } from './AdminBroadcast';
import { AdminSettings } from './AdminSettings';

type AdminTab = 'overview' | 'users' | 'requirements' | 'chats' | 'revenue' | 'broadcast' | 'settings';

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
  const { user, signOut } = useAuth();

  const renderContent = () => {
    switch (active) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'requirements': return <AdminRequirements />;
      case 'chats': return <AdminChats />;
      case 'revenue': return <AdminRevenue />;
      case 'broadcast': return <AdminBroadcast />;
      case 'settings': return <AdminSettings />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-52 bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="text-white font-extrabold text-sm">LookingFor.in</div>
          <div className="text-teal-400 text-xs font-bold mt-0.5">SUPER ADMIN</div>
        </div>
        <nav className="flex-1 py-3">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                active === t.id
                  ? 'bg-teal-600/20 border-l-2 border-teal-500 text-white'
                  : 'border-l-2 border-transparent text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              <span className="text-sm">{t.icon}</span>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">A</div>
          <div>
            <div className="text-white text-xs font-semibold">Admin</div>
            <button onClick={signOut} className="text-slate-500 text-xs hover:text-red-400">Sign out</button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center">
          <div className="text-xs text-slate-400">
            <span className="text-teal-600 font-bold">Admin</span> › {tabs.find(t => t.id === active)?.label}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-600 font-bold">Live</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
```
