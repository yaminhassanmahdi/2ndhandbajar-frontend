
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Category, SubCategory, CategoryAttributeType, CategoryAttributeValue, BusinessSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filter, X } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';

interface ProductListFiltersProps {
  currentCategory?: Category;
  subCategoriesForCurrentCategory: SubCategory[];
  attributeTypesForCurrentCategory: CategoryAttributeType[];
  allAttributeValues: CategoryAttributeValue[];
  onApplyFilters?: () => void; // Optional: callback for when filters are applied, e.g., to close mobile sheet
}

export function ProductListFilters({
  currentCategory,
  subCategoriesForCurrentCategory,
  attributeTypesForCurrentCategory,
  allAttributeValues,
  onApplyFilters,
}: ProductListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings.availableCurrencies.find(c => c.code === settings.defaultCurrencyCode) || settings.availableCurrencies[0] || { symbol: '?' };
  const currencySymbol = activeCurrency.symbol;

  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<string[]>([]);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<Record<string, string[]>>({});
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    setSelectedSubCategoryIds(currentParams.getAll('subCategoryId') || []);
    
    const newAttributeValues: Record<string, string[]> = {};
    (attributeTypesForCurrentCategory || []).forEach(attrType => {
      newAttributeValues[attrType.id] = currentParams.getAll(attrType.id);
    });
    setSelectedAttributeValues(newAttributeValues);
    
    setMinPrice(currentParams.get('minPrice') || '');
    setMaxPrice(currentParams.get('maxPrice') || '');
    setInitialLoad(false);
  }, [searchParams, attributeTypesForCurrentCategory, currentCategory?.id]);


  const handleSubCategoryChange = (subCategoryId: string, checked: boolean) => {
    setSelectedSubCategoryIds(prev =>
      checked ? [...prev, subCategoryId] : prev.filter(id => id !== subCategoryId)
    );
  };

  const handleAttributeChange = (attributeTypeId: string, valueId: string, checked: boolean) => {
    setSelectedAttributeValues(prev => {
      const currentValuesForType = prev[attributeTypeId] || [];
      const newValuesForType = checked
        ? [...currentValuesForType, valueId]
        : currentValuesForType.filter(id => id !== valueId);
      
      if (newValuesForType.length === 0 && Object.keys(prev).includes(attributeTypeId)) {
        const { [attributeTypeId]: _, ...rest } = prev; // Remove key if no values selected for it
        return rest;
      }
      return { ...prev, [attributeTypeId]: newValuesForType };
    });
  };

  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams.toString()); // Preserve existing params like sortBy

    // Clear old filter params before setting new ones to avoid duplicates if some are removed
    newParams.delete('subCategoryId');
    attributeTypesForCurrentCategory.forEach(attrType => newParams.delete(attrType.id));
    newParams.delete('minPrice');
    newParams.delete('maxPrice');

    if (currentCategory) {
      newParams.set('categoryId', currentCategory.id); // Always keep current category
    }

    selectedSubCategoryIds.forEach(id => newParams.append('subCategoryId', id));

    Object.entries(selectedAttributeValues).forEach(([attrTypeId, valueIds]) => {
      valueIds.forEach(valId => newParams.append(attrTypeId, valId));
    });

    if (minPrice) newParams.set('minPrice', minPrice);
    if (maxPrice) newParams.set('maxPrice', maxPrice);
    
    router.push(`/browse?${newParams.toString()}`, { scroll: false });
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  const clearFilters = () => {
    setSelectedSubCategoryIds([]);
    setSelectedAttributeValues({});
    setMinPrice('');
    setMaxPrice('');
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('subCategoryId');
    attributeTypesForCurrentCategory.forEach(attrType => newParams.delete(attrType.id));
    newParams.delete('minPrice');
    newParams.delete('maxPrice');
    
    // Keep categoryId if it's set
    if (currentCategory) {
        newParams.set('categoryId', currentCategory.id);
    } else {
        newParams.delete('categoryId');
    }

    router.push(`/browse?${newParams.toString()}`, { scroll: false });
    if (onApplyFilters) {
        onApplyFilters();
      }
  };

  if (!currentCategory && !initialLoad) {
    return <div className="p-4 text-sm text-muted-foreground">Select a main category to see more filters.</div>;
  }
  if (initialLoad && !currentCategory) {
    return <div className="p-4 text-sm text-muted-foreground">Loading filters...</div>;
  }
  
  const defaultOpenAccordions = ['subcategories', 'price', ...(attributeTypesForCurrentCategory || []).map(at => at.id)];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between pb-3 border-b">
        <h3 className="text-lg font-semibold flex items-center">
          <Filter className="mr-2 h-4 w-4" /> Filters {currentCategory ? `for ${currentCategory.name}`: ""}
        </h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
          <X className="mr-1 h-3 w-3" /> Clear All
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-120px)] pr-2"> {/* Reduced height to account for apply button */}
        <Accordion type="multiple" defaultValue={defaultOpenAccordions} className="w-full">
          {subCategoriesForCurrentCategory.length > 0 && (
            <AccordionItem value="subcategories">
              <AccordionTrigger className="text-md font-medium">Sub-categories</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">
                {subCategoriesForCurrentCategory.map(subCat => (
                  <div key={subCat.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subcat-${subCat.id}`}
                      checked={selectedSubCategoryIds.includes(subCat.id)}
                      onCheckedChange={(checked) => handleSubCategoryChange(subCat.id, !!checked)}
                    />
                    <Label htmlFor={`subcat-${subCat.id}`} className="text-sm font-normal cursor-pointer">
                      {subCat.name}
                    </Label>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}

          {(attributeTypesForCurrentCategory || []).map(attrType => {
            const valuesForType = allAttributeValues.filter(val => val.attributeTypeId === attrType.id);
            if (valuesForType.length === 0) return null;
            return (
              <AccordionItem key={attrType.id} value={attrType.id}>
                <AccordionTrigger className="text-md font-medium">{attrType.name}</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                  {valuesForType.map(value => (
                    <div key={value.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`attr-${attrType.id}-${value.id}`}
                        checked={(selectedAttributeValues[attrType.id] || []).includes(value.id)}
                        onCheckedChange={(checked) => handleAttributeChange(attrType.id, value.id, !!checked)}
                      />
                      <Label htmlFor={`attr-${attrType.id}-${value.id}`} className="text-sm font-normal cursor-pointer">
                        {value.value}
                      </Label>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}

          <AccordionItem value="price">
            <AccordionTrigger className="text-md font-medium">Price Range</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-3">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={`Min (${currencySymbol})`}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-9 text-sm"
                  min="0"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder={`Max (${currencySymbol})`}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-9 text-sm"
                  min="0"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
      <div className="pt-4 border-t absolute bottom-0 left-0 right-0 p-4 bg-background md:static md:bg-transparent md:p-0">
        <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
      </div>
    </div>
  );
}
