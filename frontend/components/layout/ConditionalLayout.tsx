'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { memo } from 'react';

export const ConditionalLayout = memo(function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // Admin routes don't show Navbar and Footer
    return <>{children}</>;
  }

  // Regular routes show Navbar and Footer
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
});
