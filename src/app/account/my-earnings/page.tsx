
"use client";
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_WITHDRAWAL_REQUESTS } from '@/lib/mock-data';
import type { WithdrawalRequest, WithdrawalRequestStatus, WithdrawalMethod, User, CommissionSetting, BusinessSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, TrendingUp, History, CheckCircle2, XCircle, AlertTriangle, PlusCircle, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import useLocalStorage from '@/hooks/use-local-storage';
import { COMMISSION_SETTINGS_STORAGE_KEY, DEFAULT_COMMISSION_SETTINGS, BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';

const getWithdrawalMethodSummary = (method: WithdrawalMethod | undefined): string => {
    if (!method) return "Unknown Method";
    if (method.type === 'bkash') return `bKash: ...${method.details.accountNumber.slice(-4)}`;
    if (method.type === 'bank') return `${method.details.bankName}: ...${method.details.accountNumber.slice(-4)}`;
    return "Unknown Method";
};

export default function MyEarningsPage() {
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [pageLoading, setPageLoading] = useState(true);
  const [userWithdrawalRequests, setUserWithdrawalRequests] = useState<WithdrawalRequest[]>([]);

  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | string>('');
  const [selectedWithdrawalMethodId, setSelectedWithdrawalMethodId] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [commissionSettings] = useLocalStorage<CommissionSetting[]>(
    COMMISSION_SETTINGS_STORAGE_KEY,
    DEFAULT_COMMISSION_SETTINGS
  );
  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings.availableCurrencies.find(c => c.code === settings.defaultCurrencyCode) || settings.availableCurrencies[0] || { symbol: '?' };
  const currencySymbol = activeCurrency.symbol;


  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/account/my-earnings');
        return;
      }
      if (currentUser) {
        const requests = MOCK_WITHDRAWAL_REQUESTS
          .filter(req => req.userId === currentUser.id)
          .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        setUserWithdrawalRequests(requests);
        setPageLoading(false);
      } else {
         setPageLoading(false); 
      }
    }
  }, [isAuthenticated, authLoading, router, currentUser]);

  const pendingEarnings = useMemo(() => {
    if (!currentUser) return 0;
    let earned = 0;
    MOCK_ORDERS.forEach(order => {
      if (order.status === 'delivered' && order.paymentStatus === 'paid') {
        order.items.forEach(item => {
          const product = MOCK_PRODUCTS.find(p => p.id === item.id);
          if (product && product.sellerId === currentUser.id) {
            const itemValue = item.price * item.quantity;
            const categoryCommissionSetting = commissionSettings.find(cs => cs.categoryId === product.categoryId);
            const commissionPercentage = categoryCommissionSetting ? parseFloat(String(categoryCommissionSetting.percentage)) : 0;
            const commissionAmount = itemValue * (commissionPercentage / 100);
            earned += (itemValue - commissionAmount);
          }
        });
      }
    });
    const pendingOrApprovedWithdrawals = MOCK_WITHDRAWAL_REQUESTS
      .filter(req => req.userId === currentUser.id && (req.status === 'pending' || req.status === 'approved'))
      .reduce((sum, req) => sum + req.amount, 0);

    return Math.max(0, earned - pendingOrApprovedWithdrawals);
  }, [currentUser, commissionSettings]);

  const totalWithdrawn = useMemo(() => {
    if (!currentUser) return 0;
    return MOCK_WITHDRAWAL_REQUESTS
      .filter(req => req.userId === currentUser.id && req.status === 'approved')
      .reduce((sum, req) => sum + req.amount, 0);
  }, [currentUser]);

  const handleWithdrawSubmit = async () => {
    if (!currentUser || !selectedWithdrawalMethodId || !withdrawAmount) {
      toast({ title: "Error", description: "Please select a method and enter an amount.", variant: "destructive" });
      return;
    }
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Invalid withdrawal amount.", variant: "destructive" });
      return;
    }
    if (amount > pendingEarnings) {
      toast({ title: "Error", description: "Withdrawal amount cannot exceed pending earnings.", variant: "destructive" });
      return;
    }

    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 700));

    const selectedMethod = currentUser.withdrawalMethods?.find(m => m.id === selectedWithdrawalMethodId);
    if (!selectedMethod) {
        toast({ title: "Error", description: "Selected withdrawal method not found.", variant: "destructive" });
        setFormSubmitting(false);
        return;
    }

    const newRequest: WithdrawalRequest = {
      id: `wr-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      amount: amount,
      withdrawalMethodId: selectedMethod.id,
      withdrawalMethodType: selectedMethod.type,
      withdrawalMethodDetails: getWithdrawalMethodSummary(selectedMethod),
      status: 'pending',
      requestedAt: new Date(),
    };
    MOCK_WITHDRAWAL_REQUESTS.push(newRequest);
    setUserWithdrawalRequests(prev => [newRequest, ...prev].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));

    toast({ title: "Withdrawal Requested", description: `Your request for ${currencySymbol}${amount.toFixed(2)} has been submitted.` });
    setIsWithdrawDialogOpen(false);
    setWithdrawAmount('');
    setSelectedWithdrawalMethodId('');
    setFormSubmitting(false);
  };


  if (authLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!currentUser) { 
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="ml-4">Could not load user data.</p>
      </div>
    );
  }

  const noWithdrawalMethods = !currentUser.withdrawalMethods || currentUser.withdrawalMethods.length === 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-primary" />
        My Earnings & Withdrawals
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-green-50 border-green-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <DollarSign className="h-6 w-6" /> Pending Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{currencySymbol}{pendingEarnings.toFixed(2)}</p>
            <CardDescription className="text-green-500 mt-1">Available for withdrawal after platform commission. Earnings are credited after orders are delivered & paid.</CardDescription>
          </CardContent>
          <CardFooter>
            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={pendingEarnings <= 0 || noWithdrawalMethods}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Withdrawal</DialogTitle>
                  <DialogDescription>Select method and enter amount. Max: {currencySymbol}{pendingEarnings.toFixed(2)}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdrawal-method">Withdrawal Method</Label>
                    <Select value={selectedWithdrawalMethodId} onValueChange={setSelectedWithdrawalMethodId}>
                      <SelectTrigger id="withdrawal-method">
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentUser.withdrawalMethods?.map(method => (
                          <SelectItem key={method.id} value={method.id}>
                            {getWithdrawalMethodSummary(method)} {method.isDefault && "(Default)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount ({activeCurrency.code})</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      step="0.01"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={`Max ${currencySymbol}${pendingEarnings.toFixed(2)}`}
                    />
                  </div>
                </div>
                <DialogFooter className="sm:justify-between">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleWithdrawSubmit} disabled={formSubmitting || !selectedWithdrawalMethodId || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > pendingEarnings}>
                    {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {noWithdrawalMethods && pendingEarnings > 0 && (
                 <p className="text-xs text-red-500 mt-2 text-center">
                    Please <Link href="/account/settings" className="underline">add a withdrawal method</Link> to request funds.
                </p>
            )}
             {pendingEarnings <= 0 && (
                 <p className="text-xs text-muted-foreground mt-2 text-center">
                    No earnings available for withdrawal.
                </p>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-primary" /> Total Withdrawn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{currencySymbol}{totalWithdrawn.toFixed(2)}</p>
            <CardDescription className="mt-1">Total amount successfully withdrawn to your accounts.</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-6 w-6 text-primary" /> Withdrawal History</CardTitle>
          <CardDescription>Track your past and pending withdrawal requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {userWithdrawalRequests.length === 0 ? (
            <p className="text-muted-foreground">No withdrawal requests made yet.</p>
          ) : (
            <div className="space-y-4">
              {userWithdrawalRequests.map(req => (
                <div key={req.id} className="p-4 border rounded-lg hover:shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                    <p className="font-semibold text-lg">{currencySymbol}{req.amount.toFixed(2)}</p>
                    <Badge
                        variant={
                            req.status === 'approved' ? 'default' :
                            req.status === 'pending' ? 'secondary' :
                            'destructive'
                        }
                        className="capitalize self-start sm:self-center"
                    >
                        {req.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">To: {req.withdrawalMethodDetails}</p>
                  <p className="text-xs text-muted-foreground">Requested: {format(new Date(req.requestedAt), 'PPpp')}</p>
                  {req.processedAt && (
                    <p className="text-xs text-muted-foreground">Processed: {format(new Date(req.processedAt), 'PPpp')}</p>
                  )}
                  {req.adminNote && (
                    <p className="text-xs mt-1 pt-1 border-t text-blue-600">Admin Note: {req.adminNote}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
