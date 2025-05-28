
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { AddressForm } from '@/components/address-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { ShippingAddress, Order, DeliveryChargeSettings, Product as ProductType, User as UserType, CartItem, ShippingMethod, BusinessSettings } from '@/lib/types';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_USERS } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, ShieldCheck, Edit3, Home, Truck, Ship } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { DELIVERY_CHARGES_STORAGE_KEY, DEFAULT_DELIVERY_CHARGES, SHIPPING_METHODS_STORAGE_KEY, DEFAULT_SHIPPING_METHODS, BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';

export default function CheckoutPage() {
  const { currentUser, isAuthenticated, loading: authLoading, updateCurrentUserData } = useAuth();
  const { cartItems, getCartTotal, clearCart, itemCount } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [orderShippingAddress, setOrderShippingAddress] = useState<ShippingAddress | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [totalDeliveryCharge, setTotalDeliveryCharge] = useState<number | null>(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(true);

  const [deliverySettings] = useLocalStorage<DeliveryChargeSettings>(
    DELIVERY_CHARGES_STORAGE_KEY,
    DEFAULT_DELIVERY_CHARGES
  );

  const [availableShippingMethods] = useLocalStorage<ShippingMethod[]>(
    SHIPPING_METHODS_STORAGE_KEY,
    DEFAULT_SHIPPING_METHODS
  );
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>('');
  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings.availableCurrencies.find(c => c.code === settings.defaultCurrencyCode) || settings.availableCurrencies[0] || { symbol: '?' };
  const currencySymbol = activeCurrency.symbol;


  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (!authLoading && isAuthenticated && itemCount === 0 && !isPlacingOrder) {
      router.push('/cart');
      return;
    }

    if (currentUser) {
      if (currentUser.defaultShippingAddress) {
        setOrderShippingAddress(currentUser.defaultShippingAddress);
        setIsEditingAddress(false);
      } else {
        setOrderShippingAddress(null);
        setIsEditingAddress(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, itemCount, currentUser, isPlacingOrder]); // router was removed as it can cause re-runs if not stable

  useEffect(() => {
    if (availableShippingMethods.length === 1 && !selectedShippingMethodId) {
      setSelectedShippingMethodId(availableShippingMethods[0].id);
    } else if (availableShippingMethods.length > 1 && !selectedShippingMethodId) {
      setSelectedShippingMethodId('');
    }
  }, [availableShippingMethods, selectedShippingMethodId]);


  useEffect(() => {
    const calculateTotalDeliveryCharge = () => {
        if (!orderShippingAddress || cartItems.length === 0 || !deliverySettings || !currentUser) {
            setTotalDeliveryCharge(0);
            setIsCalculatingDelivery(false);
            return;
        }
        setIsCalculatingDelivery(true);

        const buyerAddress = orderShippingAddress;
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

        let calculatedTotal = 0;
        let allChargesCalculated = true;

        for (const sellerId in groupedBySeller) {
            const group = groupedBySeller[sellerId];
            const sellerAddress = group.seller?.defaultShippingAddress;
            let chargePerSeller: number | null = null;

            if (!sellerAddress) {
                chargePerSeller = deliverySettings.interDistrict;
            } else {
                if (buyerAddress.thana === sellerAddress.thana && buyerAddress.district === sellerAddress.district) {
                    chargePerSeller = deliverySettings.intraThana;
                } else if (buyerAddress.district === sellerAddress.district) {
                    chargePerSeller = deliverySettings.intraDistrict;
                } else {
                    chargePerSeller = deliverySettings.interDistrict;
                }
            }

            if (chargePerSeller !== null) {
                calculatedTotal += chargePerSeller;
            } else {
                allChargesCalculated = false;
            }
        }
        setTotalDeliveryCharge(allChargesCalculated ? calculatedTotal : null);
        setIsCalculatingDelivery(false);
    };
    calculateTotalDeliveryCharge();
  }, [cartItems, orderShippingAddress, deliverySettings, currentUser]);


  const initialAddressFormData = (): Partial<ShippingAddress> => {
    if (currentUser?.defaultShippingAddress) {
      return currentUser.defaultShippingAddress;
    }
    return {};
  };

  const handleAddressSubmit = (data: ShippingAddress) => {
    setOrderShippingAddress(data);
    if (currentUser) {
      updateCurrentUserData({ defaultShippingAddress: data });
    }
    toast({ title: "Address Confirmed", description: "Shipping address for this order has been updated." });
    setIsEditingAddress(false);
  };

  const handlePlaceOrder = async () => {
    if (!orderShippingAddress || !currentUser || totalDeliveryCharge === null || !selectedShippingMethodId) {
        toast({
            title: "Order Cannot Be Placed",
            description: "Please ensure your shipping address is confirmed, delivery charges are calculated, and a shipping method is selected.",
            variant: "destructive",
        });
        return;
    }
    setIsPlacingOrder(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const itemsSubtotal = getCartTotal();
    const finalTotalAmount = itemsSubtotal + totalDeliveryCharge;
    const selectedMethod = availableShippingMethods.find(m => m.id === selectedShippingMethodId);

    const newOrder: Order = {
      id: `order${MOCK_ORDERS.length + 1}-${Date.now()}`,
      userId: currentUser.id,
      items: cartItems.map(item => ({ ...item })),
      totalAmount: finalTotalAmount,
      deliveryChargeAmount: totalDeliveryCharge,
      shippingAddress: orderShippingAddress,
      status: 'pending',
      paymentStatus: 'unpaid',
      selectedShippingMethodId: selectedShippingMethodId,
      shippingMethodName: selectedMethod?.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      platformCommission: 0, // Initialize commission
    };
    MOCK_ORDERS.push(newOrder);

    clearCart();
    toast({
      title: "Order Placed Successfully!",
      description: `Your order #${newOrder.id} has been placed.`,
      variant: "default",
      duration: 4000,
    });
    router.push(`/order-confirmation/${newOrder.id}`);
  };

  if (authLoading || (!authLoading && !isAuthenticated && !isPlacingOrder) || (itemCount === 0 && !isPlacingOrder && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const itemsSubtotal = getCartTotal();
  const finalTotalAmount = totalDeliveryCharge !== null ? itemsSubtotal + totalDeliveryCharge : itemsSubtotal;

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Shipping Address</CardTitle>
             {!isEditingAddress && orderShippingAddress && (
                <CardDescription>
                    Your order will be shipped to the address below.
                </CardDescription>
             )}
             {isEditingAddress && (
                <CardDescription>
                 {orderShippingAddress ? "Update your shipping address." : "Enter your shipping details for Bangladesh."}
                </CardDescription>
             )}
          </CardHeader>
          <CardContent>
            {isEditingAddress ? (
              <AddressForm
                onSubmit={handleAddressSubmit}
                initialData={initialAddressFormData()}
              />
            ) : orderShippingAddress ? (
              <div className="space-y-3">
                <div className="p-4 border rounded-md bg-muted/50">
                    <p className="font-semibold flex items-center gap-2"><Home className="h-5 w-5 text-primary" /> {orderShippingAddress.fullName}</p>
                    <address className="text-sm text-muted-foreground not-italic pl-7 space-y-0.5">
                        <p>{orderShippingAddress.houseAddress}{orderShippingAddress.roadNumber ? `, ${orderShippingAddress.roadNumber}` : ''}</p>
                        <p>{orderShippingAddress.thana}, {orderShippingAddress.district}</p>
                        <p>{orderShippingAddress.division}, {orderShippingAddress.country}</p>
                        {orderShippingAddress.phoneNumber && <p>Phone: {orderShippingAddress.phoneNumber}</p>}
                    </address>
                </div>
                <Button variant="outline" onClick={() => setIsEditingAddress(true)} className="w-full sm:w-auto">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Address
                </Button>
              </div>
            ) : (
                 <div className="space-y-3">
                    <p className="text-muted-foreground">Please add your shipping address.</p>
                    <Button variant="outline" onClick={() => setIsEditingAddress(true)} className="w-full sm:w-auto">
                        Add Address
                    </Button>
                 </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg mb-8">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2"><Ship className="h-6 w-6 text-primary"/>Shipping Method</CardTitle>
            </CardHeader>
            <CardContent>
                {availableShippingMethods.length === 0 ? (
                    <p className="text-muted-foreground">No shipping methods available. Please contact support.</p>
                ) : availableShippingMethods.length === 1 ? (
                    <div className="p-4 border rounded-md bg-muted/50">
                        <p className="font-semibold">{availableShippingMethods[0].name}</p>
                        <p className="text-sm text-muted-foreground">(Default shipping method applied)</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="shipping-method">Select Shipping Method</Label>
                        <Select value={selectedShippingMethodId} onValueChange={setSelectedShippingMethodId}>
                            <SelectTrigger id="shipping-method">
                                <SelectValue placeholder="Choose a shipping method" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableShippingMethods.map(method => (
                                    <SelectItem key={method.id} value={method.id}>
                                        {method.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!selectedShippingMethodId && <p className="text-xs text-destructive">Please select a shipping method.</p>}
                    </div>
                )}
            </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Payment Information</CardTitle>
            <CardDescription>This is a mock payment step.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-muted/50 rounded-md text-center">
              <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="font-semibold">Mock Payment Gateway</p>
              <p className="text-sm text-muted-foreground">
                No actual payment will be processed. Click "Place Order" to simulate.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1">
        <Card className="shadow-lg sticky top-24">
          <CardHeader>
            <CardTitle className="text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div className="flex items-center gap-2">
                  <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded" data-ai-hint="product item" />
                  <div>
                    <p className="text-sm font-medium">{item.name} (x{item.quantity})</p>
                    <p className="text-xs text-muted-foreground">{currencySymbol}{item.price.toFixed(2)} each</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{currencySymbol}{itemsSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Truck className="h-4 w-4 text-muted-foreground"/>Shipping</span>
                    <span>
                        {isCalculatingDelivery ? 'Calculating...' :
                         (totalDeliveryCharge !== null ? `${currencySymbol}${totalDeliveryCharge.toFixed(2)}` : 'N/A')}
                    </span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span>{currencySymbol}{finalTotalAmount.toFixed(2)}</span>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handlePlaceOrder}
              className="w-full"
              size="lg"
              disabled={isPlacingOrder || cartItems.length === 0 || !orderShippingAddress || totalDeliveryCharge === null || isCalculatingDelivery || !selectedShippingMethodId}
            >
              {isPlacingOrder ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Place Order
            </Button>
          </CardFooter>
        </Card>
        {(!orderShippingAddress || totalDeliveryCharge === null || !selectedShippingMethodId) && cartItems.length > 0 && (
          <p className="text-xs text-destructive text-center mt-2">Please complete address, and select a shipping method. Delivery charges must be calculated.</p>
        )}
      </div>
    </div>
  );
}
