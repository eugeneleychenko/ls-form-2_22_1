import { useFormContext, useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

// Define types for the Airtable response
interface AirtableRecord {
  id: string;
  fields: {
    Type: string;
    Carriers: string;
    "Plan 1"?: string;
    "Plan 1 Cost"?: string;
    "Plan 2"?: string;
    "Plan 2 Cost"?: string;
    "Plan 3"?: string;
    "Plan 3 Cost"?: string;
    "Plan 4"?: string;
    "Plan 4 Cost"?: string;
    "Plan 5"?: string;
    "Plan 5 Cost"?: string;
    "Plan 6"?: string;
    "Plan 6 Cost"?: string;
    "Plan 7"?: string;
    "Plan 7 Cost"?: string;
    "Plan 8"?: string;
    "Plan 8 Cost"?: string;
    [key: string]: any;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
}

interface CarrierData {
  carriers: string[];
  plans: {
    [carrier: string]: {
      planNames: string[];
      planCosts: string[];
    }
  };
}

export default function InsuranceDetails() {
  const { control, setValue } = useFormContext()
  const [carriers, setCarriers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [allData, setAllData] = useState<Record<string, CarrierData>>({})
  const [availablePlans, setAvailablePlans] = useState<string[]>([])
  const [planCosts, setPlanCosts] = useState<Record<string, string>>({})
  
  // Watch for changes to the type of insurance and carrier
  const selectedType = useWatch({
    control,
    name: "basicInformation.typeOfInsurance",
    defaultValue: ""
  });

  const selectedCarrier = useWatch({
    control,
    name: "insuranceDetails.carrierU65",
    defaultValue: ""
  });

  useEffect(() => {
    const fetchCarriersAndPlans = async () => {
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
        
        // Process the data to organize by type
        const dataByType: Record<string, CarrierData> = {};
        
        data.records.forEach(record => {
          const type = record.fields.Type;
          const carrier = record.fields.Carriers;
          
          if (!dataByType[type]) {
            dataByType[type] = {
              carriers: [],
              plans: {}
            };
          }
          
          if (carrier && !dataByType[type].carriers.includes(carrier)) {
            dataByType[type].carriers.push(carrier);
            dataByType[type].plans[carrier] = {
              planNames: [],
              planCosts: []
            };
          }
          
          // Add plans for this carrier if they exist
          if (carrier) {
            for (let i = 1; i <= 8; i++) {
              const planKey = `Plan ${i}`;
              const planCostKey = `Plan ${i} Cost`;
              
              if (record.fields[planKey] && typeof record.fields[planKey] === 'string') {
                const planName = record.fields[planKey] as string;
                const planCost = record.fields[planCostKey] as string;
                
                // Only add if the plan starts with the carrier name to ensure it belongs to this carrier
                if (planName.startsWith(carrier)) {
                  if (!dataByType[type].plans[carrier].planNames.includes(planName)) {
                    dataByType[type].plans[carrier].planNames.push(planName);
                    dataByType[type].plans[carrier].planCosts.push(planCost);
                  }
                }
              }
            }
          }
        });
        
        // Sort carriers alphabetically
        for (const type in dataByType) {
          dataByType[type].carriers.sort();
          
          // Sort plans for each carrier
          for (const carrier in dataByType[type].plans) {
            // Create pairs of plan names and costs for sorting
            const pairs = dataByType[type].plans[carrier].planNames.map((name, index) => ({
              name,
              cost: dataByType[type].plans[carrier].planCosts[index]
            }));
            
            // Sort by plan name
            pairs.sort((a, b) => a.name.localeCompare(b.name));
            
            // Update the arrays with sorted values
            dataByType[type].plans[carrier].planNames = pairs.map(p => p.name);
            dataByType[type].plans[carrier].planCosts = pairs.map(p => p.cost);
          }
        }
        
        setAllData(dataByType);
        
        // If a type is already selected, set the carriers for that type
        if (selectedType && dataByType[selectedType]) {
          setCarriers(dataByType[selectedType].carriers);
          
          // If a carrier is already selected, set the plans for that carrier
          if (selectedCarrier && dataByType[selectedType].plans[selectedCarrier]) {
            setAvailablePlans(dataByType[selectedType].plans[selectedCarrier].planNames);
            
            // Create a mapping of plan names to costs
            const costMap: Record<string, string> = {};
            dataByType[selectedType].plans[selectedCarrier].planNames.forEach((plan, index) => {
              costMap[plan] = dataByType[selectedType].plans[selectedCarrier].planCosts[index];
            });
            setPlanCosts(costMap);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty arrays if API fails
        setCarriers([]);
        setAvailablePlans([]);
        setPlanCosts({});
      } finally {
        setLoading(false);
      }
    };

    fetchCarriersAndPlans();
  }, []);

  // Update carriers when selected type changes
  useEffect(() => {
    if (selectedType && allData[selectedType]) {
      setCarriers(allData[selectedType].carriers);
      // Clear carrier and plan selection when type changes
      setValue("insuranceDetails.carrierU65", "");
      setValue("insuranceDetails.plan", "");
      setValue("insuranceDetails.planCost", "");
      setAvailablePlans([]);
    } else {
      setCarriers([]);
    }
  }, [selectedType, allData, setValue]);

  // Update plans when selected carrier changes
  useEffect(() => {
    if (selectedType && selectedCarrier && allData[selectedType]?.plans[selectedCarrier]) {
      setAvailablePlans(allData[selectedType].plans[selectedCarrier].planNames);
      
      // Create a mapping of plan names to costs
      const costMap: Record<string, string> = {};
      allData[selectedType].plans[selectedCarrier].planNames.forEach((plan, index) => {
        costMap[plan] = allData[selectedType].plans[selectedCarrier].planCosts[index];
      });
      setPlanCosts(costMap);
      
      // Clear plan selection when carrier changes
      setValue("insuranceDetails.plan", "");
      setValue("insuranceDetails.planCost", "");
    } else {
      setAvailablePlans([]);
      setPlanCosts({});
    }
  }, [selectedCarrier, selectedType, allData, setValue]);

  // Update plan cost when plan changes
  const handlePlanChange = (planName: string) => {
    const cost = planCosts[planName] || "";
    setValue("insuranceDetails.planCost", cost);
  };

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="insuranceDetails.carrierU65"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Carrier U65</FormLabel>
            <FormControl>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!selectedType || carriers.length === 0}
              >
                <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder={
                    loading 
                      ? "Loading..." 
                      : !selectedType 
                        ? "Select Type of Insurance first" 
                        : carriers.length === 0 
                          ? "No carriers available" 
                          : "Select Carrier"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : carriers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {!selectedType ? "Select Type of Insurance first" : "No carriers available"}
                    </SelectItem>
                  ) : (
                    carriers.map((carrier) => (
                      <SelectItem key={carrier} value={carrier}>{carrier}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
            <FormControl>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handlePlanChange(value);
                }} 
                defaultValue={field.value}
                disabled={!selectedCarrier || availablePlans.length === 0}
              >
                <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder={
                    loading 
                      ? "Loading..." 
                      : !selectedCarrier 
                        ? "Select Carrier first" 
                        : availablePlans.length === 0 
                          ? "No plans available" 
                          : "Select Plan"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : availablePlans.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {!selectedCarrier ? "Select Carrier first" : "No plans available"}
                    </SelectItem>
                  ) : (
                    availablePlans.map((plan) => (
                      <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="insuranceDetails.planCost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plan Cost</FormLabel>
            <FormControl>
              <Input {...field} readOnly />
            </FormControl>
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
            <FormControl>
              <Input {...field} />
            </FormControl>
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

