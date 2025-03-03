import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

export default function HealthInformation() {
  const { control } = useFormContext()

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="healthInformation.currentlyInsured"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Currently Insured <sub className="text-xs text-gray-500">[Airtable: Currently Insured]</sub>
              </FormLabel>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="healthInformation.lastTimeInsured"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Last Time Insured <sub className="text-xs text-gray-500">[Airtable: Last Time Insured]</sub>
            </FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="healthInformation.currentMedications"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Current Medications <sub className="text-xs text-gray-500">[Airtable: Current Medications]</sub>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="List your current medications"
                value={field.value || ""}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="healthInformation.preExistingConditions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Pre-existing Conditions <sub className="text-xs text-gray-500">[Airtable: Pre Existing Conditions]</sub>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="List any pre-existing conditions"
                value={field.value || ""}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="healthInformation.majorHospitalizations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Major Hospitalizations/Surgeries <sub className="text-xs text-gray-500">[Airtable: Major Hospitalizations/Surgeries]</sub>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="List any major hospitalizations or surgeries"
                value={field.value || ""}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="healthInformation.projectedAnnualIncome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Projected Annual Income <sub className="text-xs text-gray-500">[Airtable: Projected Annual Income]</sub>
            </FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter projected annual income" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

