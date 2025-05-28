
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ProductUploadForm } from '@/components/product-upload-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SellPage() {
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/sell');
        return;
      }
      if (currentUser) {
        const addressSet = !!currentUser.defaultShippingAddress;
        const withdrawalSet = currentUser.withdrawalMethods && currentUser.withdrawalMethods.length > 0;
        if (!addressSet || !withdrawalSet) {
          toast({
            title: "Profile Incomplete",
            description: "Please complete your address and add a withdrawal method in settings to sell items.",
            variant: "destructive",
            duration: 5000,
          });
          router.push('/account/settings?from=sell');
          return;
        }
      }
    }
  }, [isAuthenticated, authLoading, router, currentUser, toast]);

  if (authLoading || (!authLoading && !isAuthenticated) || 
      (currentUser && (!currentUser.defaultShippingAddress || !currentUser.withdrawalMethods || currentUser.withdrawalMethods.length === 0)) ) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
             <DollarSign className="h-8 w-8 text-primary" />
             <CardTitle className="text-3xl font-bold">Sell Your Item</CardTitle>
          </div>
          <CardDescription>Fill out the form below to list your product on 2ndhandbajar.com. All listings are subject to admin approval.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
