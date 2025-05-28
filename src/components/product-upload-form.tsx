
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    MOCK_PRODUCTS,
    MOCK_CATEGORIES,
    MOCK_SUBCATEGORIES,
    MOCK_CATEGORY_ATTRIBUTE_TYPES,
    MOCK_CATEGORY_ATTRIBUTE_VALUES
} from "@/lib/mock-data";
import type { Product, Category, SubCategory, BusinessSettings, CategoryAttributeType, CategoryAttributeValue } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import useLocalStorage from '@/hooks/use-local-storage';
import {
  BUSINESS_SETTINGS_STORAGE_KEY,
  DEFAULT_BUSINESS_SETTINGS,
  CATEGORY_ATTRIBUTES_TYPES_STORAGE_KEY,
  CATEGORY_ATTRIBUTE_VALUES_STORAGE_KEY
} from '@/lib/constants';

const VALUE_FOR_NO_SUBCATEGORY_SELECTED = "__NONE__";

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters.").max(1000),
  price: z.coerce.number().min(0.01, "Price must be a positive number."),
  stock: z.coerce.number().min(0, "Stock quantity cannot be negative.").default(0),
  categoryId: z.string().min(1, "Please select a parent category."),
  subCategoryId: z.string().optional(),
  dynamicAttributes: z.record(z.string().optional()),
});

type ProductFormData = z.infer<typeof productSchema>;


export function ProductUploadForm() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);

  const [categoryAttributeTypes] = useLocalStorage<CategoryAttributeType[]>(
    CATEGORY_ATTRIBUTES_TYPES_STORAGE_KEY,
    MOCK_CATEGORY_ATTRIBUTE_TYPES
  );
  const [allAttributeValues] = useLocalStorage<CategoryAttributeValue[]>(
    CATEGORY_ATTRIBUTE_VALUES_STORAGE_KEY,
    MOCK_CATEGORY_ATTRIBUTE_VALUES
  );

  const [currentAttributeFields, setCurrentAttributeFields] = useState<CategoryAttributeType[]>([]);


  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings.availableCurrencies.find(c => c.code === settings.defaultCurrencyCode) || settings.availableCurrencies[0] || { symbol: '?' };

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 1,
      categoryId: "",
      subCategoryId: VALUE_FOR_NO_SUBCATEGORY_SELECTED,
      dynamicAttributes: {},
    },
  });

  useEffect(() => {
    setParentCategories([...MOCK_CATEGORIES]);
    setSubCategories([...MOCK_SUBCATEGORIES]);
  }, []);

  const watchedCategoryId = form.watch("categoryId");

  useEffect(() => {
    if (watchedCategoryId) {
      const filteredSubs = subCategories.filter(sc => sc.parentCategoryId === watchedCategoryId);
      setAvailableSubCategories(filteredSubs);
      const currentSubCategoryId = form.getValues("subCategoryId");
      if (currentSubCategoryId && currentSubCategoryId !== VALUE_FOR_NO_SUBCATEGORY_SELECTED && !filteredSubs.some(sc => sc.id === currentSubCategoryId)) {
        form.setValue("subCategoryId", VALUE_FOR_NO_SUBCATEGORY_SELECTED);
      }

      const relevantAttrTypes = categoryAttributeTypes.filter(attrType => attrType.categoryId === watchedCategoryId);
      setCurrentAttributeFields(relevantAttrTypes);

      const newDynamicAttributes: Record<string, string | undefined> = {};
      relevantAttrTypes.forEach(attrType => {
        newDynamicAttributes[attrType.id] = undefined;
      });
      form.setValue("dynamicAttributes", newDynamicAttributes);

    } else {
      setAvailableSubCategories([]);
      form.setValue("subCategoryId", VALUE_FOR_NO_SUBCATEGORY_SELECTED);
      setCurrentAttributeFields([]);
      form.setValue("dynamicAttributes", {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCategoryId, subCategories, categoryAttributeTypes, form.setValue, form.getValues]);


  async function onSubmit(values: ProductFormData) {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to sell a product.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const selectedAttrs: Array<{ attributeTypeId: string; attributeValueId: string; }> = [];
    if (values.dynamicAttributes) {
        for (const typeId in values.dynamicAttributes) {
            const valueId = values.dynamicAttributes[typeId];
            if (valueId && valueId !== "") {
                selectedAttrs.push({ attributeTypeId: typeId, attributeValueId: valueId });
            }
        }
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: values.name,
      description: values.description,
      price: values.price,
      stock: values.stock,
      imageUrl: `https://placehold.co/600x400.png`,
      imageHint: `${values.name.substring(0,15)} product`,
      categoryId: values.categoryId,
      subCategoryId: values.subCategoryId === VALUE_FOR_NO_SUBCATEGORY_SELECTED ? undefined : values.subCategoryId,
      selectedAttributes: selectedAttrs,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      status: 'pending',
      createdAt: new Date(),
    };

    MOCK_PRODUCTS.push(newProduct);

    toast({
      title: "Product Submitted!",
      description: `${newProduct.name} has been submitted for approval.`,
    });
    setIsLoading(false);
    form.reset();
    setAvailableSubCategories([]);
    setCurrentAttributeFields([]);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Vintage Leather Jacket" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your product in detail..." rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ({activeCurrency.code})</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="29.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>


        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parentCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub-Category (Optional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === VALUE_FOR_NO_SUBCATEGORY_SELECTED ? VALUE_FOR_NO_SUBCATEGORY_SELECTED : value)}
                value={field.value || VALUE_FOR_NO_SUBCATEGORY_SELECTED}
                disabled={!watchedCategoryId || availableSubCategories.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={!watchedCategoryId ? "Select parent category first" : "Select a sub-category (optional)"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={VALUE_FOR_NO_SUBCATEGORY_SELECTED}>-- No Sub-Category --</SelectItem>
                  {availableSubCategories.map(subCat => (
                    <SelectItem key={subCat.id} value={subCat.id}>{subCat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {currentAttributeFields.map(attrType => {
          const relevantValues = allAttributeValues
            .filter(val => val.attributeTypeId === attrType.id && val.id && val.id.trim() !== "");
          return (
            <FormField
              key={attrType.id}
              control={form.control}
              name={`dynamicAttributes.${attrType.id}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{attrType.name}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={relevantValues.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${attrType.name}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relevantValues.map(val => (
                        <SelectItem key={val.id} value={val.id}>{val.value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}

        <FormItem>
            <FormLabel>Product Image</FormLabel>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        <p className="text-xs text-blue-500 mt-1">(Image upload is mocked for this demo)</p>
                    </div>
                    <Input id="dropzone-file" type="file" className="hidden" disabled />
                </label>
            </div>
            <FormDescription>
                Upload an image of your product. For this demo, a placeholder will be used.
            </FormDescription>
        </FormItem>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Product for Approval
        </Button>
      </form>
    </Form>
  );
}
