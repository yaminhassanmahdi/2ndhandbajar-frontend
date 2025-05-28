
"use client";
import { useCart } from '@/contexts/cart-context';
import { CartItem as CartItemComponent } from '@/components/cart-item'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShoppingCart, ArrowRight, Truck, Info, Package } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import useLocalStorage from '@/hooks/use-local-storage';
import type { DeliveryChargeSettings, ShippingAddress, Product as ProductType, User as UserType, CartItem, BusinessSettings } from '@/lib/types';
import { DELIVERY_CHARGES_STORAGE_KEY, DEFAULT_DELIVERY_CHARGES, BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';
import { MOCK_PRODUCTS, MOCK_USERS } from '@/lib/mock-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface SellerCartGroup {
  sellerId: string;
  sellerName?: string;
  sellerAddress?: ShippingAddress | null;
  items: CartItem[];
  deliveryCharge: number | null;
  deliveryMessage: React.ReactNode | null; 
}

export default function CartPage() {
  const { cartItems, getCartTotal, clearCart, itemCount } = useCart();
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const [deliverySettings] = useLocalStorage<DeliveryChargeSettings>(
    DELIVERY_CHARGES_STORAGE_KEY,
    DEFAULT_DELIVERY_CHARGES
  );
  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings.availableCurrencies.find(c => c.code === settings.defaultCurrencyCode) || settings.availableCurrencies[0] || { symbol: '?' };
  const currencySymbol = activeCurrency.symbol;

  const [sellerCartGroups, setSellerCartGroups] = useState<SellerCartGroup[]>([]);
  const [totalDeliveryCharge, setTotalDeliveryCharge] = useState<number | null>(null);
  const [overallDeliveryMessage, setOverallDeliveryMessage] = useState<React.ReactNode | null>("Calculating shipping..."); 
  const [isCalculating, setIsCalculating] = useState(true);


  useEffect(() => {
    const calculateDelivery = async () => {
      setIsCalculating(true);
      if (authLoading) {
        setOverallDeliveryMessage("Calculating shipping...");
        setSellerCartGroups([]);
        setTotalDeliveryCharge(null);
        setIsCalculating(false);
        return;
      }

      if (!isAuthenticated) {
        setOverallDeliveryMessage(
          <>
            <Link href="/login" className="underline hover:text-primary">Login</Link> to see shipping costs.
          </>
        );
        setSellerCartGroups([]);
        setTotalDeliveryCharge(null);
        setIsCalculating(false);
        return;
      }

      if (!currentUser?.defaultShippingAddress) {
        setOverallDeliveryMessage(
          <>
            Add a shipping address in <Link href="/account/settings" className="underline hover:text-primary">settings</Link> to see shipping costs.
          </>
        );
        setSellerCartGroups([]);
        setTotalDeliveryCharge(null);
        setIsCalculating(false);
        return;
      }

      if (itemCount === 0) {
        setOverallDeliveryMessage(null); 
        setSellerCartGroups([]);
        setTotalDeliveryCharge(0);
        setIsCalculating(false);
        return;
      }

      const buyerAddress = currentUser.defaultShippingAddress;
      const groupedBySeller: Record<string, { seller?: UserType, items: CartItem[] }> = {};

      for (const cartItem of cartItems) {
        const productDetails = MOCK_PRODUCTS.find(p => p.id === cartItem.id);
        if (productDetails?.sellerId) {
          if (!groupedBySeller[productDetails.sellerId]) {
            const seller = MOCK_USERS.find(u => u.id === productDetails.sellerId);
            groupedBySeller[productDetails.sellerId] = { seller, items: [] };
          }
          groupedBySeller[productDetails.sellerId].items.push(cartItem);
        } else {
          
          if (!groupedBySeller['unknown_seller']) {
             groupedBySeller['unknown_seller'] = { seller: undefined, items: [] };
          }
          groupedBySeller['unknown_seller'].items.push(cartItem);
        }
      }

      const newSellerCartGroups: SellerCartGroup[] = [];
      let calculatedTotalDelivery = 0;
      let allChargesCalculated = true;

      for (const sellerId in groupedBySeller) {
        const group = groupedBySeller[sellerId];
        const sellerAddress = group.seller?.defaultShippingAddress;
        let charge: number | null = null;
        let message: React.ReactNode | null = null; 

        if (!sellerAddress) {
          charge = deliverySettings.interDistrict; 
          message = "Seller address unavailable, using default charge.";
        } else {
          if (buyerAddress.thana === sellerAddress.thana && buyerAddress.district === sellerAddress.district) {
            charge = deliverySettings.intraThana;
          } else if (buyerAddress.district === sellerAddress.district) {
            charge = deliverySettings.intraDistrict;
          } else {
            charge = deliverySettings.interDistrict;
          }
        }
        
        if (charge !== null) {
            calculatedTotalDelivery += charge;
        } else {
            allChargesCalculated = false; 
        }

        newSellerCartGroups.push({
          sellerId,
          sellerName: group.seller?.name || "Unknown Seller",
          sellerAddress,
          items: group.items,
          deliveryCharge: charge,
          deliveryMessage: message,
        });
      }
      
      setSellerCartGroups(newSellerCartGroups);
      setTotalDeliveryCharge(allChargesCalculated ? calculatedTotalDelivery : null);
      setOverallDeliveryMessage(null); 
      setIsCalculating(false);
    };

    calculateDelivery();
  }, [cartItems, currentUser, isAuthenticated, authLoading, deliverySettings, itemCount]);

  const subTotal = getCartTotal();
  const grandTotal = totalDeliveryCharge !== null ? subTotal + totalDeliveryCharge : subTotal;
  const multipleSellers = sellerCartGroups.length > 1;

  if (itemCount === 0 && !authLoading && !isCalculating) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-semibold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <ShoppingCart /> Your Shopping Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {isCalculating && <p className="py-4 text-center text-muted-foreground">Loading cart details...</p>}
            {!isCalculating && overallDeliveryMessage && (
                <Alert variant="default" className="my-4">
                    <Info className="h-5 w-5" />
                    <AlertTitle>Shipping Information</AlertTitle>
                    <AlertDescription>{overallDeliveryMessage}</AlertDescription>
                </Alert>
            )}
            {!isCalculating && !overallDeliveryMessage && sellerCartGroups.map((group, index) => (
              <div key={group.sellerId} className="py-4">
                {multipleSellers && (
                  <div className="mb-3 pb-2 border-b">
                    <h3 className="text-md font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Items from {group.sellerName}
                    </h3>
                  </div>
                )}
                {group.items.map(item => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
                <div className="flex justify-end items-center mt-2 pt-2 border-t text-sm">
                  <span className="text-muted-foreground mr-2">Shipping for these items:</span>
                  {group.deliveryCharge !== null ? (
                    <span className="font-semibold">{currencySymbol}{group.deliveryCharge.toFixed(2)}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">{group.deliveryMessage || "Calculating..."}</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        {multipleSellers && !isCalculating && !overallDeliveryMessage && (
            <Alert variant="default" className="mt-4">
                <Info className="h-5 w-5" />
                <AlertTitle>Multiple Sellers</AlertTitle>
                <AlertDescription>You have items from multiple sellers. Shipping charges are calculated and applied separately for each seller's items.</AlertDescription>
            </Alert>
        )}
        {cartItems.length > 0 && (
          <div className="mt-4">
            <Button variant="outline" onClick={clearCart} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90">
              Clear Cart
            </Button>
          </div>
        )}
      </div>

      <div className="md:col-span-1">
        <Card className="shadow-lg sticky top-24">
          <CardHeader>
            <CardTitle className="text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{currencySymbol}{subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1"><Truck className="h-4 w-4 text-muted-foreground"/>Total Shipping</span>
              {isCalculating ? (
                <span className="text-xs text-muted-foreground">Calculating...</span>
              ) : totalDeliveryCharge !== null ? (
                <span>{currencySymbol}{totalDeliveryCharge.toFixed(2)}</span>
              ) : (
                <span className="text-xs text-muted-foreground">{typeof overallDeliveryMessage === 'string' ? overallDeliveryMessage : "Unavailable"}</span>
              )}
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4">
              <span>Grand Total</span>
              <span>{currencySymbol}{grandTotal.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
                asChild 
                className="w-full" 
                size="lg" 
                disabled={isCalculating || itemCount === 0 || totalDeliveryCharge === null || !!overallDeliveryMessage}
            >
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardFooter>
           {(isCalculating || (totalDeliveryCharge === null && itemCount > 0 && !overallDeliveryMessage)) && (
             <p className="text-xs text-muted-foreground text-center pt-2 px-2">
                {isCalculating ? "Finalizing shipping costs..." : (typeof overallDeliveryMessage === 'string' ? overallDeliveryMessage : "Complete address or login to proceed.")}
             </p>
           )}
        </Card>
      </div>
    </div>
  );
}
