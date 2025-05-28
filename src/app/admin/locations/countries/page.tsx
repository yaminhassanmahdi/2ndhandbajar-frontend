
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

export default function AdminCountriesPage() {
  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Globe className="h-8 w-8 text-primary"/>
        Manage Countries
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Supported Countries</CardTitle>
          <CardDescription>Currently, the platform is configured for operations within Bangladesh.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5">
            <li className="text-lg font-medium">Bangladesh</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Expanding to other countries will require further configuration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
