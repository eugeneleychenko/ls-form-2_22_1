import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

export default function ContactNumbers() {
  const { control } = useFormContext()

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="contactNumbers.cellPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Cell Phone <sub className="text-xs text-gray-500">[Airtable: Cell Phone]</sub>
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="(XXX) XXX-XXXX" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="contactNumbers.workPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Work Phone (Optional) <sub className="text-xs text-gray-500">[Airtable: Work Phone]</sub>
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="(XXX) XXX-XXXX" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

