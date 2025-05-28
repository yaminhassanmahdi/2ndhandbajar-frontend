
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ShippingAddress, Division, District, Thana as Upazilla } from "@/lib/types"; // Using Thana as Upazilla type alias
import { 
    DEFAULT_DIVISIONS,
    DEFAULT_DISTRICTS,
    DEFAULT_UPAZILLAS // Using new constant name for upazillas
} from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phoneNumber: z.string().optional(),
  country: z.string().default("Bangladesh"),
  division: z.string().min(1, "Please select a division."), 
  district: z.string().min(1, "Please select a district."), 
  thana: z.string().min(1, "Please select an upazilla."), // Renamed label to Upazilla
  houseAddress: z.string().min(3, "House address is required."),
  roadNumber: z.string().optional(),
});

type AddressFormValues = Omit<ShippingAddress, 'country'> & { country?: string };

type AddressFormProps = {
  onSubmit: (data: ShippingAddress) => void;
  isLoading?: boolean;
  initialData?: Partial<ShippingAddress>;
};

export function AddressForm({ onSubmit, isLoading = false, initialData = {} }: AddressFormProps) {
  const divisions: Division[] = DEFAULT_DIVISIONS;
  const allDistricts: District[] = DEFAULT_DISTRICTS;
  const allUpazillas: Upazilla[] = DEFAULT_UPAZILLAS;

  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableUpazillas, setAvailableUpazillas] = useState<Upazilla[]>([]); // Renamed from thanas

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phoneNumber: initialData?.phoneNumber || "",
      country: "Bangladesh",
      division: initialData?.division || "",
      district: initialData?.district || "",
      thana: initialData?.thana || "", // Stays 'thana' in form state for now due to schema
      houseAddress: initialData?.houseAddress || "",
      roadNumber: initialData?.roadNumber || "",
    },
  });

  useEffect(() => {
    form.reset({
      fullName: initialData?.fullName || "",
      phoneNumber: initialData?.phoneNumber || "",
      country: "Bangladesh",
      division: initialData?.division || "",
      district: initialData?.district || "",
      thana: initialData?.thana || "",
      houseAddress: initialData?.houseAddress || "",
      roadNumber: initialData?.roadNumber || "",
    });

    if (initialData?.division) {
      const selectedDivisionObj = divisions.find(d => d.name === initialData.division);
      if (selectedDivisionObj) {
        const newDistricts = allDistricts.filter(dist => dist.divisionId === selectedDivisionObj.id);
        setAvailableDistricts(newDistricts);
        if (initialData.district) {
          const selectedDistrictObj = newDistricts.find(d => d.name === initialData.district);
          if (selectedDistrictObj) {
            setAvailableUpazillas(allUpazillas.filter(up => up.districtId === selectedDistrictObj.id));
          } else {
            setAvailableUpazillas([]);
          }
        } else {
          setAvailableUpazillas([]);
        }
      } else {
        setAvailableDistricts([]);
        setAvailableUpazillas([]);
      }
    } else {
      setAvailableDistricts([]);
      setAvailableUpazillas([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [initialData]); 


  const watchedDivisionName = form.watch("division");
  const watchedDistrictName = form.watch("district");

  useEffect(() => {
    if (watchedDivisionName) {
      const selectedDivisionObj = divisions.find(d => d.name === watchedDivisionName);
      if (selectedDivisionObj) {
        const newDistricts = allDistricts.filter(dist => dist.divisionId === selectedDivisionObj.id);
        setAvailableDistricts(newDistricts);
        
        const currentDistrictValue = form.getValues("district");
        if (currentDistrictValue && !newDistricts.some(d => d.name === currentDistrictValue)) {
          form.setValue("district", "");
          form.setValue("thana", ""); // Reset thana/upazilla
          setAvailableUpazillas([]);
        } else if (!currentDistrictValue && form.formState.dirtyFields.division) {
           form.setValue("district", "");
           form.setValue("thana", ""); // Reset thana/upazilla
           setAvailableUpazillas([]);
        }
      } else {
        setAvailableDistricts([]);
        form.setValue("district", "");
        form.setValue("thana", ""); // Reset thana/upazilla
        setAvailableUpazillas([]);
      }
    } else {
      setAvailableDistricts([]);
      form.setValue("district", "");
      form.setValue("thana", ""); // Reset thana/upazilla
      setAvailableUpazillas([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [watchedDivisionName]); 

  useEffect(() => {
    if (watchedDistrictName && watchedDivisionName) {
        const selectedDivisionObj = divisions.find(d => d.name === watchedDivisionName);
        if (selectedDivisionObj) {
            const selectedDistrictObj = allDistricts.find(d => d.name === watchedDistrictName && d.divisionId === selectedDivisionObj.id);
            if (selectedDistrictObj) {
                const newUpazillas = allUpazillas.filter(up => up.districtId === selectedDistrictObj.id);
                setAvailableUpazillas(newUpazillas);

                const currentThanaValue = form.getValues("thana");
                if (currentThanaValue && !newUpazillas.some(t => t.name === currentThanaValue)) {
                    form.setValue("thana", "");
                } else if (!currentThanaValue && form.formState.dirtyFields.district) {
                    form.setValue("thana", "");
                }
            } else {
                setAvailableUpazillas([]);
                form.setValue("thana", "");
            }
        } else {
            setAvailableUpazillas([]);
            form.setValue("thana", "");
        }
    } else {
      setAvailableUpazillas([]);
      form.setValue("thana", "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [watchedDistrictName, watchedDivisionName]);


  const handleFormSubmit = (values: AddressFormValues) => {
    const fullAddress: ShippingAddress = {
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      country: "Bangladesh",
      division: values.division,
      district: values.district,
      thana: values.thana, // This is now essentially Upazilla name
      houseAddress: values.houseAddress,
      roadNumber: values.roadNumber,
    };
    onSubmit(fullAddress);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John M. Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="01XXXXXXXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
                <Input value="Bangladesh" disabled />
            </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="division"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Division</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {divisions.map(division => (
                    <SelectItem key={division.id} value={division.name}>{division.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value} 
                disabled={!watchedDivisionName || availableDistricts.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={!watchedDivisionName ? "Select a division first" : (availableDistricts.length === 0 && watchedDivisionName ? "No districts in division" : "Select District")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableDistricts.map(district => (
                    <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thana" // Internally form uses 'thana', UI shows 'Upazilla'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upazilla</FormLabel> 
              <Select 
                onValueChange={field.onChange} 
                value={field.value} 
                disabled={!watchedDistrictName || availableUpazillas.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={!watchedDistrictName ? "Select a district first" : (availableUpazillas.length === 0 && watchedDistrictName ? "No upazillas in district" : "Select Upazilla")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableUpazillas.map(upazilla => ( // Renamed thana to upazilla for clarity
                    <SelectItem key={upazilla.id} value={upazilla.name}>{upazilla.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="houseAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>House Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g., House 123, Flat B4" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roadNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Road Number / Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Road 5, Block C" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Address & Continue
        </Button>
      </form>
    </Form>
  );
}
