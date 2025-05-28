
"use client";
import type { Order, BusinessSettings } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { format } from 'date-fns';
import { OrderStatusBadge } from './order-status-badge';
import { CreditCard, CalendarDays } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';

interface OrderListItemProps {
  order: Order;
}

export function OrderListItem({ order }: OrderListItemProps) {
  const { shippingAddress } = order;
  const displayAddress = `${shippingAddress.houseAddress}${shippingAddress.roadNumber ? `, ${shippingAddress.roadNumber}` : ''}, ${shippingAddress.thana}, ${shippingAddress.district}, ${shippingAddress.division}`;
  
  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings.availableCurrencies.find(c => c.code === settings.defaultCurrencyCode) || settings.availableCurrencies[0] || { symbol: '?' };
  const currencySymbol = activeCurrency.symbol;

  return (
    <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Order #{order.id}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
             <CalendarDays className="mr-1.5 h-4 w-4" /> Placed on: {format(new Date(order.createdAt), 'MMM d, yyyy')}
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {order.items.slice(0, 2).map(item => ( 
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={50}
                height={50}
                className="rounded-md aspect-square object-cover"
                data-ai-hint="product item"
              />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity} &bull; Price: {currencySymbol}{item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-sm text-muted-foreground text-center py-1">+ {order.items.length - 2} more item(s)</p>
          )}
        </div>
        <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Shipping to: {shippingAddress.fullName}</p>
            <p className="text-xs text-muted-foreground">{displayAddress}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center font-semibold text-lg">
            <CreditCard className="mr-2 h-5 w-5 text-primary" /> Total: {currencySymbol}{order.totalAmount.toFixed(2)}
        </div>
      </CardFooter>
    </Card>
  );
}
