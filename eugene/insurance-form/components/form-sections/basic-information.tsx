import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { FormLabel } from "@/components/ui/form-label"
import { useEffect, useState } from "react"

// Define types for the Airtable response
interface AirtableRecord {
  id: string;
  fields: {
    Type: string;
    [key: string]: any;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
}

export default function BasicInformation() {
  const { control } = useFormContext()
  const [insuranceTypes, setInsuranceTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsuranceTypes = async () => {
      try {
        const baseId = 'appYMEW2CsYkdpQ7c';
        const tableName = 'tbl2WlsDz9rPXhVVY';
        const endpoint = `https://api.airtable.com/v0/${baseId}/${tableName}`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025`
          }
        });

        const data: AirtableResponse = await response.json();
        
        // Extract unique types from the data
        const types = [...new Set(data.records.map(record => record.fields.Type))];
        setInsuranceTypes(types);
      } catch (error) {
        console.error('Error fetching insurance types:', error);
        // Fallback to default values if API fails
        setInsuranceTypes(['Health', 'Life', 'Auto', 'Home']);
      } finally {
        setLoading(false);
      }
    };

    fetchInsuranceTypes();
  }, []);

  return (
    <div className="grid gap-6">
      <FormField
        control={control}
        name="basicInformation.leadId"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Lead ID *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter Lead ID (Required)"
                {...field}
                className="border-gray-300 focus:border-primary focus:ring-primary"
              />
            </FormControl>
            <FormMessage className="text-destructive" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="basicInformation.firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>First Name *</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter First Name (Required)"
                {...field}
                className="border-gray-300 focus:border-primary focus:ring-primary"
              />
            </FormControl>
            <FormMessage className="text-destructive" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="basicInformation.lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Last Name *</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter Last Name (Required)"
                {...field}
                className="border-gray-300 focus:border-primary focus:ring-primary"
              />
            </FormControl>
            <FormMessage className="text-destructive" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="basicInformation.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="Enter Email (Optional)"
                {...field}
                className="border-gray-300 focus:border-primary focus:ring-primary"
              />
            </FormControl>
            <FormMessage className="text-destructive" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="basicInformation.dateOfBirth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date of Birth</FormLabel>
            <FormControl>
              <Input 
                type="date" 
                {...field} 
                className="border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="Select Date (Optional)"
              />
            </FormControl>
            <FormMessage className="text-destructive" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="basicInformation.leadSource"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lead Source</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Select Lead Source (Optional)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-destructive" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="basicInformation.insuranceState"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Insurance State</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Select Insurance State (Optional)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="AL">Alabama</SelectItem>
                <SelectItem value="AK">Alaska</SelectItem>
                {/* ... */}
              </SelectContent>
            </Select>
            <FormMessage className="text-destructive" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="basicInformation.typeOfInsurance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type of Insurance</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder={loading ? "Loading..." : "Select Type of Insurance (Optional)"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  insuranceTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage className="text-destructive" />
          </FormItem>
        )}
      />
      <div className="text-sm text-gray-500">* Required fields</div>
    </div>
  )
}

