
"use client";
import React, { useState } from 'react';
import { CATEGORIES, BRANDS } from '@/lib/constants';
import type { FilterValues } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

interface ProductFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
}

export function ProductFilters({ onFilterChange, initialFilters = {} }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FilterValues) => (value: string) => {
    setFilters(prev => ({ ...prev, [name]: value === 'all' ? undefined : value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="searchTerm">Search</Label>
            <Input
              id="searchTerm"
              name="searchTerm"
              placeholder="Search by name or description..."
              value={filters.searchTerm || ''}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select name="category" value={filters.category || 'all'} onValueChange={handleSelectChange('category')}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="brand">Brand</Label>
            <Select name="brand" value={filters.brand || 'all'} onValueChange={handleSelectChange('brand')}>
              <SelectTrigger id="brand">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {BRANDS.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPrice">Min Price</Label>
              <Input
                id="minPrice"
                name="minPrice"
                type="number"
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Max Price</Label>
              <Input
                id="maxPrice"
                name="maxPrice"
                type="number"
                placeholder="Any"
                value={filters.maxPrice || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

           <div>
            <Label htmlFor="sortBy">Sort By</Label>
            <Select name="sortBy" value={filters.sortBy || 'date_newest'} onValueChange={handleSelectChange('sortBy')}>
              <SelectTrigger id="sortBy">
                <SelectValue placeholder="Sort products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_newest">Newest First</SelectItem>
                <SelectItem value="date_oldest">Oldest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <div className="flex gap-2 pt-2">
            <Button type="submit" className="w-full">
              <Filter className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} className="w-full">
              <X className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
