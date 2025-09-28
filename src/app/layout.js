import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import MobileLayout from '@/components/MobileLayout';

export const metadata = {
  title: "دوندگان شهر - سامانه مدیریت رویدادهای دویدن",
  description: "سامانه جامع مدیریت و ثبت نام رویدادهای دویدن شهری",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="font-vazir antialiased bg-background text-foreground">
        <AuthProvider>
          <MobileLayout>
            {children}
          </MobileLayout>
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              className: '',
              duration: 4000,
              style: {
                background: '#1E293B', // Dark slate for better contrast
                color: '#F1F5F9', // Light text
                border: '1px solid #334155',
                borderRadius: '0.75rem',
                fontSize: '14px',
                fontFamily: 'Vazirmatn, sans-serif',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10B981', // Success green
                  color: '#FFFFFF',
                  border: '1px solid #059669',
                },
                iconTheme: {
                  primary: '#FFFFFF',
                  secondary: '#10B981',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#EF4444', // Error red
                  color: '#FFFFFF',
                  border: '1px solid #DC2626',
                },
                iconTheme: {
                  primary: '#FFFFFF',
                  secondary: '#EF4444',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
