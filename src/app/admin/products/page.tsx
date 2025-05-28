
"use client";
import { useEffect, useState } from 'react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { ProductApprovalCard } from '@/components/admin/product-approval-card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckSquare, Loader2, SearchX } from 'lucide-react';

export default function AdminProductsPage() {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingProductId, setProcessingProductId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching products
    setIsLoading(true);
    setTimeout(() => {
      setPendingProducts(MOCK_PRODUCTS.filter(p => p.status === 'pending')
                                    .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      setIsLoading(false);
    }, 500);
  }, []);

  const handleApprove = async (productId: string) => {
    setProcessingProductId(productId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));
    const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      MOCK_PRODUCTS[productIndex].status = 'approved';
    }
    setPendingProducts(prev => prev.filter(p => p.id !== productId));
    toast({ title: "Product Approved", description: `Product ID ${productId} has been approved.` });
    setProcessingProductId(null);
  };

  const handleReject = async (productId: string) => {
    setProcessingProductId(productId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));
    const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === productId);
     if (productIndex !== -1) {
      MOCK_PRODUCTS[productIndex].status = 'rejected';
    }
    setPendingProducts(prev => prev.filter(p => p.id !== productId));
    toast({ title: "Product Rejected", description: `Product ID ${productId} has been rejected.`, variant: "destructive" });
    setProcessingProductId(null);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <CheckSquare className="h-8 w-8 text-primary"/>
        Product Approval Queue
      </h1>
      {pendingProducts.length === 0 ? (
        <Alert>
          <SearchX className="h-5 w-5" />
          <AlertTitle>Queue Clear!</AlertTitle>
          <AlertDescription>There are no products currently pending approval.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingProducts.map(product => (
            <ProductApprovalCard 
              key={product.id} 
              product={product} 
              onApprove={handleApprove} 
              onReject={handleReject}
              isProcessing={processingProductId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
