
"use client";
import type { User, ShippingAddress, WithdrawalMethod } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Banknote, Smartphone, Home, Mail, User as UserIcon } from "lucide-react";

interface UserDetailsViewProps {
  user: User;
}

const formatAddress = (address: ShippingAddress | null | undefined): string => {
  if (!address) return "No address on file.";
  return `${address.fullName}\n${address.houseAddress}${address.roadNumber ? `, ${address.roadNumber}` : ''}\n${address.thana}, ${address.district}, ${address.division}\n${address.country}${address.phoneNumber ? `\nPhone: ${address.phoneNumber}` : ''}`;
};

const formatWithdrawalMethod = (method: WithdrawalMethod): string => {
  if (method.type === 'bkash') {
    return `bKash: ****${method.details.accountNumber.slice(-4)} ${method.isDefault ? '(Default)' : ''}`;
  }
  if (method.type === 'bank') {
    const bankDetails = method.details;
    return `${bankDetails.bankName}, A/C Holder: ${bankDetails.accountHolderName}, A/C No: ****${bankDetails.accountNumber.slice(-4)} ${method.isDefault ? '(Default)' : ''}`;
  }
  return "Unknown Method";
};

export function UserDetailsView({ user }: UserDetailsViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5" /> Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5" /> Default Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="text-sm whitespace-pre-line">
          {formatAddress(user.defaultShippingAddress)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5" /> Withdrawal Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {user.withdrawalMethods && user.withdrawalMethods.length > 0 ? (
            user.withdrawalMethods.map(method => (
              <div key={method.id} className="p-2 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  {method.type === 'bkash' ? <Smartphone className="h-4 w-4 text-pink-500" /> : <Banknote className="h-4 w-4 text-blue-500" />}
                  <span className="font-medium">{method.type === 'bkash' ? 'bKash' : 'Bank Account'}</span>
                  {method.isDefault && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Default</span>}
                </div>
                {method.type === 'bkash' && (
                  <p>Account Number: {method.details.accountNumber}</p>
                )}
                {method.type === 'bank' && (
                  <>
                    <p>Bank Name: {method.details.bankName}</p>
                    <p>Account Holder: {method.details.accountHolderName}</p>
                    <p>Account Number: {method.details.accountNumber}</p>
                    {method.details.routingNumber && <p>Routing Number: {method.details.routingNumber}</p>}
                    {method.details.branchName && <p>Branch: {method.details.branchName}</p>}
                  </>
                )}
                 <p className="text-xs text-muted-foreground mt-1">Added: {new Date(method.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p>No withdrawal methods on file.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
