
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import { CATEGORIES_STORAGE_KEY, INITIAL_CATEGORIES, CATEGORY_ATTRIBUTES_TYPES_STORAGE_KEY, INITIAL_CATEGORY_ATTRIBUTE_TYPES } from '@/lib/constants';
import type { Category, CategoryAttributeType } from '@/lib/types';
import { Loader2, PlusCircle, Trash2, ListFilter, Tag, Edit3 } from 'lucide-react';

const generateId = () => `attr_type-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function AdminManageAttributesPage() {
  const { toast } = useToast();
  const [parentCategories, setParentCategories] = useLocalStorage<Category[]>(
    CATEGORIES_STORAGE_KEY,
    INITIAL_CATEGORIES
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [attributeTypes, setAttributeTypes] = useLocalStorage<CategoryAttributeType[]>(
    CATEGORY_ATTRIBUTES_TYPES_STORAGE_KEY,
    INITIAL_CATEGORY_ATTRIBUTE_TYPES
  );

  const [filteredAttributeTypes, setFilteredAttributeTypes] = useState<CategoryAttributeType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAttributeType, setCurrentAttributeType] = useState<Partial<CategoryAttributeType>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (selectedCategoryId) {
      setFilteredAttributeTypes(attributeTypes.filter(attr => attr.categoryId === selectedCategoryId));
    } else {
      setFilteredAttributeTypes([]);
    }
  }, [selectedCategoryId, attributeTypes]);

  const openDialog = (attributeType?: CategoryAttributeType) => {
    if (attributeType) {
      setCurrentAttributeType({ ...attributeType });
      setIsEditing(true);
    } else {
      setCurrentAttributeType({ categoryId: selectedCategoryId || '', name: '' });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentAttributeType(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAttributeType = async () => {
    if (!currentAttributeType.name?.trim()) {
      toast({ title: "Error", description: "Attribute type name cannot be empty.", variant: "destructive" });
      return;
    }
    if (!currentAttributeType.categoryId) {
      toast({ title: "Error", description: "Parent category must be selected.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isEditing && currentAttributeType.id) {
      setAttributeTypes(prev => prev.map(attr => attr.id === currentAttributeType.id ? (currentAttributeType as CategoryAttributeType) : attr));
      toast({ title: "Attribute Type Updated", description: `"${currentAttributeType.name}" has been updated.` });
    } else {
      const newAttrType: CategoryAttributeType = {
        id: generateId(),
        categoryId: currentAttributeType.categoryId,
        name: currentAttributeType.name.trim(),
      };
      setAttributeTypes(prev => [...prev, newAttrType]);
      toast({ title: "Attribute Type Added", description: `"${newAttrType.name}" added to the category.` });
    }
    setIsDialogOpen(false);
    setCurrentAttributeType({});
    setFormSubmitting(false);
  };

  const handleDeleteAttributeType = (attrTypeId: string) => {
    if (window.confirm("Are you sure you want to delete this attribute type? This may affect attribute values and products using it.")) {
      setAttributeTypes(prev => prev.filter(attr => attr.id !== attrTypeId));
      toast({ title: "Attribute Type Deleted", description: "The attribute type has been deleted." });
    }
  };

  const selectedParentCategoryName = parentCategories.find(c => c.id === selectedCategoryId)?.name || "";

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ListFilter className="h-8 w-8 text-primary"/>
          Manage Attribute Types {selectedParentCategoryName && `for ${selectedParentCategoryName}`}
        </h1>
        <Button onClick={() => openDialog()} disabled={!selectedCategoryId}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Attribute Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Parent Category</CardTitle>
          <Select onValueChange={(value) => setSelectedCategoryId(value === 'none' ? null : value)} value={selectedCategoryId || 'none'}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- Select Parent Category --</SelectItem>
              {parentCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        {selectedCategoryId && (
          <CardContent>
            <CardTitle className="text-xl mt-4 mb-2">Attribute Types for "{selectedParentCategoryName}"</CardTitle>
            <CardDescription className="mb-4">Define characteristics products in this category can have (e.g., Author for Books, Color for Fashion).</CardDescription>
            {filteredAttributeTypes.length > 0 ? (
              <div className="space-y-3">
                {filteredAttributeTypes.map(attrType => (
                  <div key={attrType.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{attrType.name}</h3>
                        <p className="text-xs text-muted-foreground">ID: {attrType.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDialog(attrType)} className="hover:text-primary">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAttributeType(attrType.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No attribute types defined for "{selectedParentCategoryName}" yet. Add one to get started.</p>
            )}
          </CardContent>
        )}
         {!selectedCategoryId && (
            <CardContent>
                <p className="text-muted-foreground py-4">Please select a parent category to view or manage its attribute types.</p>
            </CardContent>
         )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Add New"} Attribute Type {selectedParentCategoryName && `to ${selectedParentCategoryName}`}</DialogTitle>
            <DialogDescription>Define a new characteristic for products in this category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="attribute-type-name">Attribute Type Name*</Label>
              <Input
                id="attribute-type-name"
                name="name"
                value={currentAttributeType.name || ''}
                onChange={handleInputChange}
                placeholder="e.g., Author, Screen Size"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
            <Button onClick={handleSaveAttributeType} disabled={formSubmitting || !currentAttributeType.name?.trim() || !selectedCategoryId}>
              {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
