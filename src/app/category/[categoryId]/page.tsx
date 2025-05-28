
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SUBCATEGORIES } from '@/lib/mock-data';
import type { Product, Category as CategoryType, SubCategory, BusinessSettings, HeroBannerSlide, FeaturedImage } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { HeroBanner } from '@/components/hero-banner';
import { SubCategoryScroller } from '@/components/sub-category-scroller';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRight, SearchX, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS, CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES, SUB_CATEGORIES_STORAGE_KEY, INITIAL_SUB_CATEGORIES, HERO_BANNERS_STORAGE_KEY, DEFAULT_HERO_BANNER_SLIDES } from '@/lib/constants';

const PRODUCTS_PER_SUB_CATEGORY_ROW = 4;

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;

  const [allCategories] = useLocalStorage<CategoryType[]>(CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES);
  const [allSubCategories] = useLocalStorage<SubCategory[]>(SUB_CATEGORIES_STORAGE_KEY, INITIAL_SUB_CATEGORIES);
  const [globalSlides] = useLocalStorage<HeroBannerSlide[]>(HERO_BANNERS_STORAGE_KEY, DEFAULT_HERO_BANNER_SLIDES);


  const [category, setCategory] = useState<CategoryType | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  
  const activeCurrency = useMemo(() => {
    const safeAvailableCurrencies = settings?.availableCurrencies && Array.isArray(settings.availableCurrencies) && settings.availableCurrencies.length > 0
      ? settings.availableCurrencies
      : DEFAULT_BUSINESS_SETTINGS.availableCurrencies;
    const safeDefaultCurrencyCode = settings?.defaultCurrencyCode || DEFAULT_BUSINESS_SETTINGS.defaultCurrencyCode;
    return safeAvailableCurrencies.find(c => c.code === safeDefaultCurrencyCode) || safeAvailableCurrencies[0] || { symbol: '?' };
  }, [settings]);
  const currencySymbol = activeCurrency.symbol;

  useEffect(() => {
    setIsLoading(true);
    if (categoryId) {
      setTimeout(() => {
        const foundCategory = allCategories.find(c => c.id === categoryId);
        if (!foundCategory) {
          router.push('/'); 
          return;
        }
        setCategory(foundCategory);

        const relatedSubCategories = allSubCategories.filter(sc => sc.parentCategoryId === categoryId);
        setSubCategories(relatedSubCategories);

        const categoryProducts = MOCK_PRODUCTS.filter(p => p.categoryId === categoryId && p.status === 'approved' && p.stock > 0);
        setProducts(categoryProducts);
        setIsLoading(false);
      }, 300); 
    }
  }, [categoryId, router, allCategories, allSubCategories]);

  const categorySlidesToDisplay = useMemo(() => {
    if (category && category.categorySlides && category.categorySlides.filter(s => s.isActive).length > 0) {
      return category.categorySlides.filter(s => s.isActive);
    }
    return globalSlides.filter(s => s.isActive);
  }, [category, globalSlides]);

  if (isLoading) {
    return (
      <div className="py-2">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-1/3 my-6" />
        </div>
        <Skeleton className="h-32 w-full mb-8" /> {/* Placeholder for SubCategoryScroller */}
        <Skeleton className="h-64 w-full mb-8" /> {/* Placeholder for HeroBanner */}
        <div className="container mx-auto px-4">
           <Skeleton className="h-8 w-1/4 my-6 md:my-12 text-center" />
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center mb-8">
             {[...Array(4)].map((_,j) => <Skeleton key={j} className="aspect-square w-full max-w-[200px] md:max-w-[250px] rounded-lg"/>)}
           </div>
          {[1, 2].map(i => (
            <div key={i} className="mb-12">
              <Skeleton className="h-8 w-1/4 mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(PRODUCTS_PER_SUB_CATEGORY_ROW)].map((_, j) => <ProductCardSkeleton key={j} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive">
          <SearchX className="h-5 w-5" />
          <AlertTitle>Category Not Found</AlertTitle>
          <AlertDescription>The category you are looking for does not exist.</AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  const productsBySubCategory = (subCatId: string) => {
    return products.filter(p => p.subCategoryId === subCatId && p.stock > 0).slice(0, PRODUCTS_PER_SUB_CATEGORY_ROW);
  };
  
  const validFeaturedImages = category.featuredImages?.filter(
      img => img.imageUrl && img.imageUrl !== 'https://placehold.co/300x300.png'
  ) || [];

  return (
    <div className="py-2">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold my-6 text-center">{category.name}</h1>
      </div>

      {subCategories.length > 0 && (
        <SubCategoryScroller 
            subCategories={subCategories} 
            parentCategoryId={category.id}
        />
      )}

      <HeroBanner slides={categorySlidesToDisplay.length > 0 ? categorySlidesToDisplay : undefined} />


      {validFeaturedImages.length > 0 && (
        <section className="my-8 md:my-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">
              {validFeaturedImages.some(img => img.title) ? "Featured Styles" : "Shop by Style"} {/* Or a more generic title */}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
              {validFeaturedImages.map((img, i) => ( 
                <Link key={img.id || i} href={img.linkUrl || '#'} className="group block w-full">
                  <div className="aspect-square w-full max-w-[200px] md:max-w-[250px] bg-muted rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <Image src={img.imageUrl} alt={img.title || `Featured Style ${i + 1}`} width={300} height={300} className="object-cover w-full h-full group-hover:scale-105 transition-transform" data-ai-hint={img.imageHint || "style fashion"} />
                  </div>
                  {img.title && <p className="mt-2 text-sm font-medium text-center group-hover:text-primary">{img.title}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}


      {subCategories.map(subCat => (
        <section key={subCat.id} id={`subcategory-products-${subCat.id}`} className="mb-10 md:mb-12 pt-6 -mt-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold">
                {subCat.name}
              </h2>
              {products.filter(p => p.subCategoryId === subCat.id && p.stock > 0).length > PRODUCTS_PER_SUB_CATEGORY_ROW && (
                <Button variant="outline" asChild>
                  <Link href={`/browse?categoryId=${category.id}&subCategoryId=${subCat.id}`}>
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
            {productsBySubCategory(subCat.id).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {productsBySubCategory(subCat.id).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
               <Alert variant="default" className="mt-4">
                  <SearchX className="h-5 w-5" />
                  <AlertTitle>No Products Yet</AlertTitle>
                  <AlertDescription>
                    There are currently no products listed for {subCat.name}. Check back soon!
                  </AlertDescription>
                </Alert>
            )}
          </div>
        </section>
      ))}

      {subCategories.length === 0 && products.length > 0 && (
        <section className="mb-10 md:mb-12 pt-6 -mt-6">
          <div className="container mx-auto px-4">
             <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold">
                  All Products in {category.name}
                </h2>
              </div>
             <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
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
