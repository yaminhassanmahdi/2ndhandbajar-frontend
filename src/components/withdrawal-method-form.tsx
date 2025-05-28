
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WithdrawalMethodType, BKashDetails, BankDetails } from "@/lib/types";
import { Loader2 } from "lucide-react";

const bkashSchema = z.object({
  type: z.literal('bkash'),
  accountNumber: z.string().length(11, "bKash number must be 11 digits.").regex(/^\d+$/, "Must be digits only."),
});

const bankSchema = z.object({
  type: z.literal('bank'),
  bankName: z.string().min(2, "Bank name is required."),
  accountHolderName: z.string().min(2, "Account holder name is required."),
  accountNumber: z.string().min(5, "Account number is required."),
  routingNumber: z.string().optional(),
  branchName: z.string().optional(),
});

// Discriminated union
const formSchema = z.discriminatedUnion("type", [bkashSchema, bankSchema]);

export type WithdrawalFormData = z.infer<typeof formSchema>;

interface WithdrawalMethodFormProps {
  onSubmit: (data: WithdrawalFormData) => Promise<void>;
  isLoading?: boolean;
}

export function WithdrawalMethodForm({ onSubmit, isLoading = false }: WithdrawalMethodFormProps) {
  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'bkash', // Default to bKash
      // Fields will be conditionally rendered, so no need for default values for all
    },
  });

  const selectedType = form.watch("type");

  const handleFormSubmit = async (values: WithdrawalFormData) => {
    await onSubmit(values);
    form.reset({ type: 'bkash'}); // Reset form after submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Method Type</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value as WithdrawalMethodType);
                // Reset other fields when type changes
                if (value === 'bkash') {
                    form.setValue('accountNumber', '');
                    // @ts-ignore
                    form.setValue('bankName', undefined); 
                } else {
                    // @ts-ignore
                    form.setValue('accountNumber', undefined);
                    form.setValue('bankName', '');
                    form.setValue('accountHolderName', '');
                    form.setValue('accountNumber', '');
                    form.setValue('routingNumber', '');
                    form.setValue('branchName', '');
                }

              }} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a withdrawal method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bkash">bKash</SelectItem>
                  <SelectItem value="bank">Bank Account</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedType === 'bkash' && (
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>bKash Account Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="01XXXXXXXXX" {...field} />
                </FormControl>
                <FormDescription>Enter your 11-digit bKash personal account number.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedType === 'bank' && (
          <>
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., City Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountHolderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="As it appears on your bank account" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your bank account number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="routingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Routing Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Bank routing number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="branchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Gulshan Branch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Method
        </Button>
      </form>
    </Form>
  );
}
