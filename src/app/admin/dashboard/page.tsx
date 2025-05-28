
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_USERS } from "@/lib/mock-data";
import { DollarSign, ShoppingCart, Users, CheckSquare, Percent, Truck } from "lucide-react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { CommissionSetting, BusinessSettings, Currency } from "@/lib/types";
import { COMMISSION_SETTINGS_STORAGE_KEY, DEFAULT_COMMISSION_SETTINGS, BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from "@/lib/constants";
import { useMemo } from "react";

export default function AdminDashboardPage() {
  const [commissionSettings] = useLocalStorage<CommissionSetting[]>(
    COMMISSION_SETTINGS_STORAGE_KEY,
    DEFAULT_COMMISSION_SETTINGS
  );
  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);

  const safeAvailableCurrencies: Currency[] = settings?.availableCurrencies && Array.isArray(settings.availableCurrencies) && settings.availableCurrencies.length > 0
    ? settings.availableCurrencies
    : DEFAULT_BUSINESS_SETTINGS.availableCurrencies;

  const safeDefaultCurrencyCode: string = settings?.defaultCurrencyCode
    ? settings.defaultCurrencyCode
    : DEFAULT_BUSINESS_SETTINGS.defaultCurrencyCode;

  const activeCurrency: Currency =
    safeAvailableCurrencies.find(c => c.code === safeDefaultCurrencyCode) ||
    safeAvailableCurrencies[0] ||
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' }; 

  const currencySymbol = activeCurrency.symbol;

  const dashboardStats = useMemo(() => {
    let totalPlatformSales = 0;
    let totalPlatformCommission = 0;
    let totalDeliveryChargesCollected = 0;

    MOCK_ORDERS.forEach(order => {
      if (order.status === 'delivered' && order.paymentStatus === 'paid') {
        const orderItemSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalPlatformSales += orderItemSubtotal;

        if (order.deliveryChargeAmount) {
          totalDeliveryChargesCollected += order.deliveryChargeAmount;
        }

        let orderCommission = 0;
        order.items.forEach(item => {
          const product = MOCK_PRODUCTS.find(p => p.id === item.id);
          if (product) {
            const categoryCommissionSetting = commissionSettings.find(cs => cs.categoryId === product.categoryId);
            const commissionPercentage = categoryCommissionSetting ? parseFloat(String(categoryCommissionSetting.percentage)) : 0;
            orderCommission += (item.price * item.quantity) * (commissionPercentage / 100);
          }
        });
        totalPlatformCommission += orderCommission;
      }
    });

    const pendingProducts = MOCK_PRODUCTS.filter(p => p.status === 'pending').length;
    const totalUsers = MOCK_USERS.length;
    const totalOrders = MOCK_ORDERS.length;

    return {
      totalPlatformCommission: parseFloat(totalPlatformCommission.toFixed(2)),
      totalPlatformSales: parseFloat(totalPlatformSales.toFixed(2)),
      totalDeliveryChargesCollected: parseFloat(totalDeliveryChargesCollected.toFixed(2)),
      pendingProducts,
      totalUsers,
      totalOrders,
    };
  }, [commissionSettings, settings.defaultCurrencyCode, settings.availableCurrencies]);


  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Commission</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol}{dashboardStats.totalPlatformCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From delivered & paid orders</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Sales (GMV)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol}{dashboardStats.totalPlatformSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Subtotal of items in delivered & paid orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Delivery Charges</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol}{dashboardStats.totalDeliveryChargesCollected.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Collected from delivered & paid orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All orders placed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total users on the platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Pending Approval</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.pendingProducts}</div>
            <p className="text-xs text-muted-foreground">Items awaiting review</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Welcome, Admin!</CardTitle>
            <CardDescription>Use the navigation on the left to manage the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>This is your central hub for overseeing {settings.appName}. From here you can manage products, orders, users, locations, and financial settings like commissions and withdrawal requests.</p>
        </CardContent>
      </Card>
    </div>
  );
}
