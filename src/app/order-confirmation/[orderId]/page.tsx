
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MOCK_ORDERS, MOCK_USERS } from '@/lib/mock-data';
import type { Order, User, CartItem, BusinessSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, ShoppingBag, HomeIcon } from 'lucide-react';
import { format } from 'date-fns';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [buyer, setBuyer] = useState<User | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings.availableCurrencies.find(c => c.code === settings.defaultCurrencyCode) || settings.availableCurrencies[0] || { symbol: '?' };
  const currencySymbol = activeCurrency.symbol;


  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      setTimeout(() => {
        const foundOrder = MOCK_ORDERS.find(o => o.id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
          const foundBuyer = MOCK_USERS.find(u => u.id === foundOrder.userId);
          setBuyer(foundBuyer || null);
        } else {
          setOrder(null);
        }
        setIsLoading(false);
      }, 500);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">We couldn't find details for order ID "{orderId}".</p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const itemsSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader className="text-center bg-green-50 rounded-t-lg py-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <CardTitle className="text-3xl font-bold text-green-700">Thank You For Your Order!</CardTitle>
          <CardDescription className="text-green-600 text-lg">
            Your order #{order.id} has been placed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Order Date:</strong> {format(new Date(order.createdAt), 'PPpp')}</p>
               {order.shippingMethodName && (
                <p><strong>Shipping Method:</strong> {order.shippingMethodName}</p>
              )}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
            <address className="not-italic text-sm text-muted-foreground space-y-0.5">
              <p><strong>{order.shippingAddress.fullName}</strong></p>
              <p>{order.shippingAddress.houseAddress}{order.shippingAddress.roadNumber ? `, ${order.shippingAddress.roadNumber}` : ''}</p>
              <p>{order.shippingAddress.thana}, {order.shippingAddress.district}</p>
              <p>{order.shippingAddress.division}, {order.shippingAddress.country}</p>
              {order.shippingAddress.phoneNumber && <p>Phone: {order.shippingAddress.phoneNumber}</p>}
            </address>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3">Items Ordered</h3>
            <div className="space-y-4">
              {order.items.map((item: CartItem) => (
                <div key={item.id} className="flex items-start gap-4 p-3 border rounded-md bg-muted/30">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="rounded-md aspect-square object-cover"
                    data-ai-hint="product photo"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Quantity: {item.quantity} x {currencySymbol}{item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items Subtotal:</span>
              <span className="font-medium">{currencySymbol}{itemsSubtotal.toFixed(2)}</span>
            </div>
            {order.deliveryChargeAmount !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping & Handling:</span>
                <span className="font-medium">{currencySymbol}{order.deliveryChargeAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
              <span>Order Total:</span>
              <span>{currencySymbol}{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center p-6 border-t">
          <Button asChild variant="outline">
            <Link href="/">
              <ShoppingBag className="mr-2 h-4 w-4" /> Continue Shopping
            </Link>
          </Button>
          <Button asChild>
            <Link href="/account/orders">
              <HomeIcon className="mr-2 h-4 w-4" /> View My Orders
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
