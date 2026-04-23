import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WhatsAppLogin } from './components/Auth/WhatsAppLogin';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { MainLayout } from './components/Layout/MainLayout';
import { AdminLayout } from './components/Admin/AdminLayout';

function AppContent() {
  const { user, loading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const completed = user.name || localStorage.getItem(`onboarding_${user.id}`);
      setHasCompletedOnboarding(!!completed);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mb-3"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <WhatsAppLogin onLoginSuccess={() => {}} />;
  }

  if (user.is_admin) {
    return <AdminLayout />;
  }

  if (!hasCompletedOnboarding) {
    return (
      <OnboardingFlow
        onComplete={() => {
          localStorage.setItem(`onboarding_${user.id}`, 'true');
          setHasCompletedOnboarding(true);
        }}
      />
    );
  }

  return <MainLayout />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
