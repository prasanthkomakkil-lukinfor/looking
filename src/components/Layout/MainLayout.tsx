import { useState } from 'react';
import { Home, PlusSquare, MessageSquare, User, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { HomePage } from '../Home/HomePage';
import { CreatePostPage } from '../Posts/CreatePostPage';
import { ChatsPage } from '../Chat/ChatsPage';
import { DashboardPage } from '../Dashboard/DashboardPage';

type Tab = 'home' | 'post' | 'chats' | 'dashboard';

function AdminPanel() {
  const { user, signOut } = useAuth();
  const [section, setSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: '⚡' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'requirements', label: 'Requirements', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#f1f5f9'}}>
      <div style={{width:200, background:'#0f172a', display:'flex', flexDirection:'column', flexShrink:0}}>
        <div style={{padding:16, borderBottom:'1px solid #1e293b'}}>
          <div style={{color:'#fff', fontWeight:800, fontSize:14}}>LookingFor.in</div>
          <div style={{color:'#14b8a6', fontSize:10, fontWeight:700}}>SUPER ADMIN</div>
        </div>
        <nav style={{flex:1, paddingTop:8}}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              style={{width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 16px',
                background: section===s.id ? 'rgba(20,184,166,0.15)' : 'transparent',
                borderLeft: section===s.id ? '3px solid #14b8a6' : '3px solid transparent',
                border:'none', borderRight:'none', borderTop:'none', borderBottom:'none',
                color: section===s.id ? '#fff' : '#94a3b8',
                fontSize:12, fontWeight: section===s.id ? 700 : 40
