
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ClientLayout } from '@/components/client-layout';
// Note: Dynamically setting favicon from localStorage in RootLayout metadata is not straightforward
// as metadata is typically resolved on the server.
// The admin panel will store the favicon URL, but applying it live requires a different approach
// (e.g., a client component in <head> or a server-side mechanism if favicon needs to be dynamic per request).
// For this mock, the default /favicon.ico will be used.

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '2ndhandbajar.com - Your Online Marketplace', // This can be made dynamic if appName changes
  description: 'Buy and sell second-hand goods with ease.',
  icons: {
    icon: '/favicon.ico', // Default favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
