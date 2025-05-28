
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import type { HeroBannerSlide } from '@/lib/types';
import { DEFAULT_HERO_BANNER_SLIDES, HERO_BANNERS_STORAGE_KEY } from '@/lib/constants';
import { Loader2, PlusCircle, Edit3, Trash2, ImageIcon, ExternalLink, Palette, Info, Check, X } from 'lucide-react';
import Image from 'next/image';

const generateId = () => `slide-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function AdminBannersPage() {
  const { toast } = useToast();
  const [slides, setSlides] = useLocalStorage<HeroBannerSlide[]>(
    HERO_BANNERS_STORAGE_KEY,
    DEFAULT_HERO_BANNER_SLIDES // Use direct import
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<Partial<HeroBannerSlide> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const openDialog = (slide?: HeroBannerSlide) => {
    if (slide) {
      setCurrentSlide({ ...slide });
      setIsEditing(true);
    } else {
      setCurrentSlide({
        id: generateId(),
        imageUrl: 'https://placehold.co/1200x400.png',
        imageHint: 'banner image',
        title: '',
        description: '',
        buttonText: '',
        buttonLink: '',
        bgColor: 'bg-blue-600',
        textColor: 'text-white',
        isActive: true,
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!currentSlide) return;
    const { name, value } = e.target;
    setCurrentSlide(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
     if (!currentSlide) return;
    setCurrentSlide(prev => ({ ...prev, isActive: checked }));
  }

  const handleSubmit = async () => {
    if (!currentSlide || !currentSlide.title || !currentSlide.imageUrl) {
      toast({ title: "Error", description: "Title and Image URL are required.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isEditing && currentSlide.id) {
      setSlides(slides.map(s => s.id === currentSlide.id ? (currentSlide as HeroBannerSlide) : s));
      toast({ title: "Banner Updated", description: "The banner slide has been updated." });
    } else {
      setSlides([...slides, currentSlide as HeroBannerSlide]);
      toast({ title: "Banner Added", description: "New banner slide has been added." });
    }
    setFormSubmitting(false);
    setIsDialogOpen(false);
    setCurrentSlide(null);
  };

  const handleDelete = (slideId: string) => {
    if (window.confirm("Are you sure you want to delete this banner slide?")) {
      setSlides(slides.filter(s => s.id !== slideId));
      toast({ title: "Banner Deleted", description: "The banner slide has been deleted." });
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ImageIcon className="h-8 w-8 text-primary"/>
          Manage Banners (Sliders)
        </h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Banner
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Banner Slides</CardTitle>
          <CardDescription>Add, edit, or delete slides for your homepage hero banner. Active slides will be displayed.</CardDescription>
        </CardHeader>
        <CardContent>
          {slides.length === 0 ? (
            <p className="text-muted-foreground">No banner slides configured yet. Click "Add New Banner" to start.</p>
          ) : (
            <div className="space-y-4">
              {slides.map(slide => (
                <Card key={slide.id} className="flex flex-col md:flex-row items-start gap-4 p-4 shadow-sm hover:shadow-md">
                  <div className="w-full md:w-1/3 lg:w-1/4 aspect-[16/9] relative rounded-md overflow-hidden">
                    <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" data-ai-hint={slide.imageHint} />
                  </div>
                  <div className="flex-grow">
                    <CardTitle className="text-lg mb-1">{slide.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mb-2">{slide.description}</p>
                     <div className="flex items-center gap-2 text-xs mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${slide.bgColor} ${slide.textColor}`}>Theme Sample</span>
                        <span className="text-muted-foreground">Active:</span>
                        {slide.isActive ? <Check className="h-4 w-4 text-green-500"/> : <X className="h-4 w-4 text-red-500"/>}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 self-start md:self-center shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openDialog(slide)}>
                      <Edit3 className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(slide.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {currentSlide && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Add New"} Banner Slide</DialogTitle>
              <DialogDescription>Fill in the details for the banner slide.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title*</Label>
                <Input id="title" name="title" value={currentSlide.title || ''} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={currentSlide.description || ''} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">Image URL*</Label>
                <Input id="imageUrl" name="imageUrl" value={currentSlide.imageUrl || ''} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageHint" className="text-right">Image Hint</Label>
                <Input id="imageHint" name="imageHint" value={currentSlide.imageHint || ''} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="buttonText" className="text-right">Button Text</Label>
                <Input id="buttonText" name="buttonText" value={currentSlide.buttonText || ''} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="buttonLink" className="text-right">Button Link</Label>
                <Input id="buttonLink" name="buttonLink" value={currentSlide.buttonLink || ''} onChange={handleInputChange} className="col-span-3" placeholder="e.g., /products/category-name" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bgColor" className="text-right">Background Color</Label>
                <Input id="bgColor" name="bgColor" value={currentSlide.bgColor || 'bg-blue-600'} onChange={handleInputChange} className="col-span-3" placeholder="e.g., bg-blue-600 or #RRGGBB"/>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="textColor" className="text-right">Text Color</Label>
                <Input id="textColor" name="textColor" value={currentSlide.textColor || 'text-white'} onChange={handleInputChange} className="col-span-3" placeholder="e.g., text-white or #RRGGBB" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="isActive" className="text-right">Active</Label>
                 <Switch id="isActive" checked={currentSlide.isActive} onCheckedChange={handleSwitchChange} className="col-span-3"/>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
              <Button onClick={handleSubmit} disabled={formSubmitting}>
                {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Add Slide"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

  