
"use client";
import { useEffect, useState } from 'react';
import { MOCK_ORDERS } from '@/lib/mock-data';
import type { Order, OrderStatus } from '@/lib/types';
import { OrderManagementCard } from '@/components/admin/order-management-card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package as PackageIcon, Loader2, SearchX } from 'lucide-react'; // Using PackageIcon for processing

export default function AdminProcessingOrdersPage() {
  const [processingOrders, setProcessingOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const filtered = MOCK_ORDERS.filter(order => order.status === 'processing')
                                 .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProcessingOrders(filtered);
      setIsLoading(false);
    }, 300);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setProcessingOrderId(orderId);
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Update in MOCK_ORDERS directly (simulating DB update)
    const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      MOCK_ORDERS[orderIndex].status = newStatus;
      MOCK_ORDERS[orderIndex].updatedAt = new Date();
    }

    // Update local state
    setProcessingOrders(prevOrders => 
        prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order
        ).filter(order => newStatus === 'processing' ? true : order.id !== orderId) // Keep if still processing, otherwise remove
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
        <PackageIcon className="h-8 w-8 text-primary"/>
        Processing Orders
      </h1>

      {processingOrders.length === 0 ? (
        <Alert>
          <SearchX className="h-5 w-5" />
          <AlertTitle>No Processing Orders</AlertTitle>
          <AlertDescription>
            There are currently no orders in "processing" status.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {processingOrders.map(order => (
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
