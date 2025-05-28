
"use client";
import { useEffect, useState, useMemo } from 'react';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SUBCATEGORIES, MOCK_CATEGORY_ATTRIBUTE_TYPES, MOCK_CATEGORY_ATTRIBUTE_VALUES } from '@/lib/mock-data';
import type { Product, BusinessSettings, CategoryAttributeType, CategoryAttributeValue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ListChecks, PlusCircle, Search, Filter, Edit3, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';

type ProductStatus = Product['status'] | 'all';

export default function AdminManageProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  // Brand filter is removed as global brands are replaced by dynamic attributes

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = useMemo(() => settings.availableCurrencies.find(c => c.code === settings.defaultCurrencyCode) || settings.availableCurrencies[0] || { symbol: '?' }, [settings]);
  const currencySymbol = activeCurrency.symbol;

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const sortedProducts = [...MOCK_PRODUCTS].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
      setIsLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    let tempProducts = [...allProducts];
    if (searchTerm) {
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sellerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      tempProducts = tempProducts.filter(product => product.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      tempProducts = tempProducts.filter(product => product.categoryId === categoryFilter);
    }
    // Filtering by dynamic attributes in the table is complex and omitted for now.
    setFilteredProducts(tempProducts);
  }, [searchTerm, statusFilter, categoryFilter, allProducts]);

  const handleEditProduct = (productId: string) => {
    toast({ title: "Edit Product", description: `Functionality to edit product #${productId} is not yet implemented.` });
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product? This cannot be undone.")) {
      const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        MOCK_PRODUCTS.splice(productIndex, 1);
        setAllProducts([...MOCK_PRODUCTS]); 
        toast({ title: "Product Deleted", description: `Product ID ${productId} has been deleted.`, variant: "destructive" });
      }
    }
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ListChecks className="h-8 w-8 text-primary"/>
          Manage All Products
        </h1>
        <Button onClick={() => toast({ title: "Add Product", description: "Product creation via Admin Panel not implemented. Please use 'Sell Your Item' page."})}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      <div className="p-4 border rounded-lg bg-card shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="search-product" className="text-sm font-medium">Search</label>
          <Input 
            id="search-product"
            placeholder="ID, Name, Seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 mt-1"
          />
        </div>
        <div>
          <label htmlFor="filter-status" className="text-sm font-medium">Status</label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProductStatus)}>
            <SelectTrigger className="h-10 mt-1">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="filter-category" className="text-sm font-medium">Category</label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 mt-1">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {MOCK_CATEGORIES.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {/* Brand filter removed */}
      </div>

      {filteredProducts.length === 0 ? (
        <Alert>
          <Search className="h-5 w-5" />
          <AlertTitle>No Products Found</AlertTitle>
          <AlertDescription>
            No products match your current filters. Try adjusting your search or filter criteria.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="border rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name & ID</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub-Category</TableHead>
                {/* <TableHead>Brand</TableHead> Removed Brand column */}
                <TableHead>Attributes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Listed On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const categoryName = MOCK_CATEGORIES.find(c => c.id === product.categoryId)?.name || 'N/A';
                const subCategoryName = MOCK_SUBCATEGORIES.find(sc => sc.id === product.subCategoryId)?.name || 'N/A';
                
                const productAttributes = product.selectedAttributes?.map(attr => {
                  const type = MOCK_CATEGORY_ATTRIBUTE_TYPES.find(t => t.id === attr.attributeTypeId);
                  const value = MOCK_CATEGORY_ATTRIBUTE_VALUES.find(v => v.id === attr.attributeValueId);
                  return type && value ? `${type.name}: ${value.value}` : '';
                }).filter(Boolean).join(', ');

                return (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image src={product.imageUrl} alt={product.name} width={50} height={50} className="rounded aspect-square object-cover" data-ai-hint={product.imageHint || "product photo"} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {product.id}</div>
                  </TableCell>
                  <TableCell>{product.sellerName || product.sellerId}</TableCell>
                  <TableCell>{currencySymbol}{product.price.toFixed(2)}</TableCell>
                  <TableCell>{categoryName}</TableCell>
                  <TableCell>{subCategoryName}</TableCell>
                  {/* <TableCell>{brandName}</TableCell> Removed Brand cell */}
                  <TableCell className="text-xs max-w-[150px] truncate">{productAttributes || 'N/A'}</TableCell>
                  <TableCell><Badge variant={product.status === 'approved' ? 'default' : product.status === 'pending' ? 'secondary' : 'destructive'}>{product.status}</Badge></TableCell>
                  <TableCell>{format(new Date(product.createdAt), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product.id)} className="mr-1 hover:text-primary">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
