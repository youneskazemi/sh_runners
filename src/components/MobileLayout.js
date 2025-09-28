'use client';

import { useState } from 'react';
import AppBar from './AppBar';
import BottomNav from './BottomNav';
import AuthModal from './AuthModal';

export default function MobileLayout({ children }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* App Bar */}
      <AppBar onAuthClick={() => setShowAuthModal(true)} />
      
      {/* Main Content */}
      <main className="pb-20"> {/* Bottom padding: 80px (64px nav + 16px buffer) */}
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNav onAuthClick={() => setShowAuthModal(true)} />
      
      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
