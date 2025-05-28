
"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Category, CommissionSetting } from '@/lib/types';
import { MOCK_CATEGORIES } from '@/lib/mock-data'; // Parent categories
import { COMMISSION_SETTINGS_STORAGE_KEY, DEFAULT_COMMISSION_SETTINGS } from '@/lib/constants';
import { Loader2, Save, Percent } from 'lucide-react';

export default function AdminCommissionsPage() {
  const { toast } = useToast();
  const [commissionSettings, setCommissionSettings] = useLocalStorage<CommissionSetting[]>(
    COMMISSION_SETTINGS_STORAGE_KEY,
    DEFAULT_COMMISSION_SETTINGS
  );
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({}); // Store percentages as strings for input
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize localSettings from stored commissionSettings
    const initialLocalSettings: Record<string, string> = {};
    MOCK_CATEGORIES.forEach(category => {
      const setting = commissionSettings.find(cs => cs.categoryId === category.id);
      initialLocalSettings[category.id] = setting ? String(setting.percentage) : '0';
    });
    setLocalSettings(initialLocalSettings);
  }, [commissionSettings]);

  const handlePercentageChange = (categoryId: string, value: string) => {
    // Allow empty string for typing, validate on save
    const numericValue = parseFloat(value);
    if (value === '' || (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100)) {
      setLocalSettings(prev => ({ ...prev, [categoryId]: value }));
    } else if (value !== '' && isNaN(numericValue)){
      // if not a number and not empty, keep previous valid value or 0
      setLocalSettings(prev => ({ ...prev, [categoryId]: prev[categoryId] || '0'}));
    }
  };

  const handleSaveCommissions = () => {
    setIsLoading(true);
    const newCommissionSettings: CommissionSetting[] = [];
    let isValid = true;

    for (const categoryId in localSettings) {
      const percentageStr = localSettings[categoryId];
      if (percentageStr === '' || percentageStr === undefined) { // Treat empty as 0
        newCommissionSettings.push({ categoryId, percentage: 0 });
        continue;
      }
      const percentage = parseFloat(percentageStr);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        toast({
          title: "Invalid Input",
          description: `Commission for ${MOCK_CATEGORIES.find(c=>c.id === categoryId)?.name || categoryId} must be between 0 and 100.`,
          variant: "destructive",
        });
        isValid = false;
        break;
      }
      newCommissionSettings.push({ categoryId, percentage });
    }

    if (isValid) {
      setCommissionSettings(newCommissionSettings);
      toast({
        title: "Commissions Updated",
        description: "Category commission settings have been saved.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Percent className="h-8 w-8 text-primary" />
        Manage Platform Commissions
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Set Commission Percentages per Category</CardTitle>
          <CardDescription>
            Define the commission percentage the platform earns from sales in each parent category.
            The commission is applied to the product's selling price. Enter values between 0 and 100.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {MOCK_CATEGORIES.map(category => (
            <div key={category.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-4 border rounded-lg">
              <Label htmlFor={`commission-${category.id}`} className="text-md font-medium md:col-span-1">
                {category.name}
              </Label>
              <div className="flex items-center gap-2 md:col-span-2">
                <Input
                  id={`commission-${category.id}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={localSettings[category.id] || '0'}
                  onChange={(e) => handlePercentageChange(category.id, e.target.value)}
                  placeholder="e.g., 10"
                  className="w-full md:w-40"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
          ))}
          <Button onClick={handleSaveCommissions} disabled={isLoading} className="mt-6 w-full md:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save All Commissions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
