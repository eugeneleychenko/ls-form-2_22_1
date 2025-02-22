import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

export default function BillingInformation() {
  const { control, watch } = useFormContext()
  const sameAsApplicant = watch("billingInformation.sameAsApplicant")

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="billingInformation.sameAsApplicant"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Same as Applicant Address</FormLabel>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      {!sameAsApplicant && (
        <>
          <FormField
            control={control}
            name="billingInformation.billingAddressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Address Line 1</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="billingInformation.billingAddressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="billingInformation.billingCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="billingInformation.billingState"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing State</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Add all US states here */}
                    <SelectItem value="AL">Alabama</SelectItem>
                    <SelectItem value="AK">Alaska</SelectItem>
                    {/* ... */}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="billingInformation.billingZipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing ZIP Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="XXXXX" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      <FormField
        control={control}
        name="billingInformation.cardType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Card Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="mastercard">Mastercard</SelectItem>
                <SelectItem value="amex">American Express</SelectItem>
                <SelectItem value="discover">Discover</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="billingInformation.cardNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Card Number</FormLabel>
            <FormControl>
              <Input {...field} placeholder="XXXX-XXXX-XXXX-XXXX" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

