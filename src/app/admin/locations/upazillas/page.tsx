
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { DEFAULT_DIVISIONS, DEFAULT_DISTRICTS, DEFAULT_UPAZILLAS } from '@/lib/constants';
import type { Division, District, Thana as Upazilla } from '@/lib/types';
import { Home as HomeIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminUpazillasPage() {
  const divisions: Division[] = DEFAULT_DIVISIONS;
  const allDistricts: District[] = DEFAULT_DISTRICTS;
  const allUpazillas: Upazilla[] = DEFAULT_UPAZILLAS;

  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [filteredUpazillas, setFilteredUpazillas] = useState<Upazilla[]>([]);

  useEffect(() => {
    if (selectedDivisionId) {
      setAvailableDistricts(allDistricts.filter(d => d.divisionId === selectedDivisionId));
      setSelectedDistrictId(null); 
      setFilteredUpazillas([]);
    } else {
      setAvailableDistricts([]);
      setSelectedDistrictId(null);
      setFilteredUpazillas([]);
    }
  }, [selectedDivisionId, allDistricts]);

  useEffect(() => {
    if (selectedDistrictId) {
      setFilteredUpazillas(allUpazillas.filter(t => t.districtId === selectedDistrictId));
    } else {
      setFilteredUpazillas([]);
    }
  }, [selectedDistrictId, allUpazillas]);
  
  const getDivisionName = (divisionId: string | null) => {
    if (!divisionId) return '';
    return divisions.find(d => d.id === divisionId)?.name || 'Unknown Division';
  };
  const getDistrictName = (districtId: string | undefined | null) => {
    if (!districtId) return 'N/A';
    return allDistricts.find(d => d.id === districtId)?.name || 'Unknown District';
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HomeIcon className="h-8 w-8 text-primary"/>
          Administrative Upazillas
        </h1>
      </div>
      
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Select Division and District</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="division-select">Division</Label>
              <Select onValueChange={(value) => setSelectedDivisionId(value === 'none' ? null : value)} value={selectedDivisionId || 'none'}>
                <SelectTrigger id="division-select">
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
            <div className="space-y-1">
              <Label htmlFor="district-select">District</Label>
              <Select 
                onValueChange={(value) => setSelectedDistrictId(value === 'none' ? null : value)} 
                value={selectedDistrictId || 'none'}
                disabled={!selectedDivisionId || availableDistricts.length === 0}
              >
                <SelectTrigger id="district-select">
                  <SelectValue placeholder={!selectedDivisionId ? "Select division first" : (availableDistricts.length === 0 ? "No districts available" : "Select a district")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Select District --</SelectItem>
                  {availableDistricts.map(district => (
                    <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription className="mt-2">
            View administrative Upazillas within the selected district.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedDistrictId ? (
             <p className="text-muted-foreground">Please select a division and district to view Upazillas.</p>
          ) : filteredUpazillas.length === 0 ? (
            <p className="text-muted-foreground">No Upazillas configured for {getDistrictName(selectedDistrictId)} yet.</p>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">
              <ul className="p-4 space-y-2">
                {filteredUpazillas.map(upazilla => (
                  <li key={upazilla.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                     <div>
                      <span className="font-medium">{upazilla.name}</span>
                      <p className="text-xs text-muted-foreground">ID: {upazilla.id} | District: {getDistrictName(upazilla.districtId)}</p>
                    </div>
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
