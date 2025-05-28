
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
import { LogIn, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/use-local-storage";
import type { BusinessSettings } from "@/lib/types";
import { DEFAULT_BUSINESS_SETTINGS, BUSINESS_SETTINGS_STORAGE_KEY } from "@/lib/constants";
import { useEffect } from "react";

const googleLoginSettingsSchema = z.object({
  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),
});

type GoogleLoginSettingsFormData = z.infer<typeof googleLoginSettingsSchema>;

export default function AdminGoogleLoginSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useLocalStorage<BusinessSettings>(
    BUSINESS_SETTINGS_STORAGE_KEY,
    DEFAULT_BUSINESS_SETTINGS
  );
  
  const form = useForm<GoogleLoginSettingsFormData>({
    resolver: zodResolver(googleLoginSettingsSchema),
    defaultValues: {
      googleClientId: settings?.googleClientId || "",
      googleClientSecret: settings?.googleClientSecret || "",
    },
  });

  useEffect(() => {
    form.reset({
      googleClientId: settings?.googleClientId || "",
      googleClientSecret: settings?.googleClientSecret || "",
    });
  }, [settings, form]);

  const onSubmit = (data: GoogleLoginSettingsFormData) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      googleClientId: data.googleClientId,
      googleClientSecret: data.googleClientSecret,
    }));
    toast({
      title: "Settings Updated",
      description: "Google Login settings have been successfully saved.",
    });
  };

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <LogIn className="h-8 w-8 text-primary"/>
        Google Login Settings
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Configure Google Sign-In</CardTitle>
          <CardDescription>
            Enter your Google OAuth 2.0 Client ID and Client Secret. These settings are for mock purposes and will be stored in localStorage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
              <FormField
                control={form.control}
                name="googleClientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Client ID</FormLabel>
                    <FormControl><Input placeholder="Enter your Google Client ID" {...field} /></FormControl>
                    <FormDescription>The Client ID obtained from Google Cloud Console for your OAuth 2.0 credentials.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="googleClientSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Client Secret</FormLabel>
                    <FormControl><Input type="password" placeholder="Enter your Google Client Secret" {...field} /></FormControl>
                     <FormDescription>The Client Secret obtained from Google Cloud Console.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Google Login Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
