
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_ORDERS } from '@/lib/mock-data';
import type { Order } from '@/lib/types';
import { OrderListItem } from '@/components/order-list-item';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, ListOrdered, ShoppingBag } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AccountOrdersPage() {
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account/orders');
      return;
    }
    if (!authLoading && currentUser) {
      // Simulate fetching orders
      setTimeout(() => {
        const orders = MOCK_ORDERS.filter(order => order.userId === currentUser.id)
                                 .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserOrders(orders);
        setPageLoading(false);
      }, 500);
    }
  }, [isAuthenticated, authLoading, router, currentUser]);

  if (authLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
            <ListOrdered className="h-8 w-8 text-primary"/>
            My Orders
        </h1>
      </div>

      {userOrders.length === 0 ? (
        <Alert>
          <ShoppingBag className="h-5 w-5" />
          <AlertTitle>No Orders Yet!</AlertTitle>
          <AlertDescription>
            You haven&apos;t placed any orders yet. Start shopping to see your orders here.
            <Button asChild className="mt-4 block w-max">
              <Link href="/">Browse Products</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {userOrders.map(order => (
            <OrderListItem key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
