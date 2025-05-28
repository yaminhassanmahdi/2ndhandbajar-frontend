
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, PlusCircle, Edit3, Trash2, SearchX, Layers, Tag } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

export default function MyProductsPage() {
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/account/my-products');
        return;
      }
      if (currentUser) {
        const products = MOCK_PRODUCTS
          .filter(p => p.sellerId === currentUser.id)
          .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserProducts(products);
        setPageLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, router, currentUser]);

  const handleEditProduct = (productId: string) => {
    toast({ title: "Edit Product", description: `Edit functionality for product #${productId} is not implemented in this mock.` });
    // In a real app, you might navigate to an edit page:
    // router.push(`/sell/edit/${productId}`);
  };

  const handleDeleteProduct = (productId: string) => {
    const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      MOCK_PRODUCTS.splice(productIndex, 1); // Mutate the global mock data
      setUserProducts(prev => prev.filter(p => p.id !== productId)); // Update local state
      toast({ title: "Product Deleted", description: `Product ID ${productId} has been deleted.`, variant: "destructive" });
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          My Listed Products
        </h1>
        <Button asChild>
          <Link href="/sell">
            <PlusCircle className="mr-2 h-4 w-4" /> List New Product
          </Link>
        </Button>
      </div>

      {userProducts.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <SearchX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle>No Products Listed</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>You haven't listed any products yet. Click the button above to sell your first item!</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProducts.map(product => (
            <Card key={product.id} className="flex flex-col overflow-hidden shadow-lg">
              <div className="aspect-[4/3] relative w-full overflow-hidden">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  data-ai-hint={product.imageHint || "product image"}
                />
              </div>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-lg font-semibold line-clamp-2">{product.name}</CardTitle>
                <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">ID: {product.id}</Badge>
                    <Badge 
                        variant={
                            product.status === 'approved' ? 'default' : 
                            product.status === 'pending' ? 'secondary' :
                            product.status === 'sold' ? 'outline' : // Use a distinct style for 'sold'
                            'destructive' // for 'rejected'
                        } 
                        className="capitalize text-xs"
                    >
                        {product.status}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 flex-grow">
                <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Listed on: {format(new Date(product.createdAt), 'dd MMM, yyyy')}
                </p>
              </CardContent>
              <CardFooter className="px-4 py-3 border-t flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditProduct(product.id)} className="flex-1">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex-1">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your product listing for "{product.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
