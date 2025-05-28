
"use client";
import { useEffect, useState } from 'react';
import { MOCK_ORDERS } from '@/lib/mock-data';
import type { Order, OrderStatus } from '@/lib/types';
import { OrderManagementCard } from '@/components/admin/order-management-card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PackageX, Loader2, SearchX } from 'lucide-react';

export default function AdminCancelledOrdersPage() {
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const filtered = MOCK_ORDERS.filter(order => order.status === 'cancelled')
                                 .sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setCancelledOrders(filtered);
      setIsLoading(false);
    }, 300);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setProcessingOrderId(orderId);
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      MOCK_ORDERS[orderIndex].status = newStatus;
      MOCK_ORDERS[orderIndex].updatedAt = new Date();
    }

    setCancelledOrders(prevOrders => 
        prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order
        ).filter(order => newStatus === 'cancelled' ? true : order.id !== orderId) 
    );

    toast({ title: "Order Status Updated", description: `Order #${orderId} status changed to ${newStatus}.` });
    setProcessingOrderId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <PackageX className="h-8 w-8 text-primary"/>
        Cancelled Orders
      </h1>

      {cancelledOrders.length === 0 ? (
        <Alert>
          <SearchX className="h-5 w-5" />
          <AlertTitle>No Cancelled Orders</AlertTitle>
          <AlertDescription>
            There are currently no orders marked as "cancelled".
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cancelledOrders.map(order => (
            <OrderManagementCard 
              key={order.id} 
              order={order} 
              onUpdateStatus={handleUpdateStatus}
              isProcessing={processingOrderId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
