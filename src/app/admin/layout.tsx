
"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { AdminNav } from '@/components/admin/admin-nav';
import { SiteHeader } from '@/components/site-header';
import { Loader2, ShieldAlert, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'; // Added SheetHeader, SheetTitle

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    if (isClient && !authLoading) {
      if (!currentUser) {
        router.push(`/login?redirect=${pathname}`);
      } else if (!isAdmin) {
        router.push('/'); 
      }
    }
  }, [currentUser, isAdmin, authLoading, router, pathname, isClient]);

  if (!isClient || authLoading || (currentUser && !isAdmin)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if(!currentUser) {
     return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-8 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You need to be logged in to access this page.</p>
        <Button asChild>
            <Link href={`/login?redirect=${pathname}`}>Go to Login</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Logo />
        </div>
        <ScrollArea className="flex-1 py-4">
          <div className="px-4">
            <AdminNav />
          </div>
        </ScrollArea>
        <div className="mt-auto p-4 border-t">
            <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </aside>

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-72 flex-1">
         <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            {/* Mobile Nav Trigger */}
            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Admin Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SheetHeader className="border-b">
                    <div className="flex h-16 items-center px-6">
                      <Logo />
                    </div>
                    <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="flex-1 py-4">
                    <div className="px-4">
                      <AdminNav />
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
            <div className="ml-auto flex items-center gap-2">
                {/* Could add UserNav here if admin-specific actions are needed in header */}
            </div>
         </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 bg-background rounded-lg shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
