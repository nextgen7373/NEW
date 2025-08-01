import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Plus, 
  Activity, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/authStore';
import VaultPage from './VaultPage';
import AddPasswordPage from './AddPasswordPage';
import ActivityLogPage from './ActivityLogPage';
import SettingsPage from './SettingsPage';
import trivaultLogo from '@/assets/trivault-logo.png';

type Page = 'vault' | 'add' | 'activity' | 'settings';

const MainLayout = () => {
  const [currentPage, setCurrentPage] = useState<Page>('vault');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('trivault-theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const { user, logout } = useAuth();

  // Effect to apply theme changes
  React.useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('trivault-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const navigationItems = [
    { id: 'vault' as Page, label: 'Vault', icon: Key },
    { id: 'add' as Page, label: 'Add New', icon: Plus },
    { id: 'activity' as Page, label: 'Activity Log', icon: Activity },
    { id: 'settings' as Page, label: 'Settings', icon: Settings },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'vault':
        return <VaultPage />;
      case 'add':
        return <AddPasswordPage onSuccess={() => setCurrentPage('vault')} />;
      case 'activity':
        return <ActivityLogPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <VaultPage />;
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background/90 to-primary/5">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } transition-all duration-300 glass-card m-4 mr-0 rounded-r-none relative z-20`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 glass-card flex items-center justify-center animate-pulse-glow overflow-hidden">
              <img src={trivaultLogo} alt="TriVault" className="w-8 h-8 object-contain" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TriVault
                </h1>
                <p className="text-xs text-muted-foreground">Password Manager</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse-glow' : ''}`} />
                    {sidebarOpen && (
                      <span className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        {sidebarOpen && user && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 glass-card flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="glassSecondary"
              size="sm"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="glass-card m-4 mb-0 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-secondary/50"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {navigationItems.find(item => item.id === currentPage)?.label || 'Vault'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Secure password management for your digital marketing agency
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="hover:bg-secondary/50"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            {user && (
              <div className="flex items-center space-x-2 glass-card px-3 py-2">
                <div className="w-6 h-6 glass-card flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 pt-0">
          <div className="glass-card p-6 h-full overflow-auto page-transition">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
