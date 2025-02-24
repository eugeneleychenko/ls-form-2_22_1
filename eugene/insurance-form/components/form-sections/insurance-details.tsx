import { useFormContext, useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState, useCallback } from "react"
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
  provider?: string; // Add provider to identify which American Financial
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

  // Memoize the fetchAddonData function to prevent it from causing infinite loops
  const fetchAddonData = useCallback(async () => {
    if (!selectedType) return;
    
    setLoadingAddons(true);
    console.log("Fetching add-ons for type:", selectedType);
    
    try {
      // Use the same endpoint as in addon.js to fetch addons directly
      const baseId = 'appYMEW2CsYkdpQ7c';
      const tableName = 'tbl2WlsDz9rPXhVVY'; // Use the main table instead of Commissions2
      const endpoint = `https://api.airtable.com/v0/${baseId}/${tableName}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025`
        }
      });

      const data = await response.json();
      
      console.log("Raw data received:", data.records.length, "records");
      
      // Filter records to find American Financial addons for the selected type
      const addonRecords = data.records.filter((record: AirtableRecord) => {
        return record.fields.Type === selectedType && 
               record.fields.Carriers && 
               record.fields.Carriers.includes('American Financial');
      });
      
      console.log("Addon records found for type", selectedType, ":", addonRecords.length);
      
      if (addonRecords.length > 0) {
        const addons: AddonPlan[] = [];
        
        // Process each addon record
        addonRecords.forEach((record: AirtableRecord) => {
          const carrier = record.fields.Carriers;
          let provider = carrier; // Use the full carrier name as provider
          
          // Extract addon number from carrier name (e.g., "American Financial 1")
          let addonNumber = '1';
          if (carrier.includes(' 1')) addonNumber = '1';
          if (carrier.includes(' 2')) addonNumber = '2';
          if (carrier.includes(' 3')) addonNumber = '3';
          
          // Process each plan in the record
          for (let i = 1; i <= 3; i++) { // Process up to 3 plans per addon
            const planKey = `Plan ${i}`;
            const planCostKey = `Plan ${i} Cost`;
            
            if (record.fields[planKey] && record.fields[planCostKey]) {
              // Clean up the plan name and cost
              const planName = String(record.fields[planKey]).replace(/\s+/g, ' ').trim();
              const planCost = String(record.fields[planCostKey]).replace(/\$+/g, '').trim();
              
              if (planName && planCost) {
                addons.push({
                  planName: planName,
                  planCost: planCost,
                  planNumber: i.toString(),
                  provider: provider
                });
              }
            }
          }
        });
        
        console.log("Processed addons:", addons.length);
        
        // Group addons by provider for better organization
        const addonsByProvider = {
          "American Financial 1": addons.filter(a => a.provider === "American Financial 1"),
          "American Financial 2": addons.filter(a => a.provider === "American Financial 2"),
          "American Financial 3": addons.filter(a => a.provider === "American Financial 3")
        };
        
        console.log("Addons by provider:", {
          "AF1": addonsByProvider["American Financial 1"].length,
          "AF2": addonsByProvider["American Financial 2"].length,
          "AF3": addonsByProvider["American Financial 3"].length
        });
        
        setAvailableAddons(addons);
      } else {
        setAvailableAddons([]);
      }
    } catch (error) {
      console.error('Error fetching addon data:', error);
      setAvailableAddons([]);
    } finally {
      setLoadingAddons(false);
    }
  }, [selectedType]); // Only depend on selectedType

  // Initial data fetch - only run once
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
        
        console.log("Raw data from Airtable:", data.records.length, "records");
        
        // Process the data to organize by type
        const dataByType: Record<string, CarrierData> = {};
        
        data.records.forEach(record => {
          const type = record.fields.Type;
          const carrier = record.fields.Carriers;
          
          // Set hasAddons at the type level for any record with add-ons first, before filtering
          if (record.fields["Addons?"]) {
            if (!dataByType[type]) {
              dataByType[type] = {
                carriers: [],
                hasAddons: false,
                plans: {}
              };
            }
            dataByType[type].hasAddons = true;
            console.log("Found add-ons for type:", type, "with carrier:", carrier);
          }
          
          // Skip records that are American Financial addons
          if (!carrier || carrier.toLowerCase().includes('american financial')) {
            return;
          }
          
          if (!dataByType[type]) {
            dataByType[type] = {
              carriers: [],
              hasAddons: false,
              plans: {}
            };
          }
          
          if (!dataByType[type].carriers.includes(carrier)) {
            dataByType[type].carriers.push(carrier);
            dataByType[type].plans[carrier] = {
              planNames: [],
              planCosts: []
            };
          }
          
          // Add plans for this carrier if they exist
          for (let i = 1; i <= 8; i++) {
            const planKey = `Plan ${i}`;
            const planCostKey = `Plan ${i} Cost`;
            
            if (record.fields[planKey] && record.fields[planCostKey]) {
              const planName = String(record.fields[planKey]).trim();
              const planCost = String(record.fields[planCostKey]).trim();
              
              // Only add if we have both a plan name and cost
              if (planName && planCost) {
                if (!dataByType[type].plans[carrier].planNames.includes(planName)) {
                  dataByType[type].plans[carrier].planNames.push(planName);
                  dataByType[type].plans[carrier].planCosts.push(planCost);
                }
              }
            }
          }
        });
        
        // Mark types that have American Financial addons
        data.records.forEach(record => {
          const type = record.fields.Type;
          const carrier = record.fields.Carriers;
          
          if (carrier && carrier.includes('American Financial') && dataByType[type]) {
            dataByType[type].hasAddons = true;
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
        
        console.log("Processed data by type:", Object.keys(dataByType));
        setAllData(dataByType);
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
  }, []); // Only run once on component mount

  // Update carriers when selected type changes
  useEffect(() => {
    if (selectedType && allData[selectedType]) {
      console.log("Type changed to:", selectedType);
      console.log("Available carriers:", allData[selectedType].carriers);
      
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
      console.log("Type", selectedType, "has add-ons:", hasAddons);
      if (hasAddons) {
        console.log("Type has add-ons, fetching them...");
        fetchAddonData();
      }
    } else {
      setCarriers([]);
    }
  }, [selectedType, allData, setValue, fetchAddonData]);

  // Update plans when selected carrier changes - separate from type changes
  useEffect(() => {
    if (selectedType && selectedCarrier && allData[selectedType]?.plans[selectedCarrier]) {
      console.log("Setting up plans for carrier:", selectedCarrier);
      console.log("Available plans:", allData[selectedType].plans[selectedCarrier].planNames);
      
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
    } else if (selectedCarrier) {
      // Only clear if carrier is selected but no plans are found
      setAvailablePlans([]);
      setPlanCosts({});
    }
  }, [selectedCarrier, selectedType, allData, setValue]);

  // Update plan cost when plan changes
  const handlePlanChange = (planName: string) => {
    console.log("Plan selected:", planName);
    console.log("Available plan costs:", planCosts);
    
    const cost = planCosts[planName] || "";
    console.log("Setting plan cost to:", cost);
    
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
                onValueChange={(value) => {
                  console.log("Carrier selected:", value);
                  field.onChange(value);
                }} 
                value={field.value}
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
        hasAddons: selectedType ? allData[selectedType]?.hasAddons : false,
        availableAddons: availableAddons.length
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
                <div className="space-y-6">
                  {/* American Financial 1 - AD&D Add-ons */}
                  {availableAddons.some(addon => addon.provider === "American Financial 1") && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm border-b pb-1">American Financial 1 - Accidental Death & Dismemberment</h5>
                      {availableAddons
                        .filter(addon => addon.provider === "American Financial 1")
                        .map((addon, index) => (
                          <div key={`${addon.provider}-${addon.planName}-${index}`} className="flex items-center space-x-2 border-b pb-2">
                            <Checkbox 
                              id={`addon-${addon.provider}-${index}`}
                              checked={selectedAddons.includes(addon.planName)}
                              onCheckedChange={(checked) => 
                                handleAddonSelection(addon.planName, checked === true)
                              }
                            />
                            <div className="space-y-1">
                              <label 
                                htmlFor={`addon-${addon.provider}-${index}`} 
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {addon.planName}
                              </label>
                              <p className="text-xs text-gray-500">Cost: ${addon.planCost}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                  
                  {/* American Financial 2 - AME Add-ons */}
                  {availableAddons.some(addon => addon.provider === "American Financial 2") && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm border-b pb-1">American Financial 2 - Accident Medical Expense</h5>
                      {availableAddons
                        .filter(addon => addon.provider === "American Financial 2")
                        .map((addon, index) => (
                          <div key={`${addon.provider}-${addon.planName}-${index}`} className="flex items-center space-x-2 border-b pb-2">
                            <Checkbox 
                              id={`addon-${addon.provider}-${index}`}
                              checked={selectedAddons.includes(addon.planName)}
                              onCheckedChange={(checked) => 
                                handleAddonSelection(addon.planName, checked === true)
                              }
                            />
                            <div className="space-y-1">
                              <label 
                                htmlFor={`addon-${addon.provider}-${index}`} 
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {addon.planName}
                              </label>
                              <p className="text-xs text-gray-500">Cost: ${addon.planCost}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                  
                  {/* American Financial 3 - Critical Illness Add-ons */}
                  {availableAddons.some(addon => addon.provider === "American Financial 3") && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm border-b pb-1">American Financial 3 - Critical Illness</h5>
                      {availableAddons
                        .filter(addon => addon.provider === "American Financial 3")
                        .map((addon, index) => (
                          <div key={`${addon.provider}-${addon.planName}-${index}`} className="flex items-center space-x-2 border-b pb-2">
                            <Checkbox 
                              id={`addon-${addon.provider}-${index}`}
                              checked={selectedAddons.includes(addon.planName)}
                              onCheckedChange={(checked) => 
                                handleAddonSelection(addon.planName, checked === true)
                              }
                            />
                            <div className="space-y-1">
                              <label 
                                htmlFor={`addon-${addon.provider}-${index}`} 
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {addon.planName}
                              </label>
                              <p className="text-xs text-gray-500">Cost: ${addon.planCost}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                  
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

