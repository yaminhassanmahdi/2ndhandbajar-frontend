
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import type { CustomPage } from '@/lib/types';
import { MOCK_CUSTOM_PAGES as DEFAULT_PAGES, CUSTOM_PAGES_STORAGE_KEY } from '@/lib/constants';
import { Loader2, PlusCircle, Edit3, Trash2, FileType, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link'; // Import Link for viewing pages

const generateId = () => `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function AdminCustomPagesPage() {
  const { toast } = useToast();
  const [pages, setPages] = useLocalStorage<CustomPage[]>(
    CUSTOM_PAGES_STORAGE_KEY,
    DEFAULT_PAGES
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Partial<CustomPage> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const openDialog = (page?: CustomPage) => {
    if (page) {
      setCurrentPage({ ...page });
      setIsEditing(true);
    } else {
      setCurrentPage({
        id: generateId(),
        slug: '',
        title: '',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!currentPage) return;
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'slug') {
      processedValue = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    setCurrentPage(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async () => {
    if (!currentPage || !currentPage.title || !currentPage.slug || !currentPage.content) {
      toast({ title: "Error", description: "Title, Slug, and Content are required.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const pageData: CustomPage = {
        ...(currentPage as CustomPage),
        updatedAt: new Date(),
    };

    if (isEditing && currentPage.id) {
      setPages(pages.map(p => p.id === currentPage.id ? pageData : p));
      toast({ title: "Page Updated", description: "The custom page has been updated." });
    } else {
      pageData.createdAt = new Date(); // Ensure createdAt is set for new pages
      setPages([...pages, pageData]);
      toast({ title: "Page Created", description: "New custom page has been created." });
    }
    setFormSubmitting(false);
    setIsDialogOpen(false);
    setCurrentPage(null);
  };

  const handleDelete = (pageId: string) => {
    if (window.confirm("Are you sure you want to delete this custom page?")) {
      setPages(pages.filter(p => p.id !== pageId));
      toast({ title: "Page Deleted", description: "The custom page has been deleted." });
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileType className="h-8 w-8 text-primary"/>
          Manage Custom Pages
        </h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Page
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Custom Page List</CardTitle>
          <CardDescription>Create, edit, or delete custom pages like Privacy Policy, Terms, About Us, etc. (Actual page rendering at /slug is a future step).</CardDescription>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <p className="text-muted-foreground">No custom pages created yet.</p>
          ) : (
            <div className="space-y-3">
              {pages.map(page => (
                <Card key={page.id} className="p-4 shadow-sm hover:shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">{page.title}</h3>
                      <p className="text-xs text-muted-foreground">Slug: /{page.slug}</p>
                      <p className="text-xs text-muted-foreground">Last updated: {format(new Date(page.updatedAt), 'PPpp')}</p>
                    </div>
                    <div className="flex gap-2 self-start sm:self-center">
                      {/* Placeholder for View Page link - In a real app, this would link to /page.slug */}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`#view-page-${page.slug}`} title="View page (not implemented)">
                           <ExternalLink className="mr-2 h-4 w-4" /> View (Mock)
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDialog(page)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(page.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {currentPage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Create New"} Custom Page</DialogTitle>
              <DialogDescription>Fill in the details for your custom page.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title*</Label>
                <Input id="title" name="title" value={currentPage.title || ''} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">Slug*</Label>
                <Input id="slug" name="slug" value={currentPage.slug || ''} onChange={handleInputChange} className="col-span-3" placeholder="e.g., privacy-policy" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">Content*</Label>
                <Textarea id="content" name="content" value={currentPage.content || ''} onChange={handleInputChange} className="col-span-3 min-h-[200px]" placeholder="Enter page content (Markdown or HTML)..." />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
              <Button onClick={handleSubmit} disabled={formSubmitting}>
                {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Page"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
