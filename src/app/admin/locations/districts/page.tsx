
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_DIVISIONS, DEFAULT_DISTRICTS } from '@/lib/constants';
import type { Division, District } from '@/lib/types';
import { MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

export default function AdminDistrictsPage() {
  const divisions: Division[] = DEFAULT_DIVISIONS;
  const allDistricts: District[] = DEFAULT_DISTRICTS;

  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);

  useEffect(() => {
    if (selectedDivisionId) {
      setFilteredDistricts(allDistricts.filter(d => d.divisionId === selectedDivisionId));
    } else {
      setFilteredDistricts([]);
    }
  }, [selectedDivisionId, allDistricts]);

  const getDivisionName = (divisionId: string | undefined | null) => {
    if (!divisionId) return 'N/A';
    return divisions.find(d => d.id === divisionId)?.name || 'Unknown Division';
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MapPin className="h-8 w-8 text-primary"/>
          Administrative Districts
        </h1>
        {/* Add/Edit/Delete functionality removed */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Select Division to View Districts</CardTitle>
          <div className="mt-2">
            <Label htmlFor="division-select">Division</Label>
            <Select onValueChange={(value) => setSelectedDivisionId(value === 'none' ? null : value)} value={selectedDivisionId || 'none'}>
              <SelectTrigger id="division-select" className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Select Division --</SelectItem>
                {divisions.map(division => (
                  <SelectItem key={division.id} value={division.id}>{division.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CardDescription className="mt-2">
            View administrative districts within the selected division.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedDivisionId ? (
             <p className="text-muted-foreground">Please select a division to view its districts.</p>
          ) : filteredDistricts.length === 0 ? (
            <p className="text-muted-foreground">No districts configured for {getDivisionName(selectedDivisionId)} yet.</p>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">
              <ul className="p-4 space-y-2">
                {filteredDistricts.map(district => (
                  <li key={district.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                    <div>
                      <span className="font-medium">{district.name}</span>
                      <p className="text-xs text-muted-foreground">ID: {district.id} | Division: {getDivisionName(district.divisionId)}</p>
                    </div>
                     {/* Action buttons removed */}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
