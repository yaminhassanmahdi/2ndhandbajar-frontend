
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, useSearchParams } from "next/navigation"; 
import React, { useState, useEffect } from "react"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Mail, Phone, LogIn } from "lucide-react"; 
import { Separator } from "./ui/separator";

const loginSchema = z.object({
  identifier: z.string().min(1, { message: "Phone number or email is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters."}),
  phoneNumber: z.string().length(11, {message: "Phone number must be 11 digits."}).regex(/^\d+$/, "Must be digits only."),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')), 
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const completeGoogleSignupSchema = z.object({
  phoneNumber: z.string().length(11, {message: "Phone number must be 11 digits."}).regex(/^\d+$/, "Must be digits only."),
});


type AuthFormProps = {
  mode: 'login' | 'register' | 'completeGoogleSignup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const { login, register, signInWithGoogle, completeGoogleSignInWithPhoneNumber, pendingGoogleUserEmail, clearPendingGoogleUser, currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  
  const [showCompleteGoogleSignup, setShowCompleteGoogleSignup] = useState(false);
  const [googleEmailForPhone, setGoogleEmailForPhone] = useState<string | null>(null);

  useEffect(() => {
    const needsPhone = searchParams.get('needsPhone');
    const email = searchParams.get('googleEmail');
    if (needsPhone === 'true' && email) {
      setShowCompleteGoogleSignup(true);
      setGoogleEmailForPhone(email);
    } else if (pendingGoogleUserEmail && mode !== 'completeGoogleSignup') {
      setShowCompleteGoogleSignup(true);
      setGoogleEmailForPhone(pendingGoogleUserEmail);
    }
  }, [searchParams, pendingGoogleUserEmail, mode]);


  const currentFormSchema = 
    showCompleteGoogleSignup ? completeGoogleSignupSchema :
    mode === 'login' ? loginSchema : registerSchema;
  
  type FormData = z.infer<typeof currentFormSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: 
      showCompleteGoogleSignup ? { phoneNumber: "" } as any :
      mode === 'login' 
      ? { identifier: "", password: "" }
      : { name: "", phoneNumber: "", email: "", password: "" },
  });

  useEffect(() => {
    form.reset(
      showCompleteGoogleSignup ? { phoneNumber: "" } as any :
      mode === 'login' 
      ? { identifier: "", password: "" }
      : { name: "", phoneNumber: "", email: "", password: "" }
    );
  }, [showCompleteGoogleSignup, mode]);


  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setError(null);
    try {
      let userResult;
      if (showCompleteGoogleSignup && googleEmailForPhone) {
        const phoneData = values as z.infer<typeof completeGoogleSignupSchema>;
        userResult = await completeGoogleSignInWithPhoneNumber(googleEmailForPhone, phoneData.phoneNumber);
        if (userResult) {
          setShowCompleteGoogleSignup(false);
          setGoogleEmailForPhone(null);
          clearPendingGoogleUser(); 
          router.push(searchParams.get('redirect') || "/");
        } else {
          setError("Failed to complete sign-up. Phone number might be in use or invalid.");
        }
      } else if (mode === 'login') {
        const loginData = values as z.infer<typeof loginSchema>;
        userResult = await login(loginData.identifier, loginData.password, loginMethod);
        if (userResult) {
          router.push(searchParams.get('redirect') || "/");
        } else {
         setError("Invalid credentials. Please check your " + loginMethod + " and password.");
        }
      } else if (mode === 'register') {
        const regData = values as z.infer<typeof registerSchema>;
        userResult = await register(regData.name, regData.phoneNumber, regData.password, regData.email || undefined);
         if (userResult) {
          router.push(searchParams.get('redirect') || "/");
        } else {
          setError("Registration failed. Phone number or email might already be in use.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const result = await signInWithGoogle();
    if (result?.user) {
      if (result.needsPhoneNumber && result.googleEmail) {
        setGoogleEmailForPhone(result.googleEmail);
        setShowCompleteGoogleSignup(true);
        form.reset({ phoneNumber: "" } as any);

      } else if (!result.needsPhoneNumber) {
        router.push(searchParams.get('redirect') || "/"); 
      }
    } else if (result?.error) {
      setError(result.error);
    } else {
      setError("Google Sign-In failed. Please try again.");
    }
    setIsLoading(false);
  };

  if (showCompleteGoogleSignup && googleEmailForPhone) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Welcome! To complete your Google Sign-In, please provide your phone number. This is required for your account.
            Email: <span className="font-medium">{googleEmailForPhone}</span>
          </p>
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="01XXXXXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Sign-Up
          </Button>
        </form>
      </Form>
    );
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {mode === 'register' && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {mode === 'register' ? (
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="01XXXXXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        
        {mode === 'login' && (
           <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{loginMethod === 'phone' ? 'Phone Number' : 'Email Address'}</FormLabel>
                <FormControl>
                  <Input 
                    type={loginMethod === 'phone' ? 'tel' : 'email'} 
                    placeholder={loginMethod === 'phone' ? '01XXXXXXXXX' : 'you@example.com'} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* This field is only for register mode now */}
        {mode === 'register' && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address <span className="text-xs text-muted-foreground">(Optional)</span></FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {mode !== 'completeGoogleSignup' && (
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}

        {mode === 'login' && (
          <Button 
            type="button" 
            variant="link" 
            className="p-0 h-auto text-sm text-muted-foreground hover:text-primary"
            onClick={() => setLoginMethod(prev => prev === 'phone' ? 'email' : 'phone')}
          >
            {loginMethod === 'phone' ? '(Login with email instead?)' : '(Login with phone instead?)'}
          </Button>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'login' ? 'Log In' : 'Create Account'}
        </Button>
      </form>
      
      {mode !== 'completeGoogleSignup' && (
        <>
            <Separator className="my-6" />
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4"/> } 
                Sign {mode === 'login' ? 'in' : 'up'} with Google
            </Button>
        </>
      )}
    </Form>
  );
}
