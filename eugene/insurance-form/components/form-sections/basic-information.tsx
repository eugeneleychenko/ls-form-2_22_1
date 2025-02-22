import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { FormLabel } from "@/components/ui/form-label"

export default function BasicInformation() {
  const { control } = useFormContext()

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
                  <SelectValue placeholder="Select Type of Insurance (Optional)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="life">Life</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="home">Home</SelectItem>
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

