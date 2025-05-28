
"use client";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/auth-context';
import { USER_NAVIGATION, ADMIN_NAVIGATION } from '@/lib/constants';
import { ShoppingCart, UserCircle, LogIn, LogOut, Settings2, Briefcase, TrendingUp, DollarSign, ChevronDown, MoreVertical } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import React, { useState, useEffect } from 'react';

// New prop to distinguish desktop vs mobile rendering context
export interface UserNavProps {
  onMobileCartClick?: () => void;
  isDesktop?: boolean;
}

export function UserNav({ onMobileCartClick, isDesktop = false }: UserNavProps) {
  const { currentUser, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Desktop Rendering ---
  if (isDesktop) {
    if (!isClient) {
      // Placeholder for desktop during SSR / initial client render
      return (
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" className="h-10 px-3" disabled style={{ visibility: 'hidden' }}>
            <UserCircle className="h-5 w-5" />
            <span className="ml-1.5 text-sm">Login</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (currentUser) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name || 'User'} />
                <AvatarFallback>{currentUser.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {USER_NAVIGATION.map(item => (
                <Link href={item.href} key={item.name} passHref>
                  <DropdownMenuItem className="cursor-pointer">
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    <span>{item.name}</span>
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuGroup>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <Link href={ADMIN_NAVIGATION.find(nav => nav.name === 'Dashboard')?.href || '/admin/dashboard'} passHref>
                  <DropdownMenuItem className="cursor-pointer">
                    {ADMIN_NAVIGATION.find(nav => nav.name === 'Dashboard')?.icon ? 
                      React.createElement(ADMIN_NAVIGATION.find(nav => nav.name === 'Dashboard')!.icon!, {className: "mr-2 h-4 w-4"}) : null}
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                </Link>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    } else { // Unauthenticated desktop user
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 px-2.5">
              <UserCircle className="h-5 w-5" />
              <span className="ml-1.5 text-sm">Login</span>
              <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end" forceMount>
            <Link href="/login" passHref>
              <DropdownMenuItem className="cursor-pointer">
                <LogIn className="mr-2 h-4 w-4" />
                <span>Login</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/register" passHref>
              <DropdownMenuItem className="cursor-pointer">
                {/* Consider a UserPlus icon if needed */}
                <span className="ml-6">Register</span> 
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }

  // --- Mobile Rendering ---
  // This part remains largely the same, using onMobileCartClick
  if (!isClient) {
    // Placeholder for mobile during SSR / initial client render
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative" disabled style={{ visibility: 'hidden' }}>
          <ShoppingCart className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full" disabled style={{ visibility: 'hidden' }}>
          <UserCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }
  
  if (currentUser) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative" onClick={onMobileCartClick}>
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {itemCount}
            </span>
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name || 'User'} />
                <AvatarFallback>{currentUser.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {USER_NAVIGATION.map(item => (
                <Link href={item.href} key={item.name} passHref>
                  <DropdownMenuItem className="cursor-pointer">
                     {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    <span>{item.name}</span>
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuGroup>
             {isAdmin && (
              <>
                <DropdownMenuSeparator />
                 <Link href={ADMIN_NAVIGATION.find(nav => nav.name === 'Dashboard')?.href || '/admin/dashboard'} passHref>
                  <DropdownMenuItem className="cursor-pointer">
                     {ADMIN_NAVIGATION.find(nav => nav.name === 'Dashboard')?.icon ? 
                      React.createElement(ADMIN_NAVIGATION.find(nav => nav.name === 'Dashboard')!.icon!, {className: "mr-2 h-4 w-4"}) : null}
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                </Link>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Unauthenticated mobile user
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative" onClick={onMobileCartClick}>
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {itemCount}
        </span>
        )}
      </Button>
      <Link href="/login" passHref>
        <Button variant="ghost" size="icon" type="button">
            <UserCircle className="h-6 w-6" />
            <span className="sr-only">Login</span>
        </Button>
     </Link>
    </div>
  );
}
