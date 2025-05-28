
"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
import { MOCK_PRODUCTS } from '@/lib/mock-data'; // Reverted to MOCK_PRODUCTS
import type { Product, Category as CategoryType } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX, ArrowRight, Loader2 } from 'lucide-react'; 
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CategoryBar } from '@/components/category-bar';
import { HeroBanner } from '@/components/hero-banner';
import { useSearchParams } from 'next/navigation';
import useLocalStorage from '@/hooks/use-local-storage';
import { CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES } from '@/lib/constants';
import { MOCK_SUBCATEGORIES } from '@/lib/mock-data'; // Kept for title generation


const PRODUCTS_PER_CATEGORY_HOME = 4;

interface ProductGroup {
  category: CategoryType;
  products: Product[];
  titleOverride?: string;
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const selectedCategoryIdFromUrl = searchParams.get('category');
  const selectedSubCategoryIdFromUrl = searchParams.get('subcategory');

  const [loading, setLoading] = useState(true); 
  const [categoriesToDisplay, setCategoriesToDisplay] = useState<CategoryType[]>([]);

  const [storedCategories] = useLocalStorage<CategoryType[]>(
    CATEGORIES_STORAGE_KEY,
    INITIAL_CATEGORIES
  );

  useEffect(() => {
    setLoading(true);
    // Process categories from localStorage
    const currentCategories = Array.isArray(storedCategories) && storedCategories.length > 0 ? storedCategories : INITIAL_CATEGORIES;
    const sorted = [...currentCategories].sort((a, b) => 
      (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name)
    );
    setCategoriesToDisplay(sorted);
    setLoading(false); // Set loading to false after categories are processed
  }, [storedCategories]);

  const productsByCategory: ProductGroup[] = useMemo(() => {
    // Directly use MOCK_PRODUCTS, filtered for approved and in-stock
    let baseProducts = MOCK_PRODUCTS.filter(p => p.status === 'approved' && p.stock > 0); 

    if (selectedCategoryIdFromUrl) {
      const category = categoriesToDisplay.find(c => c.id === selectedCategoryIdFromUrl);
      if (!category) return [];

      let filteredProducts = baseProducts.filter(p => p.categoryId === selectedCategoryIdFromUrl);
      let title = `Products in ${category.name}`;

      if (selectedSubCategoryIdFromUrl) {
        const subCategory = MOCK_SUBCATEGORIES.find(sc => sc.id === selectedSubCategoryIdFromUrl);
        filteredProducts = filteredProducts.filter(p => p.subCategoryId === selectedSubCategoryIdFromUrl);
        title = `${subCategory ? subCategory.name : 'Selected Subcategory'} in ${category.name}`;
      }

      return [{
        category,
        products: filteredProducts,
        titleOverride: title
      }];
    }

    // Default view on homepage: Group products by category
    return categoriesToDisplay.map(category => ({
      category,
      products: baseProducts
        .filter(product => product.categoryId === category.id)
        .slice(0, PRODUCTS_PER_CATEGORY_HOME),
    })).filter(group => group.products.length > 0);
  }, [selectedCategoryIdFromUrl, selectedSubCategoryIdFromUrl, categoriesToDisplay]);

  if (loading) {
    return (
      <div>
        {(!selectedCategoryIdFromUrl && !selectedSubCategoryIdFromUrl) && (
          <>
            <CategoryBar />
            <HeroBanner />
          </>
        )}
        <div className="container mx-auto px-4 mt-6 md:mt-8">
          {[1, 2, 3].map(categoryKey => ( 
            <div key={categoryKey} className="mb-12">
              <Skeleton className="h-8 w-1/2 md:w-1/4 mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(PRODUCTS_PER_CATEGORY_HOME)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {(!selectedCategoryIdFromUrl && !selectedSubCategoryIdFromUrl) && (
        <>
          <CategoryBar />
          <HeroBanner />
        </>
      )}

      <div className="container mx-auto px-4 mt-6 md:mt-8">
        {productsByCategory.length > 0 ? (
          productsByCategory.map((group) => (
            <section key={group.category.id} className="mb-10 md:mb-12">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold">
                  {group.titleOverride || (selectedCategoryIdFromUrl ? `Products in ${group.category.name}` : `Latest in ${group.category.name}`)}
                </h2>
                {!selectedCategoryIdFromUrl && MOCK_PRODUCTS.filter(p => p.categoryId === group.category.id && p.status === 'approved' && p.stock > 0).length > PRODUCTS_PER_CATEGORY_HOME && (
                   <Button variant="outline" asChild>
                    <Link href={`/category/${group.category.id}`}>
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
              {group.products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {group.products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                 <Alert variant="default">
                    <SearchX className="h-5 w-5" />
                    <AlertTitle>No Products Yet</AlertTitle>
                    <AlertDescription>
                      There are currently no products listed for {group.titleOverride || group.category.name}. Check back soon!
                    </AlertDescription>
                  </Alert>
              )}
            </section>
          ))
        ) : (
          <div className="py-12 text-center">
             <Alert variant="default" className="col-span-full max-w-lg mx-auto">
                <SearchX className="h-5 w-5" />
                <AlertTitle>No Products Found</AlertTitle>
                <AlertDescription>
                  We couldn't find any products matching your criteria. Try exploring different categories or check back later!
                </AlertDescription>
             </Alert>
          </div>
        )}
      </div>
    </div>
  );
}


const ProductCardSkeleton = () => (
  <div className="flex flex-col overflow-hidden rounded-lg border shadow-lg">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="p-3 flex-grow">
      <Skeleton className="h-5 w-3/4 mb-1" />
      <Skeleton className="h-7 w-1/3" />
    </div>
    <div className="p-3 border-t mt-auto">
      <Skeleton className="h-9 w-full" />
    </div>
  </div>
);
