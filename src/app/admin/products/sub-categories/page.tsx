
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import type { Category, SubCategory } from '@/lib/types';
import { FolderTree, PlusCircle, Trash2, Edit3, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import useLocalStorage from '@/hooks/use-local-storage';
import {
  CATEGORIES_STORAGE_KEY,
  INITIAL_CATEGORIES,
  SUB_CATEGORIES_STORAGE_KEY,
  INITIAL_SUB_CATEGORIES
} from '@/lib/constants';

const generateId = () => `subcat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function AdminManageSubCategoriesPage() {
  const [parentCategories, setParentCategories] = useLocalStorage<Category[]>(
    CATEGORIES_STORAGE_KEY,
    INITIAL_CATEGORIES
  );
  const [subCategories, setSubCategories] = useLocalStorage<SubCategory[]>(
    SUB_CATEGORIES_STORAGE_KEY,
    INITIAL_SUB_CATEGORIES
  );

  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<string | null>(null);
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);

  const [isLoading, setIsLoading] = useState(false); // General loading, not specific to initial data fetch
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState<Partial<SubCategory>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedParentCategoryId) {
      setFilteredSubCategories(subCategories.filter(sc => sc.parentCategoryId === selectedParentCategoryId));
    } else {
      setFilteredSubCategories([]);
    }
  }, [selectedParentCategoryId, subCategories]);

  const openDialog = (subCategory?: SubCategory) => {
    if (subCategory) {
      setCurrentSubCategory({ ...subCategory });
      setIsEditing(true);
    } else {
      setCurrentSubCategory({
        parentCategoryId: selectedParentCategoryId || '',
        name: '',
        imageUrl: 'https://placehold.co/80x80.png',
        imageHint: ''
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSubCategory(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSubCategory = async () => {
    if (!currentSubCategory.name?.trim()) {
      toast({ title: "Error", description: "Sub-category name cannot be empty.", variant: "destructive" });
      return;
    }
    if (!currentSubCategory.parentCategoryId) {
      toast({ title: "Error", description: "Parent category must be selected.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isEditing && currentSubCategory.id) {
      setSubCategories(prev => prev.map(sc => sc.id === currentSubCategory.id ? (currentSubCategory as SubCategory) : sc));
      toast({ title: "Sub-Category Updated", description: `Sub-category "${currentSubCategory.name}" has been updated.` });
    } else {
      const newSubCategory: SubCategory = {
        id: generateId(),
        name: currentSubCategory.name.trim(),
        parentCategoryId: currentSubCategory.parentCategoryId,
        imageUrl: currentSubCategory.imageUrl?.trim() || 'https://placehold.co/80x80.png',
        imageHint: currentSubCategory.imageHint?.trim() || currentSubCategory.name.toLowerCase(),
      };
      setSubCategories(prev => [...prev, newSubCategory]);
      toast({ title: "Sub-Category Added", description: `Sub-category "${newSubCategory.name}" has been added.` });
    }
    setIsDialogOpen(false);
    setCurrentSubCategory({});
    setFormSubmitting(false);
  };

  const handleDeleteSubCategory = (subCategoryId: string) => {
    if (window.confirm("Are you sure you want to delete this sub-category?")) {
      setSubCategories(prev => prev.filter(sc => sc.id !== subCategoryId));
      toast({ title: "Sub-Category Deleted", description: "The sub-category has been deleted." });
    }
  };

  const selectedParentCategoryName = parentCategories.find(c => c.id === selectedParentCategoryId)?.name || "";

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FolderTree className="h-8 w-8 text-primary"/>
          Manage Sub-Categories {selectedParentCategoryName && `for ${selectedParentCategoryName}`}
        </h1>
        <Button onClick={() => openDialog()} disabled={!selectedParentCategoryId}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Sub-Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Parent Category</CardTitle>
          <Select onValueChange={(value) => setSelectedParentCategoryId(value === 'none' ? null : value)} value={selectedParentCategoryId || 'none'}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a parent category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- Select Parent Category --</SelectItem>
              {parentCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        {selectedParentCategoryId && (
          <CardContent>
            <CardTitle className="text-xl mt-4 mb-2">Sub-Categories for {selectedParentCategoryName}</CardTitle>
            {filteredSubCategories.length > 0 ? (
              <div className="space-y-3">
                {filteredSubCategories.map(subCategory => (
                  <div key={subCategory.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                       {subCategory.imageUrl ? (
                        <Image src={subCategory.imageUrl} alt={subCategory.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={subCategory.imageHint || subCategory.name.toLowerCase()} />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      )}
                      <div>
                          <h3 className="font-semibold">{subCategory.name}</h3>
                          <p className="text-xs text-muted-foreground">ID: {subCategory.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDialog(subCategory)} className="hover:text-primary">
                        <Edit3 className="h-4 w-4"/>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteSubCategory(subCategory.id)}>
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No sub-categories found for "{selectedParentCategoryName}". Add a new one to get started.</p>
            )}
          </CardContent>
        )}
         {!selectedParentCategoryId && (
            <CardContent>
                <p className="text-muted-foreground py-4">Please select a parent category to view or manage its sub-categories.</p>
            </CardContent>
         )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Add New"} Sub-Category {selectedParentCategoryName && `under ${selectedParentCategoryName}`}</DialogTitle>
            <DialogDescription>Enter the details for the sub-category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subcategory-name">Name*</Label>
              <Input
                id="subcategory-name"
                name="name"
                value={currentSubCategory.name || ''}
                onChange={handleInputChange}
                placeholder="e.g., Smartphones"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-image-url">Image URL</Label>
              <Input
                id="subcategory-image-url"
                name="imageUrl"
                value={currentSubCategory.imageUrl || ''}
                onChange={handleInputChange}
                placeholder="https://placehold.co/80x80.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-image-hint">Image Hint (for AI)</Label>
              <Input
                id="subcategory-image-hint"
                name="imageHint"
                value={currentSubCategory.imageHint || ''}
                onChange={handleInputChange}
                placeholder="e.g., mobile phones"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
            <Button onClick={handleSaveSubCategory} disabled={formSubmitting || !currentSubCategory.name?.trim() || !selectedParentCategoryId}>
                {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Add Sub-Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
