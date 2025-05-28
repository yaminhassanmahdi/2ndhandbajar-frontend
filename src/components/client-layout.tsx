
"use client";

import React from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/contexts/cart-context';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MobileBottomNav } from '@/components/mobile-bottom-nav'; // Import new component
import { usePathname } from 'next/navigation';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isHomePage = pathname === '/';
  const isCategoryPage = pathname.startsWith('/category/');

  let mainContainerClass = 'container';
  if (isHomePage || isAdminRoute || isCategoryPage) { // Added isCategoryPage
    mainContainerClass = ''; 
  }

  return (
    <AuthProvider>
      <CartProvider>
        {!isAdminRoute && <SiteHeader />}
        {/* Add padding-bottom for mobile nav, remove for md and up */}
        <main className={`flex-grow ${isAdminRoute ? '' : `py-0 md:py-0 ${mainContainerClass}`} pb-16 md:pb-0`}> 
          {children}
        </main>
        {/* Hide SiteFooter on mobile (md:block) */}
        {!isAdminRoute && <SiteFooter className="hidden md:block print:hidden" />} 
        {/* Add MobileBottomNav, it will be hidden on md+ via its own classes */}
        {!isAdminRoute && <MobileBottomNav />}
      </CartProvider>
    </AuthProvider>
  );
}
