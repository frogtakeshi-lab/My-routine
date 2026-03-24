import type { Metadata } from 'next';
import { AppProvider } from '@/context';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Routine',
  description: '毎日のルーティンを管理するアプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AppProvider>
          <Header />
          <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
            {children}
          </main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
