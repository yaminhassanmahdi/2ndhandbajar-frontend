
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
// import type { Brand } from '@/lib/types'; // Brand type might be removed or repurposed later
import { Tags, PlusCircle, Trash2, Edit3, Loader2, Info, ListFilter } from 'lucide-react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function AdminManageBrandsPage() {
  const [isLoading, setIsLoading] = useState(false); 
  const { toast } = useToast();

  if (isLoading) { 
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Tags className="h-8 w-8 text-primary"/>
          Legacy Global Brands (Deprecated)
        </h1>
      </div>
      
      <Alert variant="default">
        <Info className="h-5 w-5" />
        <AlertTitle>System Update: Attribute Management</AlertTitle>
        <CardDescription className="mt-1">
          The global "Brands" system has been replaced by category-specific attributes.
          You can now define attribute <span className="font-semibold">types</span> (like "Author", "Publisher", "Color", "Material") for each parent category.
          These attributes are then selected when adding or editing products under that category.
          <br /><br />
          Management of these category-specific attribute <span className="font-semibold">types</span> is available on the <Link href="/admin/products/attributes" className="underline text-primary hover:text-primary/80">Manage Attributes page</Link>.
          <br />
          Management of attribute <span className="font-semibold">values</span> (e.g., adding "Mr. Rahim" as an Author) will be available in a future update.
          <br /><br />
          This page previously managed global brands, which are no longer used for new product listings.
        </CardDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>About Legacy Global Brands</CardTitle>
          <CardDescription>
            This section is for reference only and will be removed or repurposed.
            All new product characterization should use the new category-specific attribute system.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">
            Please use the new category-specific attribute system when adding products.
           </p>
        </CardContent>
      </Card>
    </div>
  );
}

    