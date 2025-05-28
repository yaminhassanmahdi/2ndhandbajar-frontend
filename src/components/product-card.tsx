
"use client";
import Image from 'next/image';
import Link from 'next/link';
import type { Product, BusinessSettings, Currency } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Minus, Plus, EyeOff } from 'lucide-react'; // Added EyeOff
import { useCart } from '@/contexts/cart-context';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';
import { Badge } from './ui/badge'; // Added Badge

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [settings] = useLocalStorage<BusinessSettings>(
    BUSINESS_SETTINGS_STORAGE_KEY,
    DEFAULT_BUSINESS_SETTINGS
  );

  const safeAvailableCurrencies: Currency[] = settings?.availableCurrencies && Array.isArray(settings.availableCurrencies) && settings.availableCurrencies.length > 0
    ? settings.availableCurrencies
    : DEFAULT_BUSINESS_SETTINGS.availableCurrencies;

  const safeDefaultCurrencyCode: string = settings?.defaultCurrencyCode
    ? settings.defaultCurrencyCode
    : DEFAULT_BUSINESS_SETTINGS.defaultCurrencyCode;

  const activeCurrency: Currency =
    safeAvailableCurrencies.find(c => c.code === safeDefaultCurrencyCode) ||
    safeAvailableCurrencies[0] ||
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' };

  const currencySymbol = activeCurrency.symbol;

  const cartItem = cartItems.find(item => item.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  const isSoldOut = product.stock <= 0;

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link href={`/products/${product.id}`} className="block group relative">
        <CardHeader className="p-0">
          <div className="aspect-[4/3] relative w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.imageHint || "product image"}
            />
             {isSoldOut && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive" className="text-sm px-3 py-1">SOLD OUT</Badge>
              </div>
            )}
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-3 mt-auto"> {/* Added mt-auto */}
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="text-md font-semibold hover:text-primary transition-colors line-clamp-2 mb-1">
            {product.name}
          </CardTitle>
        </Link>
        <p className="text-lg font-bold text-primary">
          {currencySymbol}{product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-3 border-t">
        <div className="flex w-full items-center">
          {isSoldOut ? (
            <Button size="sm" disabled className="w-full h-9 bg-muted text-muted-foreground hover:bg-muted">
              <EyeOff className="mr-2 h-4 w-4" /> Sold Out
            </Button>
          ) : currentQuantity === 0 ? (
            <Button size="sm" onClick={() => addToCart({...product, stock: product.stock}, 1)} className="w-full h-9">
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                className="h-9 w-9"
                aria-label="Decrease quantity"
                disabled={currentQuantity <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-base font-medium tabular-nums mx-2">
                {currentQuantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(product.id, currentQuantity + 1)}
                className="h-9 w-9"
                aria-label="Increase quantity"
                disabled={currentQuantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
