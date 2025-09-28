'use client';

import { Home, Calendar, User, Settings, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav({ onAuthClick }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    {
      href: '/',
      icon: Trophy,
      label: 'خانه',
      active: pathname === '/'
    },
    {
      href: '/events',
      icon: Calendar,
      label: 'رویدادها',
      active: pathname === '/events'
    },
    {
      href: user ? '/profile' : null,
      icon: User,
      label: 'پروفایل',
      active: pathname === '/profile',
      requiresAuth: true
    },
    {
      href: user?.isAdmin ? '/admin' : null,
      icon: Settings,
      label: 'مدیریت',
      active: pathname === '/admin',
      requiresAuth: true,
      adminOnly: true
    }
  ];

  const handleNavClick = (item, e) => {
    if (item.requiresAuth && !user) {
      e.preventDefault();
      onAuthClick();
      return;
    }
    
    if (item.adminOnly && !user?.isAdmin) {
      e.preventDefault();
      return;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 safe-area-pb">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isVisible = !item.adminOnly || (item.adminOnly && user?.isAdmin);
          
          if (!isVisible) {
            return <div key={index} className="hidden" />;
          }

          if (item.href) {
            return (
              <Link
                key={index}
                href={item.href}
                onClick={(e) => handleNavClick(item, e)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  item.active
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={index}
              onClick={(e) => handleNavClick(item, e)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                item.active
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
