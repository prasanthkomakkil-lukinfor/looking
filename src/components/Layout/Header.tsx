import { Search, Plus, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onAuthClick: () => void;
  onCreateClick: () => void;
  onViewChange: (view: 'feed' | 'my-listings' | 'profile') => void;
  currentView: string;
}

export function Header({ onAuthClick, onCreateClick, onViewChange, currentView }: HeaderProps) {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onViewChange('feed')}
              className="flex items-center gap-2 group"
            >
              <Search className="text-blue-600" size={28} />
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Lookingfor.in
                </h1>
                <p className="text-xs text-gray-500">Reverse Classifieds</p>
              </div>
            </button>

            {user && (
              <nav className="hidden md:flex gap-1">
                <button
                  onClick={() => onViewChange('feed')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentView === 'feed'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Browse
                </button>
                <button
                  onClick={() => onViewChange('my-listings')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentView === 'my-listings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  My Listings
                </button>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={onCreateClick}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Post Requirement</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewChange('profile')}
                    className={`p-2 rounded-lg transition-colors ${
                      currentView === 'profile'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Profile"
                  >
                    <User size={20} />
                  </button>
                  <button
                    onClick={signOut}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                  <div className="hidden sm:block text-sm">
                    <p className="font-medium text-gray-900">{profile?.full_name}</p>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
