
"use client";
import type { Order, OrderStatus, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { ORDER_STATUSES } from '@/lib/constants';
import Image from 'next/image';
import { UserCircle, MapPin, Calendar, Edit3, Save, Briefcase, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MOCK_PRODUCTS, MOCK_USERS } from '@/lib/mock-data'; // To find seller

interface OrderManagementCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  isProcessing?: boolean;
}

export function OrderManagementCard({ order, onUpdateStatus, isProcessing }: OrderManagementCardProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [seller, setSeller] = useState<User | null>(null);

  useEffect(() => {
    // Find the first product to determine the seller
    if (order.items.length > 0) {
      const firstItemId = order.items[0].id;
      const product = MOCK_PRODUCTS.find(p => p.id === firstItemId);
      if (product && product.sellerId) {
        const foundSeller = MOCK_USERS.find(u => u.id === product.sellerId);
        setSeller(foundSeller || null);
      }
    }
  }, [order.items]);

  const handleStatusChange = (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);
  };

  const handleSaveStatus = async () => {
    await onUpdateStatus(order.id, selectedStatus);
    setIsEditingStatus(false);
  };
  
  const { shippingAddress: buyerAddress } = order;
  const displayBuyerAddress = `${buyerAddress.houseAddress}${buyerAddress.roadNumber ? `, ${buyerAddress.roadNumber}` : ''}, ${buyerAddress.thana}, ${buyerAddress.district}, ${buyerAddress.division}, Bangladesh`;

  const sellerAddress = seller?.defaultShippingAddress;
  const displaySellerAddress = sellerAddress
    ? `${sellerAddress.houseAddress}${sellerAddress.roadNumber ? `, ${sellerAddress.roadNumber}` : ''}, ${sellerAddress.thana}, ${sellerAddress.district}, ${sellerAddress.division}, Bangladesh`
    : "N/A";

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between pb-3 border-b">
        <div>
          <CardTitle className="text-xl">Order #{order.id}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
             <Calendar className="mr-1.5 h-4 w-4" /> Placed: {format(new Date(order.createdAt), 'PPpp')}
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div>
            <h4 className="font-semibold mb-1 text-md flex items-center"><UserCircle className="h-5 w-5 mr-2 text-primary" />Customer (Buyer)</h4>
            <div className="text-sm text-muted-foreground space-y-0.5 pl-7">
              <p>{buyerAddress.fullName} (ID: {order.userId})</p>
              <p className="flex items-start"><Home className="h-4 w-4 mr-2 shrink-0 mt-0.5" /> {displayBuyerAddress}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-md flex items-center"><Briefcase className="h-5 w-5 mr-2 text-primary" />Seller</h4>
            {seller ? (
              <div className="text-sm text-muted-foreground space-y-0.5 pl-7">
                <p>{seller.name} (ID: {seller.id})</p>
                <p className="flex items-start"><Home className="h-4 w-4 mr-2 shrink-0 mt-0.5" /> {displaySellerAddress}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground pl-7">Seller information not available.</p>
            )}
          </div>
        </div>
        
        <div className="mb-4 pt-3 border-t">
            <h4 className="font-semibold mb-1 text-md">Order Value</h4>
            <p className="text-2xl font-bold text-primary">${order.totalAmount.toFixed(2)}</p>
        </div>
        
        <h4 className="font-semibold mb-2 text-md border-t pt-3">Items ({order.items.length})</h4>
        <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
            {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/30 text-sm">
                <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded aspect-square object-cover" data-ai-hint="product item"/>
                <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity} &bull; Price: ${item.price.toFixed(2)} &bull; Subtotal: ${(item.quantity * item.price).toFixed(2)}</p>
                </div>
            </div>
            ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedStatus} onValueChange={handleStatusChange} disabled={!isEditingStatus || isProcessing}>
            <SelectTrigger className="w-full sm:w-[200px] h-9">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map(statusOpt => (
                <SelectItem key={statusOpt.value} value={statusOpt.value}>{statusOpt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isEditingStatus ? (
            <Button size="sm" onClick={handleSaveStatus} disabled={isProcessing || selectedStatus === order.status}>
                 <Save className="mr-2 h-4 w-4" /> Save Status
            </Button>
        ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditingStatus(true)}>
                <Edit3 className="mr-2 h-4 w-4" /> Update Status
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
