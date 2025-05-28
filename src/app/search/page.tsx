
"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, SearchX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card'; // For skeleton

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (query) {
      // Simulate API call delay
      setTimeout(() => {
        const lowerCaseQuery = query.toLowerCase();
        const results = MOCK_PRODUCTS.filter(product =>
          product.status === 'approved' &&
          product.stock > 0 && ( // Filter for in-stock
            product.name.toLowerCase().includes(lowerCaseQuery) ||
            product.description.toLowerCase().includes(lowerCaseQuery) ||
            product.id.toLowerCase().includes(lowerCaseQuery)
          )
        ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setFilteredProducts(results);
        setIsLoading(false);
      }, 500);
    } else {
      setFilteredProducts([]);
      setIsLoading(false);
    }
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      {query ? (
        <h1 className="text-3xl font-bold mb-8">
          Search Results for: <span className="text-primary">&quot;{query}&quot;</span>
        </h1>
      ) : (
        <Alert variant="default" className="max-w-md mx-auto">
          <Search className="h-5 w-5" />
          <AlertTitle>Start Searching</AlertTitle>
          <AlertDescription>
            Please enter a search term in the bar above to find products.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && query && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="flex flex-col overflow-hidden rounded-lg">
              <Skeleton className="aspect-[4/3] w-full" />
              <CardContent className="p-3 flex-grow">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-7 w-1/3" />
              </CardContent>
              <CardFooter className="p-3 border-t">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && query && filteredProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!isLoading && query && filteredProducts.length === 0 && (
        <Alert variant="default" className="max-w-lg mx-auto">
          <SearchX className="h-5 w-5" />
          <AlertTitle>No Products Found</AlertTitle>
          <AlertDescription>
            We couldn&apos;t find any products matching your search for &quot;{query}&quot;. Try a different term or browse our categories.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
