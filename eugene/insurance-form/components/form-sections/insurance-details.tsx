"use client"

import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchCarriers, type CarriersByType, getPlanTypes, getCarriersForPlan } from "@/lib/carriers"

export default function InsuranceDetails() {
  const { control, watch, setValue } = useFormContext()
  const [carriers, setCarriers] = useState<CarriersByType>({})
  const [isLoading, setIsLoading] = useState(true)
  const selectedPlan = watch("insuranceDetails.plan")

  useEffect(() => {
    const loadCarriers = async () => {
      setIsLoading(true)
      try {
        const data = await fetchCarriers()
        setCarriers(data)
      } catch (error) {
        console.error("Error loading carriers:", error)
      }
      setIsLoading(false)
    }

    loadCarriers()
  }, [])

  // Reset Carrier ACA when Plan changes
  useEffect(() => {
    if (selectedPlan) {
      setValue("insuranceDetails.carrierACA", "")
    }
  }, [selectedPlan, setValue])

  const planTypes = getPlanTypes(carriers)
  const availableCarriers = selectedPlan ? getCarriersForPlan(carriers, selectedPlan) : []

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="insuranceDetails.carrierU65"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Carrier U65</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="insuranceDetails.plan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plan</FormLabel>
            <Select
              disabled={isLoading}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {planTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="insuranceDetails.carrierACA"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Carrier ACA</FormLabel>
            <Select
              disabled={!selectedPlan || isLoading}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a carrier" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableCarriers.map((carrier) => (
                  <SelectItem key={carrier} value={carrier}>
                    {carrier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="insuranceDetails.acaPlanPremium"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ACA Plan Premium</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="insuranceDetails.acaPlanDeductible"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ACA Plan Deductible</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

