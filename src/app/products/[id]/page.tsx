
"use client";
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
    MOCK_PRODUCTS,
    MOCK_CATEGORIES,
    MOCK_SUBCATEGORIES,
    MOCK_CATEGORY_ATTRIBUTE_TYPES,
    MOCK_CATEGORY_ATTRIBUTE_VALUES
} from '@/lib/mock-data';
import type { Product, BusinessSettings, CategoryAttributeType, CategoryAttributeValue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/cart-context';
import { ArrowLeft, ShoppingCart, UserCircle, CalendarDays, Tag, Layers, Info, PackageCheck } from 'lucide-react';
import { QuantitySelector } from '@/components/quantity-selector';
import React, { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';
import { Alert, AlertTitle } from '@/components/ui/alert';

interface DisplayAttribute {
  typeName: string;
  valueName: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cartItems, addToCart, updateQuantity } = useCart(); // Added cartItems and updateQuantity
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  const [categoryName, setCategoryName] = useState<string>('');
  const [subCategoryName, setSubCategoryName] = useState<string | null>(null);
  const [displayAttributes, setDisplayAttributes] = useState<DisplayAttribute[]>([]);

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = useMemo(() => settings.availableCurrencies.find(c => c.code === settings.defaultCurrencyCode) || settings.availableCurrencies[0] || { symbol: '?' }, [settings]);
  const currencySymbol = activeCurrency.symbol;

  useEffect(() => {
    if (params.id) {
      setTimeout(() => {
        const foundProduct = MOCK_PRODUCTS.find(p => p.id === params.id);
        setProduct(foundProduct || null);
        if (foundProduct) {
          setCategoryName(MOCK_CATEGORIES.find(c => c.id === foundProduct.categoryId)?.name || 'N/A');
          if (foundProduct.subCategoryId) {
            setSubCategoryName(MOCK_SUBCATEGORIES.find(sc => sc.id === foundProduct.subCategoryId)?.name || 'N/A');
          } else {
            setSubCategoryName(null);
          }

          const attributes: DisplayAttribute[] = [];
          if (foundProduct.selectedAttributes) {
            foundProduct.selectedAttributes.forEach(attr => {
              const attrType = MOCK_CATEGORY_ATTRIBUTE_TYPES.find(t => t.id === attr.attributeTypeId);
              const attrValue = MOCK_CATEGORY_ATTRIBUTE_VALUES.find(v => v.id === attr.attributeValueId);
              if (attrType && attrValue) {
                attributes.push({ typeName: attrType.name, valueName: attrValue.value });
              }
            });
          }
          setDisplayAttributes(attributes);
        }
      }, 300);
    }
  }, [params.id]);

  const cartItem = cartItems.find(item => item.id === product?.id);
  const currentQuantityInCart = cartItem ? cartItem.quantity : 0;

  if (product === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="p-6">
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/4 mb-4" />
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3 mb-6" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock > 0) {
        if (currentQuantityInCart > 0) {
            updateQuantity(product.id, currentQuantityInCart + quantity);
        } else {
            addToCart({ ...product, stock: product.stock }, quantity); // Pass stock with product
        }
        setQuantity(1); // Reset local quantity selector
    }
  };

  const isSoldOut = product.stock <= 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card className="overflow-hidden shadow-xl rounded-xl">
        <div className="grid md:grid-cols-2 gap-0 items-start">
          <div className="aspect-square relative w-full overflow-hidden md:rounded-l-xl">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              data-ai-hint={product.imageHint || "product item"}
            />
          </div>
          <div className="p-6 md:p-8 flex flex-col h-full">
            <CardHeader className="p-0 mb-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                    <Layers className="h-3 w-3" /> {categoryName}
                </Badge>
                {subCategoryName && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {subCategoryName}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-3xl font-bold">{product.name}</CardTitle>
            </CardHeader>

            <CardContent className="p-0 flex-grow">
              <CardDescription className="text-base text-foreground/80 mb-4">
                {product.description}
              </CardDescription>

              {displayAttributes.length > 0 && (
                <div className="mb-4 space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Specifications:</h4>
                  {displayAttributes.map(attr => (
                    <div key={attr.typeName} className="flex items-center text-sm">
                      <span className="text-muted-foreground w-24 shrink-0">{attr.typeName}:</span>
                      <span className="font-medium">{attr.valueName}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <UserCircle className="h-4 w-4" />
                <span>Sold by: {product.sellerName || 'Unknown Seller'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <CalendarDays className="h-4 w-4" />
                <span>Listed on: {format(new Date(product.createdAt), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <PackageCheck className="h-4 w-4" />
                <span>Stock: {isSoldOut ? <span className="text-destructive font-semibold">Sold Out</span> : `${product.stock} available`}</span>
              </div>


              <p className="text-4xl font-extrabold text-primary mb-6">
                {currencySymbol}{product.price.toFixed(2)}
              </p>
            </CardContent>

            <CardFooter className="p-0 mt-auto">
              {isSoldOut ? (
                <Alert variant="destructive" className="w-full">
                  <AlertTitle className="text-center font-semibold">Sold Out</AlertTitle>
                  <CardDescription className="text-center">This item is currently unavailable.</CardDescription>
                </Alert>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <QuantitySelector quantity={quantity} setQuantity={setQuantity} maxQuantity={product.stock} />
                  <Button size="lg" onClick={handleAddToCart} className="w-full sm:w-auto flex-grow">
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </Button>
                </div>
              )}
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
