
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SITE_NAVIGATION } from '@/lib/constants';
import { useAuth } from '@/contexts/auth-context';
import React, { useState, useEffect } from 'react';

// This component is now primarily used for the mobile drawer navigation,
// or could be repurposed for other navigation needs if any.
// The main site header structure has changed.
export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav
      className={cn("flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-x-6 lg:space-y-0", className)}
      {...props}
    >
      {SITE_NAVIGATION.map((item) => {
        if (item.authRequired) {
          if (!isClient || !isAuthenticated) {
            return null; 
          }
        }
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "text-base font-medium transition-colors hover:text-primary py-2 lg:py-0",
              pathname === item.href ? "text-primary" : "text-foreground/80"
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
