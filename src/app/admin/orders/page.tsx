
"use client";
import { useEffect, useState } from 'react';
import { MOCK_ORDERS } from '@/lib/mock-data';
import type { Order, OrderStatus } from '@/lib/types';
import { OrderManagementCard } from '@/components/admin/order-management-card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingCart, Loader2, SearchX, Filter } from 'lucide-react';

export default function AdminOrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // MOCK_ORDERS is mutable, so ensure we sort a copy if needed or rely on current state.
      const sortedOrders = [...MOCK_ORDERS].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let tempOrders = [...allOrders];
    if (searchTerm) {
      tempOrders = tempOrders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      tempOrders = tempOrders.filter(order => order.status === statusFilter);
    }
    setFilteredOrders(tempOrders);
  }, [searchTerm, statusFilter, allOrders]);


  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setProcessingOrderId(orderId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));
    
    setAllOrders(prevOrders => 
        prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order
        )
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
        <ShoppingCart className="h-8 w-8 text-primary"/>
        Order Management
      </h1>

      <div className="p-4 border rounded-lg bg-card shadow space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="flex-grow">
          <Input 
            placeholder="Search by Order ID, User ID, Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
            <SelectTrigger className="w-full md:w-[180px] h-10">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="handed_over">Handed Over</SelectItem>
              <SelectItem value="in_shipping">In Shipping</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Alert>
          <SearchX className="h-5 w-5" />
          <AlertTitle>No Orders Found</AlertTitle>
          <AlertDescription>
            There are no orders matching your current filters, or no orders have been placed yet.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map(order => (
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
