
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import type { ShippingMethod } from '@/lib/types';
import { DEFAULT_SHIPPING_METHODS, SHIPPING_METHODS_STORAGE_KEY } from '@/lib/constants';
import { Loader2, PlusCircle, Trash2, Ship } from 'lucide-react';

const generateId = () => `sm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export default function AdminShippingMethodsPage() {
  const { toast } = useToast();
  const [shippingMethods, setShippingMethods] = useLocalStorage<ShippingMethod[]>(
    SHIPPING_METHODS_STORAGE_KEY,
    DEFAULT_SHIPPING_METHODS
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const handleAddMethod = async () => {
    if (!newMethodName.trim()) {
      toast({ title: "Error", description: "Shipping method name cannot be empty.", variant: "destructive" });
      return;
    }
    setFormSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newMethod: ShippingMethod = {
      id: generateId(),
      name: newMethodName.trim(),
    };
    setShippingMethods([...shippingMethods, newMethod]);
    toast({ title: "Shipping Method Added", description: `"${newMethod.name}" has been added.` });
    setNewMethodName('');
    setIsDialogOpen(false);
    setFormSubmitting(false);
  };

  const handleDeleteMethod = (methodId: string) => {
    if (window.confirm("Are you sure you want to delete this shipping method?")) {
      setShippingMethods(shippingMethods.filter(m => m.id !== methodId));
      toast({ title: "Shipping Method Deleted", description: "The shipping method has been deleted." });
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Ship className="h-8 w-8 text-primary"/>
          Manage Shipping Methods
        </h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Method
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Shipping Methods</CardTitle>
          <CardDescription>Add, edit, or delete shipping methods available to customers at checkout.</CardDescription>
        </CardHeader>
        <CardContent>
          {shippingMethods.length === 0 ? (
            <p className="text-muted-foreground">No shipping methods configured yet. Click "Add New Method" to start.</p>
          ) : (
            <div className="space-y-3">
              {shippingMethods.map(method => (
                <Card key={method.id} className="flex items-center justify-between p-3 shadow-sm hover:shadow-md">
                  <div>
                    <h3 className="font-semibold">{method.name}</h3>
                    <p className="text-xs text-muted-foreground">ID: {method.id}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteMethod(method.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Shipping Method</DialogTitle>
            <DialogDescription>Enter the name for the new shipping method.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="method-name">Method Name</Label>
              <Input 
                id="method-name" 
                value={newMethodName}
                onChange={(e) => setNewMethodName(e.target.value)}
                placeholder="e.g., Express Shipping"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={formSubmitting}>Cancel</Button></DialogClose>
            <Button onClick={handleAddMethod} disabled={formSubmitting || !newMethodName.trim()}>
              {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
