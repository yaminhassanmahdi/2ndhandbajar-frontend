
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Category, FeaturedImage } from '@/lib/types';
import { FolderTree, PlusCircle, Trash2, Edit3, Loader2, Image as ImageIcon, ArrowUpDown } from 'lucide-react';
import Image from 'next/image';
import useLocalStorage from '@/hooks/use-local-storage';
import { CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';

const generateId = () => `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
const generateFeaturedImageId = (index: number) => `feat-img-${index + 1}`;

const MAX_FEATURED_IMAGES = 4;

export default function AdminManageCategoriesPage() {
  const [categories, setCategories] = useLocalStorage<Category[]>(
    CATEGORIES_STORAGE_KEY,
    INITIAL_CATEGORIES
  );
  const [isLoading, setIsLoading] = useState(false); // General loading, not initial data fetch
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // No specific loading effect for categories as useLocalStorage handles initial state
  }, []);

  const openDialog = (category?: Category) => {
    if (category) {
      // Ensure featuredImages is an array of up to 4, padding with defaults if necessary
      const currentFeatured = Array.isArray(category.featuredImages) ? category.featuredImages : [];
      const featuredImages = Array.from({ length: MAX_FEATURED_IMAGES }).map((_, i) => ({
        id: generateFeaturedImageId(i),
        imageUrl: currentFeatured[i]?.imageUrl || `https://placehold.co/300x300.png`,
        imageHint: currentFeatured[i]?.imageHint || '',
        linkUrl: currentFeatured[i]?.linkUrl || '',
        title: currentFeatured[i]?.title || '',
      }));
      setCurrentCategory({ ...category, featuredImages });
      setIsEditing(true);
    } else {
      const featuredImages = Array.from({ length: MAX_FEATURED_IMAGES }).map((_, i) => ({
        id: generateFeaturedImageId(i),
        imageUrl: 'https://placehold.co/300x300.png',
        imageHint: '',
        linkUrl: '',
        title: '',
      }));
      setCurrentCategory({
        name: '',
        imageUrl: 'https://placehold.co/80x80.png',
        imageHint: '',
        sortOrder: (categories.length + 1) * 10,
        featuredImages,
        categorySlides: []
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setCurrentCategory(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }));
  };

  const handleFeaturedImageChange = (index: number, field: keyof FeaturedImage, value: string) => {
    setCurrentCategory(prev => {
      if (!prev || !Array.isArray(prev.featuredImages)) return prev;
      const updatedFeaturedImages = [...prev.featuredImages];
      if (updatedFeaturedImages[index]) {
        // @ts-ignore
        updatedFeaturedImages[index][field] = value;
      }
      return { ...prev, featuredImages: updatedFeaturedImages };
    });
  };

  const handleSaveCategory = async () => {
    if (!currentCategory.name?.trim()) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filter out featured images that don't have a real imageUrl (are still placeholders) unless a title or link is set
    const finalFeaturedImages = currentCategory.featuredImages?.filter(
      img => (img.imageUrl && img.imageUrl !== 'https://placehold.co/300x300.png') || img.linkUrl || img.title
    ).map(img => ({ // Ensure all fields are present even if empty, id is from mapping
        id: img.id || generateFeaturedImageId(0), // Should have ID from initialization
        imageUrl: img.imageUrl || 'https://placehold.co/300x300.png',
        imageHint: img.imageHint || '',
        linkUrl: img.linkUrl || '',
        title: img.title || ''
    })) || [];


    const categoryDataToSave: Category = {
      id: currentCategory.id || generateId(),
      name: currentCategory.name.trim(),
      imageUrl: currentCategory.imageUrl?.trim() || 'https://placehold.co/80x80.png',
      imageHint: currentCategory.imageHint?.trim() || currentCategory.name.toLowerCase(),
      sortOrder: currentCategory.sortOrder === undefined ? (categories.length + 1) * 10 : currentCategory.sortOrder,
      featuredImages: finalFeaturedImages,
      categorySlides: currentCategory.categorySlides || [], // Persist existing or empty
    };

    if (isEditing && currentCategory.id) {
      setCategories(prev => prev.map(cat => cat.id === categoryDataToSave.id ? categoryDataToSave : cat)
                                .sort((a,b) => (a.sortOrder || 999) - (b.sortOrder || 999) || a.name.localeCompare(b.name)));
      toast({ title: "Category Updated", description: `Category "${categoryDataToSave.name}" has been updated.` });
    } else {
      setCategories(prev => [...prev, categoryDataToSave]
                                .sort((a,b) => (a.sortOrder || 999) - (b.sortOrder || 999) || a.name.localeCompare(b.name)));
      toast({ title: "Category Added", description: `Category "${categoryDataToSave.name}" has been added.` });
    }
    setIsDialogOpen(false);
    setCurrentCategory({});
    setFormSubmitting(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category? This may affect sub-categories and products.")) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast({ title: "Category Deleted", description: "The category has been deleted." });
    }
  };
  
  const sortedCategories = [...categories].sort((a,b) => (a.sortOrder || 999) - (b.sortOrder || 999) || a.name.localeCompare(b.name));

  if (isLoading) { // Though not strictly used for initial load from localStorage here
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
          <FolderTree className="h-8 w-8 text-primary"/>
          Manage Parent Categories
        </h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>View, add, edit, or delete parent product categories. Lower sort order appears first.</CardDescription>
        </CardHeader>
        <CardContent>
           {sortedCategories.length > 0 ? (
            <div className="space-y-3">
              {sortedCategories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    {category.imageUrl ? (
                      <Image src={category.imageUrl} alt={category.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={category.imageHint || category.name.toLowerCase()} />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                    <div>
                      <h3 className="font-semibold">{category.name} <span className="text-xs text-muted-foreground">(SO: {category.sortOrder === undefined ? 'N/A' : category.sortOrder})</span></h3>
                      <p className="text-xs text-muted-foreground">ID: {category.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(category)} className="hover:text-primary">
                        <Edit3 className="h-4 w-4"/>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No parent categories found. Add a new category to get started.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Add New"} Parent Category</DialogTitle>
            <DialogDescription>Enter the details for the parent category.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1"> {/* Added ScrollArea here */}
            <div className="grid gap-4 py-4 pr-4"> {/* Added pr-4 for scrollbar space */}
              <div className="space-y-2">
                <Label htmlFor="category-name">Name*</Label>
                <Input id="category-name" name="name" value={currentCategory.name || ''} onChange={handleInputChange} placeholder="e.g., Electronics"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-image-url">Image URL (for category icon)</Label>
                <Input id="category-image-url" name="imageUrl" value={currentCategory.imageUrl || ''} onChange={handleInputChange} placeholder="https://placehold.co/80x80.png"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-image-hint">Image Hint (for AI)</Label>
                <Input id="category-image-hint" name="imageHint" value={currentCategory.imageHint || ''} onChange={handleInputChange} placeholder="e.g., electronics gadget"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-sort-order">Sort Order</Label>
                <Input id="category-sort-order" name="sortOrder" type="number" value={currentCategory.sortOrder === undefined ? '' : currentCategory.sortOrder} onChange={handleInputChange} placeholder="e.g., 10 (lower is first)"/>
              </div>

              <h3 className="text-lg font-semibold mt-6 mb-2 border-t pt-4">Featured Images (Grid of 4 on Category Page)</h3>
              {currentCategory.featuredImages?.map((img, index) => (
                <Card key={img.id || index} className="p-4 space-y-3">
                   <Label className="text-sm font-medium">Featured Image {index + 1}</Label>
                  <div className="space-y-1">
                    <Label htmlFor={`feat-img-url-${index}`} className="text-xs">Image URL</Label>
                    <Input id={`feat-img-url-${index}`} value={img.imageUrl} onChange={(e) => handleFeaturedImageChange(index, 'imageUrl', e.target.value)} placeholder="https://placehold.co/300x300.png"/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`feat-img-hint-${index}`} className="text-xs">Image Hint</Label>
                    <Input id={`feat-img-hint-${index}`} value={img.imageHint} onChange={(e) => handleFeaturedImageChange(index, 'imageHint', e.target.value)} placeholder="e.g., style fashion"/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`feat-img-link-${index}`} className="text-xs">Link URL (Optional)</Label>
                    <Input id={`feat-img-link-${index}`} value={img.linkUrl || ''} onChange={(e) => handleFeaturedImageChange(index, 'linkUrl', e.target.value)} placeholder="/browse?some_filter=value"/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`feat-img-title-${index}`} className="text-xs">Title (Optional)</Label>
                    <Input id={`feat-img-title-${index}`} value={img.title || ''} onChange={(e) => handleFeaturedImageChange(index, 'title', e.target.value)} placeholder="e.g., Summer Collection"/>
                  </div>
                </Card>
              ))}
              
              <div className="mt-4 border-t pt-4">
                <Label className="text-muted-foreground">Category Specific Slides: Management for these will be added in a future update.</Label>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
            <Button onClick={handleSaveCategory} disabled={formSubmitting || !currentCategory.name?.trim()}>
              {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
