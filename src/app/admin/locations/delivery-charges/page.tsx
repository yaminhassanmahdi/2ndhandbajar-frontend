
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/use-local-storage";
import type { DeliveryChargeSettings } from "@/lib/types";
import { DEFAULT_DELIVERY_CHARGES, DELIVERY_CHARGES_STORAGE_KEY } from "@/lib/constants";
import { useEffect } from "react";

const deliveryChargeSchema = z.object({
  intraThana: z.coerce.number().min(0, "Charge must be non-negative."),
  intraDistrict: z.coerce.number().min(0, "Charge must be non-negative."),
  interDistrict: z.coerce.number().min(0, "Charge must be non-negative."),
});

type DeliveryChargeFormData = z.infer<typeof deliveryChargeSchema>;

export default function AdminDeliveryChargesPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useLocalStorage<DeliveryChargeSettings>(
    DELIVERY_CHARGES_STORAGE_KEY,
    DEFAULT_DELIVERY_CHARGES
  );
  
  const form = useForm<DeliveryChargeFormData>({
    resolver: zodResolver(deliveryChargeSchema),
    defaultValues: settings,
  });

  useEffect(() => {
    form.reset(settings); // Reset form if settings from localStorage change or on initial load
  }, [settings, form]);

  const onSubmit = (data: DeliveryChargeFormData) => {
    setSettings(data);
    toast({
      title: "Settings Updated",
      description: "Delivery charges have been successfully saved.",
    });
  };

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-primary"/>
        Manage Delivery Charges
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Set Delivery Fees</CardTitle>
          <CardDescription>
            Configure the delivery charges for different scenarios based on seller and buyer locations.
            All charges are in BDT.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
              <FormField
                control={form.control}
                name="intraThana"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intra-Thana/Upazilla Charge</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 70" {...field} />
                    </FormControl>
                    <FormDescription>
                      Seller and buyer are in the same Thana/Upazilla.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="intraDistrict"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intra-District Charge</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 110" {...field} />
                    </FormControl>
                    <FormDescription>
                      Seller and buyer are in the same District but different Thanas/Upazillas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interDistrict"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inter-District Charge</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 130" {...field} />
                    </FormControl>
                    <FormDescription>
                      Seller and buyer are in different Districts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Charges
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
