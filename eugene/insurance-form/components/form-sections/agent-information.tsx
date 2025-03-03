import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

export default function AgentInformation() {
  const { control } = useFormContext()

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="agentInformation.agentName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Agent Name <sub>[Airtable: Agent Name]</sub></FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="agentInformation.fronterName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fronter Name <sub>[Airtable: Fronter Name]</sub></FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="agentInformation.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes <sub>[Airtable: Notes]</sub></FormLabel>
            <FormControl>
              <Textarea placeholder="Enter any additional notes here" className="min-h-[100px]" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

