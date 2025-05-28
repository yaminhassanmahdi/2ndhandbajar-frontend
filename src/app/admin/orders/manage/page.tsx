
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_USERS } from '@/lib/mock-data';
import type { Order, OrderStatus, User, PaymentStatus, BusinessSettings } from '@/lib/types'; 
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Settings2, Loader2, SearchX, Filter, Edit, Trash2, MoreHorizontal, Eye, CreditCard } from 'lucide-react'; 
import { format } from 'date-fns';
import { ORDER_STATUSES, PAYMENT_STATUSES, BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants'; 
import { Badge } from '@/components/ui/badge'; 
import useLocalStorage from '@/hooks/use-local-storage';

export default function AdminManageOrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all'); 

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings.availableCurrencies.find(c => c.code === settings.defaultCurrencyCode) || settings.availableCurrencies[0] || { symbol: '?' };
  const currencySymbol = activeCurrency.symbol;


  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
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
    if (paymentStatusFilter !== 'all') { 
      tempOrders = tempOrders.filter(order => order.paymentStatus === paymentStatusFilter);
    }
    setFilteredOrders(tempOrders);
  }, [searchTerm, statusFilter, paymentStatusFilter, allOrders]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setProcessingOrderId(orderId);
    await new Promise(resolve => setTimeout(resolve, 700));

    const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      MOCK_ORDERS[orderIndex].status = newStatus;
      MOCK_ORDERS[orderIndex].updatedAt = new Date();
    }

    setAllOrders(prevOrders =>
        prevOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order
        )
    );
    toast({ title: "Order Status Updated", description: `Order #${orderId} status changed to ${newStatus}.` });
    setProcessingOrderId(null);
  };
  
  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    setProcessingOrderId(orderId);
    await new Promise(resolve => setTimeout(resolve, 700));

    const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      MOCK_ORDERS[orderIndex].paymentStatus = newPaymentStatus;
      MOCK_ORDERS[orderIndex].updatedAt = new Date(); 
    }

    setAllOrders(prevOrders =>
        prevOrders.map(order =>
            order.id === orderId ? { ...order, paymentStatus: newPaymentStatus, updatedAt: new Date() } : order
        )
    );
    toast({ title: "Payment Status Updated", description: `Order #${orderId} payment status changed to ${newPaymentStatus}.` });
    setProcessingOrderId(null);
  };


  const handleEditOrder = (orderId: string) => {
    toast({ title: "Edit Action", description: `Edit order #${orderId} (Not implemented).` });
  };

  const handleDeleteOrder = (orderId: string) => {
    setAllOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
    toast({ title: "Order Deleted", description: `Order #${orderId} has been removed (mock).`, variant: "destructive" });
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings2 className="h-8 w-8 text-primary"/>
          Manage All Orders
        </h1>
      </div>

      <div className="p-4 border rounded-lg bg-card shadow grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="flex-grow md:col-span-1">
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
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Filter by order status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Order Statuses</SelectItem>
              {ORDER_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <Select value={paymentStatusFilter} onValueChange={(value) => setPaymentStatusFilter(value as PaymentStatus | 'all')}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Filter by payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Statuses</SelectItem>
              {PAYMENT_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
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
        <Card className="shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => {
                const buyer = MOCK_USERS.find(u => u.id === order.userId);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline text-primary">
                        {order.id}
                      </Link>
                    </TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{buyer?.name || order.shippingAddress.fullName}</TableCell>
                    <TableCell>{currencySymbol}{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) => handleUpdateOrderStatus(order.id, newStatus as OrderStatus)}
                        disabled={processingOrderId === order.id}
                      >
                        <SelectTrigger className="h-8 text-xs w-[130px]">
                           <SelectValue placeholder="Order Status" />
                        </SelectTrigger>
                        <SelectContent>
                           {ORDER_STATUSES.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                       <Select
                        value={order.paymentStatus}
                        onValueChange={(newPaymentStatus) => handleUpdatePaymentStatus(order.id, newPaymentStatus as PaymentStatus)}
                        disabled={processingOrderId === order.id}
                      >
                        <SelectTrigger className="h-8 text-xs w-[110px]">
                           <SelectValue placeholder="Payment Status" />
                        </SelectTrigger>
                        <SelectContent>
                           {PAYMENT_STATUSES.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={processingOrderId === order.id}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Order Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditOrder(order.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Order (Mock)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Order (Mock)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
