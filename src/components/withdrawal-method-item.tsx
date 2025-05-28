
"use client";
import type { WithdrawalMethod } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Banknote, Smartphone, Trash2, CheckCircle } from "lucide-react";

interface WithdrawalMethodItemProps {
  method: WithdrawalMethod;
  onRemove: (methodId: string) => void;
  onSetDefault?: (methodId: string) => void; // Optional: if you want to set default
}

export function WithdrawalMethodItem({ method, onRemove, onSetDefault }: WithdrawalMethodItemProps) {
  const getDisplayDetails = () => {
    if (method.type === 'bkash') {
      return `bKash Account: ******${method.details.accountNumber.slice(-4)}`;
    }
    if (method.type === 'bank') {
      const bankDetails = method.details;
      return `${bankDetails.bankName}, Acc: ******${bankDetails.accountNumber.slice(-4)}`;
    }
    return "Unknown Method";
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg mb-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        {method.type === 'bkash' ? (
          <Smartphone className="h-6 w-6 text-pink-500" />
        ) : (
          <Banknote className="h-6 w-6 text-blue-500" />
        )}
        <div>
          <p className="font-medium">{getDisplayDetails()}</p>
          <p className="text-xs text-muted-foreground">Added: {new Date(method.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {method.isDefault && (
          <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Default</span>
        )}
        {onSetDefault && !method.isDefault && (
          <Button variant="outline" size="sm" onClick={() => onSetDefault(method.id)}>
            Set Default
          </Button>
        )}
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90" onClick={() => onRemove(method.id)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove Method</span>
        </Button>
      </div>
    </div>
  );
}
