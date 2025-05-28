
"use client";
import type { SubCategory } from '@/lib/types';
import Image from 'next/image';
import { Tag } from 'lucide-react';
import Link from 'next/link'; // Import Link

interface SubCategoryScrollerProps {
  subCategories: SubCategory[];
  parentCategoryId: string;
  // onSubCategorySelect prop is removed as navigation is handled by Link
}

export function SubCategoryScroller({ subCategories, parentCategoryId }: SubCategoryScrollerProps) {
  if (!subCategories || subCategories.length === 0) {
    return null;
  }

  return (
    <div className="py-4 bg-background">
      <div className="container mx-auto px-0 sm:px-4">
        <div className="flex items-start gap-3 sm:gap-4 overflow-x-auto scrollbar-hide py-3 px-4 sm:px-0">
          {/* "All" option for the parent category */}
          <Link
            href={`/browse?categoryId=${parentCategoryId}`}
            className="flex flex-col items-center justify-start group w-20 min-w-[80px] text-center"
            aria-label={`View all products in this category`}
          >
            <div className="relative w-16 h-16 mb-1.5 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all duration-200 ease-in-out flex items-center justify-center bg-muted">
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 break-words">
              All
            </span>
          </Link>

          {subCategories.map((subCategory) => (
            <Link
              key={subCategory.id}
              href={`/browse?categoryId=${parentCategoryId}&subCategoryId=${subCategory.id}`}
              className="flex flex-col items-center justify-start group w-20 min-w-[80px] text-center"
              aria-label={`View products in ${subCategory.name}`}
            >
              <div className="relative w-16 h-16 mb-1.5 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all duration-200 ease-in-out">
                {subCategory.imageUrl ? (
                  <Image
                    src={subCategory.imageUrl}
                    alt={subCategory.name}
                    fill
                    sizes="64px"
                    className="object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                    data-ai-hint={subCategory.imageHint || subCategory.name.toLowerCase().split(" ")[0] || "subcategory"}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted rounded-full">
                    <Tag className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 break-words">
                {subCategory.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
