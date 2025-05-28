
"use client";
import Link from 'next/link';
import { MOCK_CATEGORIES } from '@/lib/mock-data';
import Image from 'next/image';
import { Tag } from 'lucide-react';
import type { Category } from '@/lib/types';
import { useEffect, useState } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES } from '@/lib/constants';


export function CategoryBar() {
  const [storedCategories] = useLocalStorage<Category[]>(CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES);
  const [sortedCategories, setSortedCategories] = useState<Category[]>([]);

  useEffect(() => {
    const categoriesToDisplay = Array.isArray(storedCategories) && storedCategories.length > 0 ? storedCategories : INITIAL_CATEGORIES;
    const sorted = [...categoriesToDisplay].sort((a, b) => 
      (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name)
    );
    setSortedCategories(sorted);
  }, [storedCategories]);


  return (
    <div className="bg-background shadow-sm">
      <div className="container mx-auto px-0 sm:px-4">
        <div className="flex items-start gap-3 sm:gap-4 overflow-x-auto scrollbar-hide py-3 px-4 sm:px-0">
          {sortedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`} 
              className="flex flex-col items-center justify-start group w-20 min-w-[80px] text-center"
            >
              <div className="relative w-16 h-16 mb-1.5 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all duration-200 ease-in-out">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="64px"
                    className="object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                    data-ai-hint={category.imageHint || category.name.toLowerCase().split(" ")[0] || "category"}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted rounded-full">
                    <Tag className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 break-words">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

