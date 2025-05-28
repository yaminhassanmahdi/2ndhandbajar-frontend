
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library } from "lucide-react";
import { DEFAULT_DIVISIONS } from '@/lib/constants';
import type { Division } from '@/lib/types';
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminDivisionsPage() {
  const divisions: Division[] = DEFAULT_DIVISIONS;

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Library className="h-8 w-8 text-primary"/>
          Administrative Divisions (Bangladesh)
        </h1>
        {/* Add/Edit/Delete functionality removed */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Division List</CardTitle>
          <CardDescription>
            The following administrative divisions are configured for Bangladesh.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {divisions.length === 0 ? (
            <p className="text-muted-foreground">No divisions found. This indicates an issue with the predefined data.</p>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">
              <ul className="p-4 space-y-2">
                {divisions.map(division => (
                  <li key={division.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                    <div>
                      <span className="font-medium">{division.name}</span>
                      <p className="text-xs text-muted-foreground">ID: {division.id}</p>
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
