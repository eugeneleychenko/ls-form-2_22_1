import { useFieldArray, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

export default function DependentsInformation() {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dependentsInformation",
  })

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 p-4 border rounded-md">
          <FormField
            control={control}
            name={`dependentsInformation.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name <sub>[Airtable: Dependent {index+1} Name]</sub></FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`dependentsInformation.${index}.dob`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth <sub>[Airtable: Dependent {index+1} DOB]</sub></FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`dependentsInformation.${index}.ssn`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>SSN <sub>[Airtable: Dependent {index+1} SSN]</sub></FormLabel>
                <FormControl>
                  <Input {...field} placeholder="XXX-XX-XXXX" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`dependentsInformation.${index}.gender`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender <sub>[Airtable: Dependent {index+1} Gender]</sub></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`dependentsInformation.${index}.relationship`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship <sub>[Airtable: Dependent {index+1} Relationship]</sub></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" variant="destructive" onClick={() => remove(index)}>
            Remove Dependent
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() => append({ name: "", dob: "", ssn: "", gender: "", relationship: "" })}
        disabled={fields.length >= 6}
      >
        Add Dependent
      </Button>
    </div>
  )
}

