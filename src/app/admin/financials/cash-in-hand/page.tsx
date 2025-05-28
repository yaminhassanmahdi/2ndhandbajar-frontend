
"use client";
import { useEffect, useState, useMemo, useCallback } from 'react';
import { MOCK_USERS, MOCK_ORDERS, MOCK_WITHDRAWAL_REQUESTS, MOCK_PRODUCTS } from '@/lib/mock-data';
import type { User, Order, WithdrawalRequest, CommissionSetting, BusinessSettings, Currency, WithdrawalMethod } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Banknote, HandCoins, AlertTriangle, FileText, Smartphone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import useLocalStorage from '@/hooks/use-local-storage';
import { COMMISSION_SETTINGS_STORAGE_KEY, DEFAULT_COMMISSION_SETTINGS, BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge'; // Added import

interface UserWithEarnings extends User {
  pendingEarnings: number;
}

const getWithdrawalMethodSummary = (method?: WithdrawalMethod | null): string => {
    if (!method) return "Unknown Method";
    if (method.type === 'bkash') return `bKash: ...${method.details.accountNumber.slice(-4)}`;
    if (method.type === 'bank') return `${method.details.bankName}: ...${method.details.accountNumber.slice(-4)}`;
    return "Unknown Method";
};


export default function AdminCashInHandPage() {
  const [usersWithEarnings, setUsersWithEarnings] = useState<UserWithEarnings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedUserForPayment, setSelectedUserForPayment] = useState<UserWithEarnings | null>(null);
  const [selectedUserDefaultMethod, setSelectedUserDefaultMethod] = useState<WithdrawalMethod | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string | number>('');
  const [adminPaymentNote, setAdminPaymentNote] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [commissionSettings] = useLocalStorage<CommissionSetting[]>(
    COMMISSION_SETTINGS_STORAGE_KEY,
    DEFAULT_COMMISSION_SETTINGS
  );

  const [settings] = useLocalStorage<BusinessSettings>(
    BUSINESS_SETTINGS_STORAGE_KEY,
    DEFAULT_BUSINESS_SETTINGS
  );

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

  const calculateAllUsersPendingEarnings = useCallback(() => {
    setIsLoading(true);
    const updatedUsersWithEarnings: UserWithEarnings[] = [];

    MOCK_USERS.forEach(user => {
      if (user.isAdmin) return; // Skip admins

      let earned = 0;
      MOCK_ORDERS.forEach(order => {
        if (order.status === 'delivered' && order.paymentStatus === 'paid') {
          order.items.forEach(item => {
            const product = MOCK_PRODUCTS.find(p => p.id === item.id);
            if (product && product.sellerId === user.id) {
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
        .filter(req => req.userId === user.id && (req.status === 'pending' || req.status === 'approved'))
        .reduce((sum, req) => sum + req.amount, 0);
      
      const userPendingEarnings = Math.max(0, earned - pendingOrApprovedWithdrawals);

      if (userPendingEarnings > 0) {
        updatedUsersWithEarnings.push({ ...user, pendingEarnings: userPendingEarnings });
      }
    });

    setUsersWithEarnings(updatedUsersWithEarnings.sort((a,b) => b.pendingEarnings - a.pendingEarnings));
    setIsLoading(false);
  }, [commissionSettings]);

  useEffect(() => {
    calculateAllUsersPendingEarnings();
  }, [calculateAllUsersPendingEarnings]);

  const handleOpenPaymentDialog = (user: UserWithEarnings) => {
    setSelectedUserForPayment(user);
    const defaultMethod = user.withdrawalMethods?.find(m => m.isDefault);
    setSelectedUserDefaultMethod(defaultMethod || null);
    setPaymentAmount(user.pendingEarnings.toFixed(2));
    setAdminPaymentNote('');
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedUserForPayment || !paymentAmount) {
      toast({ title: "Error", description: "User or payment amount missing.", variant: "destructive" });
      return;
    }
    const amountToPay = Number(paymentAmount);
    if (isNaN(amountToPay) || amountToPay <= 0) {
      toast({ title: "Error", description: "Invalid payment amount.", variant: "destructive" });
      return;
    }
    if (amountToPay > selectedUserForPayment.pendingEarnings) {
      toast({ title: "Error", description: `Cannot pay more than pending earnings (${currencySymbol}${selectedUserForPayment.pendingEarnings.toFixed(2)}).`, variant: "destructive" });
      return;
    }

    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 700));

    const defaultMethod = selectedUserForPayment.withdrawalMethods?.find(m => m.isDefault);

    const newWithdrawal: WithdrawalRequest = {
      id: `wr-${Date.now()}`,
      userId: selectedUserForPayment.id,
      userName: selectedUserForPayment.name,
      amount: amountToPay,
      withdrawalMethodId: defaultMethod?.id || 'admin_manual',
      withdrawalMethodType: defaultMethod?.type || 'bank', // Default to bank if no method
      withdrawalMethodDetails: defaultMethod ? getWithdrawalMethodSummary(defaultMethod) : 'Admin Direct Payment',
      status: 'approved',
      requestedAt: new Date(),
      processedAt: new Date(),
      adminNote: adminPaymentNote.trim() || 'Admin direct payment from Cash in Hand.',
    };
    MOCK_WITHDRAWAL_REQUESTS.push(newWithdrawal);

    toast({ title: "Payment Recorded", description: `${currencySymbol}${amountToPay.toFixed(2)} paid to ${selectedUserForPayment.name} has been recorded.` });
    setFormSubmitting(false);
    setIsPaymentDialogOpen(false);
    calculateAllUsersPendingEarnings(); // Recalculate to update the list
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
        <HandCoins className="h-8 w-8 text-primary" />
        Cash in Hand (Seller Dues)
      </h1>
      <CardDescription>This page lists sellers who have pending earnings withdrawable from the platform.</CardDescription>

      {usersWithEarnings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">There are currently no sellers with pending earnings.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead className="text-right">Pending Earnings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersWithEarnings.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="text-right font-semibold">{currencySymbol}{user.pendingEarnings.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleOpenPaymentDialog(user)}>
                      <Banknote className="mr-2 h-4 w-4" /> Pay Due
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {selectedUserForPayment && (
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Pay Due to: {selectedUserForPayment.name}</DialogTitle>
              <DialogDescription>
                Pending Earnings: <span className="font-bold">{currencySymbol}{selectedUserForPayment.pendingEarnings.toFixed(2)}</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div>
                <Label className="font-semibold text-base">Default Withdrawal Method:</Label>
                {selectedUserDefaultMethod ? (
                  <Card className="mt-2 p-3 bg-muted/50">
                    <CardContent className="text-sm space-y-1 p-0">
                       <div className="flex items-center gap-2 mb-1">
                          {selectedUserDefaultMethod.type === 'bkash' ? <Smartphone className="h-5 w-5 text-pink-500" /> : <Banknote className="h-5 w-5 text-blue-500" />}
                          <span className="font-medium capitalize">{selectedUserDefaultMethod.type}</span>
                          {selectedUserDefaultMethod.isDefault && <Badge variant="outline" size="sm" className="text-xs">Default</Badge>}
                        </div>
                      {selectedUserDefaultMethod.type === 'bkash' && (
                        <p><strong>bKash Number:</strong> {selectedUserDefaultMethod.details.accountNumber}</p>
                      )}
                      {selectedUserDefaultMethod.type === 'bank' && (
                        <>
                          <p><strong>Bank Name:</strong> {selectedUserDefaultMethod.details.bankName}</p>
                          <p><strong>Account Holder:</strong> {selectedUserDefaultMethod.details.accountHolderName}</p>
                          <p><strong>Account Number:</strong> {selectedUserDefaultMethod.details.accountNumber}</p>
                          {selectedUserDefaultMethod.details.routingNumber && (
                            <p><strong>Routing Number:</strong> {selectedUserDefaultMethod.details.routingNumber}</p>
                          )}
                          {selectedUserDefaultMethod.details.branchName && (
                            <p><strong>Branch Name:</strong> {selectedUserDefaultMethod.details.branchName}</p>
                          )}
                        </>
                      )}
                       <p className="text-xs text-muted-foreground mt-1">Method Added: {format(new Date(selectedUserDefaultMethod.createdAt), 'PP')}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="mt-2 p-3 border rounded-md bg-yellow-50 border-yellow-300 text-yellow-700">
                     <p className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> User has no default withdrawal method set. Payment will be marked as manual.</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="payment-amount" className="font-semibold text-base">Amount to Pay ({activeCurrency.code})</Label>
                <Input 
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Max ${selectedUserForPayment.pendingEarnings.toFixed(2)}`}
                    className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="admin-payment-note" className="font-semibold text-base">Admin Note (Optional):</Label>
                <Textarea 
                    id="admin-payment-note"
                    value={adminPaymentNote}
                    onChange={(e) => setAdminPaymentNote(e.target.value)}
                    placeholder="Add a note for this payment..."
                    rows={3}
                    className="mt-1"
                    disabled={formSubmitting}
                />
              </div>
            </div>

            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button>
              </DialogClose>
              <Button 
                  onClick={handleConfirmPayment} 
                  disabled={formSubmitting || !paymentAmount || Number(paymentAmount) <= 0 || Number(paymentAmount) > selectedUserForPayment.pendingEarnings}
              >
                {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

    

    