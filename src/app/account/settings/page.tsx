
"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { AddressForm } from '@/components/address-form';
import { WithdrawalMethodForm, type WithdrawalFormData } from '@/components/withdrawal-method-form';
import { WithdrawalMethodItem } from '@/components/withdrawal-method-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import type { ShippingAddress, WithdrawalMethod, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Home, CreditCard, PlusCircle, AlertTriangle, Mail, Phone, Lock, UserCircleIcon } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription as AlertDesc } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";

const emailUpdateSchema = z.object({
  newEmail: z.string().email("Invalid email address."),
});
type EmailUpdateFormData = z.infer<typeof emailUpdateSchema>;

const phoneUpdateSchema = z.object({
  newPhoneNumber: z.string().length(11, "Phone number must be 11 digits.").regex(/^\d+$/, "Must be digits only."),
});
type PhoneUpdateFormData = z.infer<typeof phoneUpdateSchema>;

const passwordUpdateSchema = z.object({
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});
type PasswordUpdateFormData = z.infer<typeof passwordUpdateSchema>;


export default function AccountSettingsPage() {
  const { currentUser, isAuthenticated, loading: authLoading, updateCurrentUserData, updateEmail, updatePhoneNumber, updatePassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [credentialFormSubmitting, setCredentialFormSubmitting] = useState<'email' | 'phone' | 'password' | null>(null);


  const fromSellPage = searchParams.get('from') === 'sell';

  const emailForm = useForm<EmailUpdateFormData>({
    resolver: zodResolver(emailUpdateSchema),
    defaultValues: { newEmail: currentUser?.email || "" },
  });

  const phoneForm = useForm<PhoneUpdateFormData>({
    resolver: zodResolver(phoneUpdateSchema),
    defaultValues: { newPhoneNumber: currentUser?.phoneNumber || "" },
  });

  const passwordForm = useForm<PasswordUpdateFormData>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account/settings');
    }
     if (currentUser) {
      emailForm.reset({ newEmail: currentUser.email || "" });
      phoneForm.reset({ newPhoneNumber: currentUser.phoneNumber || "" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, router, currentUser]);

  const handleAddressSubmit = async (data: ShippingAddress) => {
    if (!currentUser) return;
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    updateCurrentUserData({ defaultShippingAddress: data });

    toast({ title: "Address Updated", description: "Your shipping address has been saved." });
    setFormSubmitting(false);
    setIsAddressDialogOpen(false);
  };
  
  const handleWithdrawalSubmit = async (data: WithdrawalFormData) => {
    if (!currentUser) return;
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const newMethod: WithdrawalMethod = {
      id: `wm-${Date.now()}`, 
      type: data.type,
      // @ts-ignore 
      details: data.type === 'bkash' ? { accountNumber: data.accountNumber } : { bankName: data.bankName, accountHolderName: data.accountHolderName, accountNumber: data.accountNumber, routingNumber: data.routingNumber, branchName: data.branchName },
      isDefault: !(currentUser.withdrawalMethods && currentUser.withdrawalMethods.length > 0),
      createdAt: new Date(),
    };
    
    const updatedMethods = [...(currentUser.withdrawalMethods || []), newMethod];
    updateCurrentUserData({ withdrawalMethods: updatedMethods });

    toast({ title: "Withdrawal Method Added", description: `New ${data.type} method has been added.` });
    setFormSubmitting(false);
    setIsWithdrawalDialogOpen(false);
  };

  const handleRemoveWithdrawalMethod = (methodId: string) => {
    if (!currentUser) return;
     const updatedMethods = (currentUser.withdrawalMethods || []).filter(m => m.id !== methodId);
     if (updatedMethods.length > 0 && !updatedMethods.some(m => m.isDefault)) {
        updatedMethods[0].isDefault = true;
     }
     updateCurrentUserData({ withdrawalMethods: updatedMethods });
     toast({ title: "Method Removed", description: "Withdrawal method has been removed." });
  };

   const handleSetDefaultWithdrawalMethod = (methodId: string) => {
    if (!currentUser || !currentUser.withdrawalMethods) return;
    const updatedMethods = currentUser.withdrawalMethods.map(m => ({
      ...m,
      isDefault: m.id === methodId,
    }));
    updateCurrentUserData({ withdrawalMethods: updatedMethods });
    toast({ title: "Default Method Set", description: "Withdrawal method has been set as default." });
  };

  const onUpdateEmail = async (data: EmailUpdateFormData) => {
    setCredentialFormSubmitting('email');
    const result = await updateEmail(data.newEmail);
    if (result.success) {
      toast({ title: "Email Updated", description: "Your email address has been successfully updated." });
    } else {
      toast({ title: "Error", description: result.error || "Failed to update email.", variant: "destructive" });
    }
    setCredentialFormSubmitting(null);
  };

  const onUpdatePhone = async (data: PhoneUpdateFormData) => {
    setCredentialFormSubmitting('phone');
    const result = await updatePhoneNumber(data.newPhoneNumber);
    if (result.success) {
      toast({ title: "Phone Number Updated", description: "Your phone number has been successfully updated." });
    } else {
      toast({ title: "Error", description: result.error || "Failed to update phone number.", variant: "destructive" });
    }
    setCredentialFormSubmitting(null);
  };

  const onUpdatePassword = async (data: PasswordUpdateFormData) => {
    setCredentialFormSubmitting('password');
    const result = await updatePassword(data.newPassword);
    if (result.success) {
      toast({ title: "Password Updated", description: "Your password has been successfully updated." });
      passwordForm.reset();
    } else {
      toast({ title: "Error", description: result.error || "Failed to update password.", variant: "destructive" });
    }
    setCredentialFormSubmitting(null);
  };


  if (authLoading || (!authLoading && !isAuthenticated) || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const currentAddress = currentUser.defaultShippingAddress;
  const noAddressSet = !currentAddress;
  const noWithdrawalMethodsSet = !currentUser.withdrawalMethods || currentUser.withdrawalMethods.length === 0;
  const profileIncompleteForSelling = fromSellPage && (noAddressSet || noWithdrawalMethodsSet);


  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      {profileIncompleteForSelling && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Profile Incomplete for Selling</AlertTitle>
          <AlertDesc> 
            To list items for sale, please ensure you have:
            <ul className="list-disc pl-5 mt-1">
              {!currentAddress && <li>A saved shipping address.</li>}
              {noWithdrawalMethodsSet && <li>At least one withdrawal method.</li>}
            </ul>
          </AlertDesc>
        </Alert>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCircleIcon className="h-6 w-6 text-primary" /> Account Credentials</CardTitle>
            <CardDescription>Manage your login and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {/* Email Update Section */}
                <AccordionItem value="email">
                    <AccordionTrigger>Update Email</AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <p className="text-sm text-muted-foreground mb-2">Current Email: {currentUser.email || "Not set"}</p>
                        <Form {...emailForm}>
                            <form onSubmit={emailForm.handleSubmit(onUpdateEmail)} className="space-y-4">
                                <FormField
                                    control={emailForm.control}
                                    name="newEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>New Email Address</FormLabel>
                                        <FormControl><Input type="email" placeholder="your.new.email@example.com" {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={credentialFormSubmitting === 'email'}>
                                    {credentialFormSubmitting === 'email' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Email
                                </Button>
                            </form>
                        </Form>
                    </AccordionContent>
                </AccordionItem>

                {/* Phone Update Section */}
                <AccordionItem value="phone">
                    <AccordionTrigger>Update Phone Number</AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <p className="text-sm text-muted-foreground mb-2">Current Phone: {currentUser.phoneNumber}</p>
                         <Form {...phoneForm}>
                            <form onSubmit={phoneForm.handleSubmit(onUpdatePhone)} className="space-y-4">
                                <FormField
                                    control={phoneForm.control}
                                    name="newPhoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>New Phone Number</FormLabel>
                                        <FormControl><Input type="tel" placeholder="01XXXXXXXXX" {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={credentialFormSubmitting === 'phone'}>
                                    {credentialFormSubmitting === 'phone' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Phone Number
                                </Button>
                            </form>
                        </Form>
                    </AccordionContent>
                </AccordionItem>

                {/* Password Update Section */}
                <AccordionItem value="password">
                    <AccordionTrigger>Change Password</AccordionTrigger>
                    <AccordionContent className="pt-4">
                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                                <FormField
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={passwordForm.control}
                                    name="confirmNewPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={credentialFormSubmitting === 'password'}>
                                    {credentialFormSubmitting === 'password' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Change Password
                                </Button>
                            </form>
                        </Form>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
      </Card>

      {/* Shipping Address Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Home className="h-6 w-6 text-primary" /> Shipping Address</CardTitle>
          <CardDescription>Manage your default shipping address for orders.</CardDescription>
           {fromSellPage && noAddressSet && (
            <p className="text-sm text-destructive mt-1">A shipping address is required to sell items.</p>
          )}
        </CardHeader>
        <CardContent>
          {currentAddress ? (
            <div>
              <p><strong>{currentAddress.fullName}</strong></p>
              <p>{currentAddress.houseAddress}{currentAddress.roadNumber ? `, ${currentAddress.roadNumber}` : ''}</p>
              <p>{currentAddress.thana}, {currentAddress.district}</p>
              <p>{currentAddress.division}, {currentAddress.country}</p>
              {currentAddress.phoneNumber && <p>Phone: {currentAddress.phoneNumber}</p>}
            </div>
          ) : (
            <p className="text-muted-foreground">No default shipping address set.</p>
          )}
        </CardContent>
        <CardFooter>
          <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">{currentAddress ? "Edit Address" : "Add Address"}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{currentAddress ? "Edit Shipping Address" : "Add Shipping Address"}</DialogTitle>
                <DialogDescription>
                  Enter your details. This address will be used for future orders.
                </DialogDescription>
              </DialogHeader>
              <AddressForm 
                onSubmit={handleAddressSubmit} 
                initialData={currentAddress || {}} 
                isLoading={formSubmitting}
              />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* Withdrawal Methods Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-6 w-6 text-primary" /> Withdrawal Methods</CardTitle>
          <CardDescription>Manage your payment withdrawal methods for selling items.</CardDescription>
          {fromSellPage && noWithdrawalMethodsSet && (
             <p className="text-sm text-destructive mt-1">At least one withdrawal method is required to sell items.</p>
          )}
        </CardHeader>
        <CardContent>
          {(currentUser.withdrawalMethods && currentUser.withdrawalMethods.length > 0) ? (
             <div className="space-y-3">
                {currentUser.withdrawalMethods.map(method => (
                <WithdrawalMethodItem 
                    key={method.id} 
                    method={method} 
                    onRemove={handleRemoveWithdrawalMethod}
                    onSetDefault={handleSetDefaultWithdrawalMethod}
                />
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No withdrawal methods added yet.</p>
          )}
        </CardContent>
        <CardFooter>
           <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Method
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Withdrawal Method</DialogTitle>
                <DialogDescription>
                  Choose your preferred method and enter the required details.
                </DialogDescription>
              </DialogHeader>
              <WithdrawalMethodForm 
                onSubmit={handleWithdrawalSubmit}
                isLoading={formSubmitting}
              />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}

    