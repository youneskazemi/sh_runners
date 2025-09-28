'use client';

import { useState } from 'react';
import { Trophy, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppBar({ onAuthClick }) {
  const [showMenu, setShowMenu] = useState(false);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'دوندگان شهر';
      case '/events':
        return 'رویدادها';
      case '/profile':
        return 'پروفایل';
      case '/admin':
        return 'مدیریت';
      default:
        return 'دوندگان شهر';
    }
  };

  return (
    <>
      {/* App Bar */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Menu Button */}
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>

          {/* Center: Page Title */}
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">{getPageTitle()}</h1>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="animate-pulse bg-muted h-8 w-8 rounded-full"></div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                ورود
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Side Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-card border-l border-border shadow-xl">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-lg">
                    <Trophy className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">دوندگان شهر</h2>
                    <p className="text-xs text-muted-foreground">سامانه رویدادهای دویدن</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-4 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary p-3 rounded-full">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <nav className="flex-1 p-4">
                <div className="space-y-2">
                  <Link
                    href="/"
                    onClick={() => setShowMenu(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      pathname === '/' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <Trophy className="h-5 w-5" />
                    <span>صفحه اصلی</span>
                  </Link>
                  
                  <Link
                    href="/events"
                    onClick={() => setShowMenu(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      pathname === '/events' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>رویدادها</span>
                  </Link>

                  {user && (
                    <Link
                      href="/profile"
                      onClick={() => setShowMenu(false)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        pathname === '/profile' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <User className="h-5 w-5" />
                      <span>پروفایل من</span>
                    </Link>
                  )}

                  {user?.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setShowMenu(false)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        pathname === '/admin' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>مدیریت</span>
                    </Link>
                  )}
                </div>
              </nav>

              {/* Menu Footer */}
              {user && (
                <div className="p-4 border-t border-border">
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>خروج</span>
                  </button>
                </div>
              )}

              {!user && (
                <div className="p-4 border-t border-border">
                  <button
                    onClick={() => {
                      onAuthClick();
                      setShowMenu(false);
                    }}
                    className="bg-primary text-primary-foreground p-3 rounded-lg w-full font-medium"
                  >
                    ورود / ثبت نام
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
