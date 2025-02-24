import { useFormContext, useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

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
    "Addons?"?: boolean;
    [key: string]: any;
  };
}

interface AirtableCommissions2Record {
  id: string;
  fields: {
    "Individual Addons"?: string[];
    "Family Addons"?: string[];
    "Individual + Spouse Addons"?: string[];
    "Individual + Children Addons"?: string[];
    [key: string]: any;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
}

interface CommissionsResponse {
  records: AirtableCommissions2Record[];
}

interface CarrierData {
  carriers: string[];
  hasAddons: boolean;
  plans: {
    [carrier: string]: {
      planNames: string[];
      planCosts: string[];
    }
  };
}

interface AddonPlan {
  planName: string;
  planCost: string;
  planNumber: string;
}

interface AddonCategory {
  linkedRecordIds: string[];
  plans: AddonPlan[];
}

interface AddonData {
  individual?: AddonCategory;
  family?: AddonCategory;
  individualSpouse?: AddonCategory;
  individualChildren?: AddonCategory;
}

export default function InsuranceDetails() {
  const { control, setValue, watch } = useFormContext()
  const [carriers, setCarriers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [allData, setAllData] = useState<Record<string, CarrierData>>({})
  const [availablePlans, setAvailablePlans] = useState<string[]>([])
  const [planCosts, setPlanCosts] = useState<Record<string, string>>({})
  
  // Addon states
  const [loadingAddons, setLoadingAddons] = useState(false)
  const [addonsEnabled, setAddonsEnabled] = useState(false)
  const [addonData, setAddonData] = useState<AddonData>({})
  const [availableAddons, setAvailableAddons] = useState<AddonPlan[]>([])
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [addonsTotalCost, setAddonsTotalCost] = useState<string>("0")
  
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

  const selectedPlan = useWatch({
    control,
    name: "insuranceDetails.plan",
    defaultValue: ""
  });

  // Add useEffect hooks to log changes
  useEffect(() => {
    if (selectedType) {
      console.log("Type of Insurance selected:", selectedType);
    }
  }, [selectedType]);

  useEffect(() => {
    if (selectedCarrier) {
      console.log("Carrier U65 selected:", selectedCarrier);
    }
  }, [selectedCarrier]);

  useEffect(() => {
    if (selectedPlan) {
      console.log("Plan selected:", selectedPlan);
    }
  }, [selectedPlan]);

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
          
          // Skip records that don't have a proper carrier name or might be add-ons
          if (!carrier || carrier.toLowerCase().includes('addon')) {
            return;
          }
          
          if (!dataByType[type]) {
            dataByType[type] = {
              carriers: [],
              hasAddons: false,
              plans: {}
            };
          }
          
          // Set hasAddons at the type level if any record has add-ons
          if (record.fields["Addons?"]) {
            dataByType[type].hasAddons = true;
          }
          
          if (!dataByType[type].carriers.includes(carrier)) {
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

  const fetchAddonData = async () => {
    if (!selectedType) return;
    
    setLoadingAddons(true);
    console.log("Fetching add-ons for type:", selectedType);
    
    try {
      const baseId = 'appYMEW2CsYkdpQ7c';
      const tableName = 'tblFJVvuZ2CfhD77D'; // Commissions2 table
      const endpoint = `https://api.airtable.com/v0/${baseId}/${tableName}?maxRecords=20`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025`
        }
      });

      const data: CommissionsResponse = await response.json();
      
      console.log("Add-ons data received:", data.records.length, "records");
      
      // Filter records with addon data
      const recordsWithAddons = data.records.filter(record => {
        const keys = Object.keys(record.fields);
        return keys.some(key => 
          key.toLowerCase().includes('addon') && 
          Array.isArray(record.fields[key]) && 
          record.fields[key].length > 0
        );
      });
      
      console.log("Records with add-ons:", recordsWithAddons.length);
      
      if (recordsWithAddons.length > 0) {
        // Take the first record with addons
        const record = recordsWithAddons[0];
        
        // Extract addon categories
        const extractAddonCategory = (categoryName: string): AddonCategory | undefined => {
          const fields = record.fields;
          
          if (!fields[categoryName] || !Array.isArray(fields[categoryName]) || fields[categoryName].length === 0) {
            return undefined;
          }
          
          // Find all plan fields for this category
          const planFields = Object.keys(fields).filter(key => 
            key.startsWith(categoryName + ' Plan') && 
            !key.toLowerCase().includes('cost') &&
            Array.isArray(fields[key]) && 
            fields[key].length > 0
          );
          
          // Find all cost fields for this category
          const costFields = Object.keys(fields).filter(key => 
            key.startsWith(categoryName + ' Plan') && 
            key.toLowerCase().includes('cost') &&
            Array.isArray(fields[key]) && 
            fields[key].length > 0
          );
          
          // Extract plans with their costs
          const plans = planFields.map((planField, index) => {
            const planNumber = planField.match(/Plan (\d+)/);
            const planNum = planNumber ? planNumber[1] : (index + 1).toString();
            
            // Find the corresponding cost field
            const costField = costFields.find(field => field.includes(`Plan ${planNum} Cost`));
            
            return {
              planName: fields[planField][0],
              planCost: costField ? fields[costField][0] : "0",
              planNumber: planNum
            };
          });
          
          return {
            linkedRecordIds: fields[categoryName],
            plans
          };
        };
        
        const addonData: AddonData = {
          individual: extractAddonCategory('Individual Addons'),
          family: extractAddonCategory('Family Addons'),
          individualSpouse: extractAddonCategory('Individual + Spouse Addons'),
          individualChildren: extractAddonCategory('Individual + Children Addons')
        };
        
        setAddonData(addonData);
        
        // Based on selectedType, set available addons
        if (selectedType) {
          let addons: AddonPlan[] = [];
          
          if (selectedType === 'Individual' && addonData.individual) {
            addons = addonData.individual.plans;
          } else if (selectedType === 'Family' && addonData.family) {
            addons = addonData.family.plans;
          } else if (selectedType === 'Individual + Spouse' && addonData.individualSpouse) {
            addons = addonData.individualSpouse.plans;
          } else if (selectedType === 'Individual + Children' && addonData.individualChildren) {
            addons = addonData.individualChildren.plans;
          }
          
          setAvailableAddons(addons);
        }
      }
    } catch (error) {
      console.error('Error fetching addon data:', error);
      setAvailableAddons([]);
    } finally {
      setLoadingAddons(false);
    }
  };

  // Update carriers when selected type changes
  useEffect(() => {
    if (selectedType && allData[selectedType]) {
      setCarriers(allData[selectedType].carriers);
      // Clear carrier and plan selection when type changes
      setValue("insuranceDetails.carrierU65", "");
      setValue("insuranceDetails.plan", "");
      setValue("insuranceDetails.planCost", "");
      setValue("insuranceDetails.hasAddons", false);
      setValue("insuranceDetails.selectedAddons", []);
      setValue("insuranceDetails.addonsCost", "");
      setAvailablePlans([]);
      setAddonsEnabled(false);
      setSelectedAddons([]);
      setAddonsTotalCost("0");
      
      // Check if this type has add-ons and fetch them
      const hasAddons = allData[selectedType]?.hasAddons || false;
      if (hasAddons) {
        console.log("Type has add-ons, fetching them...");
        fetchAddonData();
      }
    } else {
      setCarriers([]);
    }
  }, [selectedType, allData, setValue]);

  // Update plans when selected carrier changes
  useEffect(() => {
    if (selectedType && selectedCarrier && allData[selectedType]?.plans[selectedCarrier]) {
      console.log("Setting up plans for carrier:", selectedCarrier);
      
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
  
  // Handle addon checkbox change
  const handleAddonsToggle = (checked: boolean) => {
    setAddonsEnabled(checked);
    setValue("insuranceDetails.hasAddons", checked);
    
    if (!checked) {
      setSelectedAddons([]);
      setAddonsTotalCost("0");
      setValue("insuranceDetails.selectedAddons", []);
      setValue("insuranceDetails.addonsCost", "0");
    }
  };
  
  // Handle addon selection
  const handleAddonSelection = (addonName: string, checked: boolean) => {
    let updatedAddons = [...selectedAddons];
    
    if (checked) {
      updatedAddons.push(addonName);
    } else {
      updatedAddons = updatedAddons.filter(name => name !== addonName);
    }
    
    setSelectedAddons(updatedAddons);
    setValue("insuranceDetails.selectedAddons", updatedAddons);
    
    // Calculate total cost
    const total = calculateAddonsCost(updatedAddons);
    setAddonsTotalCost(total);
    setValue("insuranceDetails.addonsCost", total);
  };
  
  // Calculate total cost of selected addons
  const calculateAddonsCost = (selectedAddons: string[]): string => {
    let total = 0;
    
    availableAddons.forEach(addon => {
      if (selectedAddons.includes(addon.planName)) {
        // Extract the cost value (remove $ and convert to number)
        const costString = addon.planCost.replace(/[^0-9.]/g, '');
        const cost = parseFloat(costString);
        if (!isNaN(cost)) {
          total += cost;
        }
      }
    });
    
    return `$${total.toFixed(2)}`;
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
      
      {/* Add-ons Section */}
      {console.log("Add-ons section condition:", {
        selectedType,
        hasAddons: selectedType ? allData[selectedType]?.hasAddons : false
      })}
      
      {selectedType && 
       allData[selectedType] && 
       allData[selectedType].hasAddons && (
        <div className="space-y-4 mt-4 border-t pt-4">
          <h3 className="font-medium text-lg">Add-ons Options</h3>
          <FormField
            control={control}
            name="insuranceDetails.hasAddons"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Do you want to include add-ons?</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      const isEnabled = value === "enabled";
                      field.onChange(isEnabled);
                      handleAddonsToggle(isEnabled);
                    }}
                    value={field.value ? "enabled" : "disabled"}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Select add-ons option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">No Add-ons</SelectItem>
                      <SelectItem value="enabled">Include Add-ons</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {addonsEnabled && (
            <div className="space-y-4 border p-4 rounded-md mt-2">
              <h4 className="font-medium">Available Add-ons</h4>
              
              {loadingAddons ? (
                <div>Loading add-ons...</div>
              ) : availableAddons.length === 0 ? (
                <div>No add-ons available for this plan</div>
              ) : (
                <div className="space-y-3">
                  {availableAddons.map((addon) => (
                    <div key={addon.planName} className="flex items-center space-x-2 border-b pb-2">
                      <Checkbox 
                        id={`addon-${addon.planNumber}`}
                        checked={selectedAddons.includes(addon.planName)}
                        onCheckedChange={(checked) => 
                          handleAddonSelection(addon.planName, checked === true)
                        }
                      />
                      <div className="space-y-1">
                        <label 
                          htmlFor={`addon-${addon.planNumber}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {addon.planName}
                        </label>
                        <p className="text-xs text-gray-500">Cost: {addon.planCost}</p>
                      </div>
                    </div>
                  ))}
                  
                  <FormField
                    control={control}
                    name="insuranceDetails.addonsCost"
                    render={({ field }) => (
                      <FormItem className="pt-3">
                        <FormLabel>Total Add-ons Cost</FormLabel>
                        <FormControl>
                          <Input {...field} value={addonsTotalCost} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
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

