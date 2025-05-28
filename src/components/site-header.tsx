
"use client";
import Link from 'next/link';
import { Button } from './ui/button';
import { PlusCircle, Search, Menu, Handshake, ShoppingCart, ChevronDown, MoreVertical } from 'lucide-react'; 
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'; 
import { MOCK_CATEGORIES } from '@/lib/mock-data';
import { USER_NAVIGATION, ADMIN_NAVIGATION, CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES } from '@/lib/constants'; 
import { useAuth } from '@/contexts/auth-context';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useLocalStorage from '@/hooks/use-local-storage';
import type { BusinessSettings, Category } from '@/lib/types';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS, APP_NAME } from '@/lib/constants';
import { CartSidebar } from './cart-sidebar';
import { useCart } from '@/contexts/cart-context';
import { UserNav } from './user-nav';
import { Logo } from './logo';

export function SiteHeader() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { itemCount } = useCart();

  const [storedBusinessSettings] = useLocalStorage<BusinessSettings>(
    BUSINESS_SETTINGS_STORAGE_KEY,
    DEFAULT_BUSINESS_SETTINGS
  );
  const [storedCategories] = useLocalStorage<Category[]>(CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES);


  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const [sortedCategoriesForDrawer, setSortedCategoriesForDrawer] = useState<Category[]>([]);


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const categoriesToDisplay = Array.isArray(storedCategories) && storedCategories.length > 0 ? storedCategories : INITIAL_CATEGORIES;
    const sorted = [...categoriesToDisplay].sort((a, b) => 
      (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name)
    );
    setSortedCategoriesForDrawer(sorted);
  }, [storedCategories]);

  const appNameToUse = isClient ? storedBusinessSettings.appName || APP_NAME : APP_NAME;
  const faviconUrl = isClient ? storedBusinessSettings.faviconUrl : null;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center">
          {/* Mobile Menu Trigger */}
          <div className="md:hidden mr-2 sm:mr-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-3/4 sm:w-1/2 p-0">
                <SheetHeader className="p-4 border-b">
                  <div className="flex items-center">
                    <Logo />
                  </div>
                   <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary" />
                </SheetHeader>
                <div className="py-6">
                  <nav className="grid gap-2 px-4">
                    <Link href="/" className="py-2 text-lg font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    {isAuthenticated && (
                      <Link href="/sell" className="py-2 text-lg font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Sell Your Item</Link>
                    )}
                    <div className="pt-4">
                      <h3 className="mb-2 px-0 text-lg font-semibold tracking-tight">Categories</h3>
                      {sortedCategoriesForDrawer.map((category) => (
                         <Link key={category.id} href={`/category/${category.id}`} className="block py-2 text-muted-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                          {category.name}
                        </Link>
                      ))}
                    </div>
                     {isAuthenticated && (
                       <>
                        <div className="pt-4 mt-4 border-t">
                          <h3 className="mb-2 px-0 text-lg font-semibold tracking-tight">My Account</h3>
                          {USER_NAVIGATION.map(item => (
                             <Link href={item.href} key={item.name} passHref>
                               <div className="block py-2 text-muted-foreground hover:text-primary cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>{item.name}</div>
                             </Link>
                          ))}
                        </div>
                       </>
                     )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Logo / Favicon Section */}
          <div className="flex items-center flex-shrink-0 mr-2 sm:mr-4">
            {/* Desktop: Render the full Logo component */}
            <div className="hidden md:block">
              <Logo />
            </div>
            {/* Mobile: Render Favicon */}
            <Link href="/" className="md:hidden text-primary hover:text-primary/90 transition-colors">
              <div className="h-8 w-8 flex items-center justify-center">
                {isClient && faviconUrl && faviconUrl !== DEFAULT_BUSINESS_SETTINGS.faviconUrl ? (
                  <Image
                    src={faviconUrl}
                    alt={`${appNameToUse} Favicon`}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                ) : (
                  <Handshake className="h-7 w-7" /> 
                )}
              </div>
            </Link>
          </div>
          
          {/* Search Bar Wrapper */}
          <div className="flex-1 flex justify-center items-center mx-1 sm:mx-2 px-1 sm:px-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full rounded-lg bg-muted pl-10 pr-4 py-2 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>

          {/* Desktop Right side actions */}
          <div className="hidden md:flex items-center ml-auto gap-1 lg:gap-2 flex-shrink-0">
              <Link href="/sell" passHref>
                  <Button
                      variant="default"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground h-10 px-3"
                  >
                      <PlusCircle className="h-5 w-5 mr-1.5" />
                      <span className="hidden sm:inline">Sell Now</span>
                  </Button>
              </Link>
              <Button variant="ghost" className="relative h-10 px-2.5" onClick={() => setIsCartSidebarOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                <span className="ml-1.5 text-sm hidden lg:inline">Cart</span>
                {isClient && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {itemCount}
                  </span>
                )}
              </Button>
              <UserNav isDesktop={true} />
          </div>

          {/* Mobile Right side actions */}
          <div className="md:hidden flex items-center ml-auto gap-1 sm:gap-2 flex-shrink-0">
             <UserNav onMobileCartClick={() => setIsCartSidebarOpen(true)} isDesktop={false} />
          </div>
        </div>
      </header>

      {/* Cart Sidebar Sheet */}
      <Sheet open={isCartSidebarOpen} onOpenChange={setIsCartSidebarOpen}>
        <SheetContent className="w-[350px] sm:w-[400px] p-0 flex flex-col" side="right">
          <CartSidebar onClose={() => setIsCartSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

