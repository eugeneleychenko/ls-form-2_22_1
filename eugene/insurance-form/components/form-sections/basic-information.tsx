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
            <FormLabel required>
              Lead ID * <sub className="text-xs text-gray-500">[Airtable: Lead ID]</sub>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Select Lead ID (Required)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="HULK">HULK</SelectItem>
                <SelectItem value="White Data">White Data</SelectItem>
                <SelectItem value="Power Rangers">Power Rangers</SelectItem>
                <SelectItem value="Orange Data">Orange Data</SelectItem>
                <SelectItem value="Glorias">Glorias</SelectItem>
                <SelectItem value="Power Rangers Inbound">Power Rangers Inbound</SelectItem>
                <SelectItem value="Fire Inbound">Fire Inbound</SelectItem>
                <SelectItem value="White inbound">White inbound</SelectItem>
                <SelectItem value="Greens">Greens</SelectItem>
                <SelectItem value="Red LT">Red LT</SelectItem>
                <SelectItem value="Orange Inbound">Orange Inbound</SelectItem>
                <SelectItem value="Yellow">Yellow</SelectItem>
                <SelectItem value="Spiderman X">Spiderman X</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-destructive" />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="basicInformation.firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>
              First Name * <sub className="text-xs text-gray-500">[Airtable: firstName]</sub>
            </FormLabel>
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
            <FormLabel required>
              Last Name * <sub className="text-xs text-gray-500">[Airtable: lastName]</sub>
            </FormLabel>
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
            <FormLabel>
              Email <sub className="text-xs text-gray-500">[Airtable: email]</sub>
            </FormLabel>
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
            <FormLabel>
              Date of Birth <sub className="text-xs text-gray-500">[Airtable: DOB]</sub>
            </FormLabel>
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
            <FormLabel>
              Lead Source <sub className="text-xs text-gray-500">[Airtable: Lead Source]</sub>
            </FormLabel>
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
      <div className="text-sm text-gray-500">* Required fields</div>
    </div>
  )
}

