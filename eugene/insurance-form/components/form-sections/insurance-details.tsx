import { useFormContext, useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState, useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define types for the Airtable response
interface AirtableRecord {
  id: string;
  fields: {
    Type: string;
    Carriers: string;
    "Plan 1"?: string;
    "Plan 1 Cost"?: string;
    "Plan 1 Commission"?: string;
    "Plan 2"?: string;
    "Plan 2 Cost"?: string;
    "Plan 2 Commission"?: string;
    "Plan 3"?: string;
    "Plan 3 Cost"?: string;
    "Plan 3 Commission"?: string;
    "Plan 4"?: string;
    "Plan 4 Cost"?: string;
    "Plan 4 Commission"?: string;
    "Plan 5"?: string;
    "Plan 5 Cost"?: string;
    "Plan 5 Commission"?: string;
    "Plan 6"?: string;
    "Plan 6 Cost"?: string;
    "Plan 6 Commission"?: string;
    "Plan 7"?: string;
    "Plan 7 Cost"?: string;
    "Plan 7 Commission"?: string;
    "Plan 8"?: string;
    "Plan 8 Cost"?: string;
    "Plan 8 Commission"?: string;
    "Addons?"?: boolean;
    "Enrollment Fees"?: string;
    "States Unavailable"?: string[];
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
      planCommissions: string[];
    }
  };
}

interface AddonPlan {
  planName: string;
  planCost: string;
  planCommission: string;
  planNumber: string;
  provider: string; // Make provider required to ensure it's always defined
  addonType: string;
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

// Utility functions for state-based filtering
function getExcludedStates(planName: string): string[] {
  const match = planName.match(/\(N\/A\s+([A-Z,\s]+)\)/);
  if (match && match[1]) {
    return match[1].split(',').map(state => state.trim());
  }
  return [];
}

function isPlanAvailableInState(planName: string, selectedState: string): boolean {
  if (!selectedState) return true; // If no state is selected, show all plans
  const excludedStates = getExcludedStates(planName);
  return !excludedStates.includes(selectedState);
}

// Helper function to get state name from code for UI display
function getStateNameFromCode(stateCode: string): string {
  const stateMap: Record<string, string> = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
    "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri",
    "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
    "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
    "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont",
    "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
  };
  return stateMap[stateCode] || stateCode;
}

// Add new helper functions/variables at the top level

// Add a function to calculate enrollment commission based on fee
const calculateEnrollmentCommission = (enrollmentFee: string): number => {
  // First, try exact string match for common values
  if (enrollmentFee === "99") return 10;
  if (enrollmentFee === "125") return 15;
  
  // Then parse for numeric comparison
  const feeValue = parseFloat(enrollmentFee.replace(/[^0-9.]/g, '')) || 0;
  
  console.log("Calculating enrollment commission for fee:", enrollmentFee, "parsed value:", feeValue);
  
  // Set commission based on specific fee amounts
  if (feeValue < 99) {
    console.log("Fee < 99, commission = 0");
    return 0;
  }
  if (Math.abs(feeValue - 99) < 0.01) {
    console.log("Fee ≈ 99, commission = 10");
    return 10;
  }
  if (Math.abs(feeValue - 125) < 0.01) {
    console.log("Fee ≈ 125, commission = 15");
    return 15;
  }
  
  // Default to 0 for any other values
  console.log("Fee doesn't match any specific case, commission = 0");
  return 0;
};

// InfoTooltip component for showing breakdowns
const InfoTooltip = ({ 
  items, 
  className 
}: { 
  items: { label: string; value: string }[];
  className?: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className={`ml-1 text-muted-foreground cursor-help ${className}`}>ⓘ</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          <div className="space-y-1 text-xs">
            <div className="font-semibold border-b pb-1">Breakdown</div>
            {items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.label}:</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function InsuranceDetails() {
  const { control, setValue, watch } = useFormContext()
  const [carriers, setCarriers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [allData, setAllData] = useState<Record<string, CarrierData>>({})
  const [availablePlans, setAvailablePlans] = useState<string[]>([])
  const [planCosts, setPlanCosts] = useState<Record<string, string>>({})
  
  // Add state for Access Health STM
  const [isAccessHealthSelected, setIsAccessHealthSelected] = useState(false)
  const [manualPlanCost, setManualPlanCost] = useState("")
  
  // Addon states
  const [loadingAddons, setLoadingAddons] = useState(false)
  const [addonsEnabled, setAddonsEnabled] = useState(false)
  const [addonData, setAddonData] = useState<AddonData>({})
  const [availableAddons, setAvailableAddons] = useState<AddonPlan[]>([])
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [addonsTotalCost, setAddonsTotalCost] = useState<string>("0")
  
  // [X] Commission states
  const [planCommission, setPlanCommission] = useState<string>("0")
  const [planCommissions, setPlanCommissions] = useState<Record<string, string>>({})
  const [addonCommissions, setAddonCommissions] = useState<Record<string, string>>({})
  const [addonsTotalCommission, setAddonsTotalCommission] = useState<string>("0")
  const [totalCommission, setTotalCommission] = useState<string>("0")
  
  // Add state for tooltip breakdowns
  const [addonCostBreakdown, setAddonCostBreakdown] = useState<{ label: string; value: string }[]>([])
  const [addonCommissionBreakdown, setAddonCommissionBreakdown] = useState<{ label: string; value: string }[]>([])
  const [firstMonthBreakdown, setFirstMonthBreakdown] = useState<{ label: string; value: string }[]>([])
  const [totalCommissionBreakdown, setTotalCommissionBreakdown] = useState<{ label: string; value: string }[]>([])
  
  // State for insurance types
  const [insuranceTypes, setInsuranceTypes] = useState<string[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  
  // Add state to track enrollment fees for plans
  const [planEnrollmentFees, setPlanEnrollmentFees] = useState<Record<string, string>>({})
  
  // Add state for enrollment fee options by carrier
  const [enrollmentFeeOptions, setEnrollmentFeeOptions] = useState<string[]>([])
  const [selectedEnrollmentFee, setSelectedEnrollmentFee] = useState<string>("")
  
  // Add state to store the raw Airtable data
  const [airtableData, setAirtableData] = useState<AirtableRecord[]>([])
  
  // Watch for changes to the type of insurance and carrier
  const selectedType = useWatch({
    control,
    name: "insuranceDetails.typeOfInsurance",
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

  // Add watch for selected state
  const selectedState = useWatch({
    control,
    name: "insuranceDetails.insuranceState",
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
      
      // Check if Access Health STM is selected
      const isAccessHealth = selectedCarrier === "Access Health STM";
      setIsAccessHealthSelected(isAccessHealth);
      
      // Reset manual cost input when switching carriers
      if (!isAccessHealth) {
        setManualPlanCost("");
      }
    }
  }, [selectedCarrier]);

  useEffect(() => {
    if (selectedPlan) {
      console.log("Plan selected:", selectedPlan);
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (selectedState) {
      console.log("Insurance State selected:", selectedState);
    }
  }, [selectedState]);

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
      
      // Filter records to find addons for the selected type
      const addonRecords = data.records.filter((record: AirtableRecord) => {
        return record.fields.Type === selectedType && 
               record.fields.Carriers && 
               (record.fields.Carriers.includes('American Financial') || 
                record.fields.Carriers.includes('Essential Care Individual') ||
                record.fields.Carriers.includes('AMT Addons') ||
                record.fields.Carriers.includes('Leo Addons') ||
                record.fields.Carriers.includes('Addons')); // Also include any carrier with "Addons" in the name
      });
      
      console.log("Addon records found for type", selectedType, ":", addonRecords.length);
      
      if (addonRecords.length > 0) {
        const addons: AddonPlan[] = [];
        
        // Process each addon record
        addonRecords.forEach((record: AirtableRecord) => {
          const carrier = record.fields.Carriers;
          let provider = carrier; // Use the full carrier name as provider
          let addonType = '';
          
          // Extract addon number and type based on carrier name
          let addonNumber = '1';
          
          if (carrier.includes('American Financial')) {
            addonType = 'American Financial';
            if (carrier.includes(' 1')) addonNumber = '1';
            if (carrier.includes(' 2')) addonNumber = '2';
            if (carrier.includes(' 3')) addonNumber = '3';
          } else if (carrier.includes('Essential Care Individual')) {
            addonType = 'Essential Care';
            addonNumber = '1';
          } else if (carrier.includes('AMT Addons')) {
            addonType = 'AMT';
            if (carrier.includes(' 1')) addonNumber = '1';
            if (carrier.includes(' 2')) addonNumber = '2';
          } else if (carrier.includes('Leo Addons')) {
            addonType = 'Leo';
            addonNumber = '1';
          } else {
            // Extract addon type from the carrier name for any other carriers
            const carrierName = carrier;
            // Try to extract the type (text before "Addons" or before a number)
            const typeMatch = carrierName.match(/^(.*?)\s+(?:Addons|\d)/i);
            addonType = typeMatch ? typeMatch[1].trim() : 'Other';
            
            // Try to extract the number if present
            const numberMatch = carrierName.match(/\s+(\d+)\s*$/);
            addonNumber = numberMatch ? numberMatch[1] : '1';
          }
          
          // Process each plan in the record (up to 11 plans)
          for (let i = 1; i <= 11; i++) {
            const planKey = `Plan ${i}`;
            const planCostKey = `Plan ${i} Cost`;
            const planCommissionKey = `Plan ${i} Commission`;
            
            if (record.fields[planKey] && record.fields[planCostKey]) {
              // Clean up the plan name and cost
              const planName = String(record.fields[planKey]).replace(/\s+/g, ' ').trim();
              const planCost = String(record.fields[planCostKey]).replace(/\$+/g, '').trim();
              
              // Handle commission values properly
              let planCommission = "0";
              if (record.fields[planCommissionKey]) {
                const commissionValue = record.fields[planCommissionKey];
                if (typeof commissionValue === 'string') {
                  planCommission = commissionValue.replace(/\$+/g, '').trim();
                } else if (typeof commissionValue === 'number') {
                  planCommission = commissionValue.toString();
                }
              }
              
              // Check if the plan is available in the selected state
              if (planName && planCost && isPlanAvailableInState(planName, selectedState)) {
                addons.push({
                  planName: planName,
                  planCost: planCost,
                  planCommission: planCommission,
                  planNumber: i.toString(),
                  provider: provider,
                  addonType: addonType
                });
              }
            }
          }
        });
        
        console.log("Processed addons:", addons.length);
        
        // Group addons by provider for better organization
        const addonsByProvider: Record<string, AddonPlan[]> = {
          "American Financial 1": addons.filter(a => a.provider === "American Financial 1"),
          "American Financial 2": addons.filter(a => a.provider === "American Financial 2"),
          "American Financial 3": addons.filter(a => a.provider === "American Financial 3"),
          "Essential Care Individual": addons.filter(a => a.provider === "Essential Care Individual"),
          "AMT Addons 1": addons.filter(a => a.provider === "AMT Addons 1"),
          "AMT Addons 2": addons.filter(a => a.provider === "AMT Addons 2"),
          "Leo Addons": addons.filter(a => a.provider === "Leo Addons")
        };
        
        // Add any other providers that might have been found
        addons.forEach(addon => {
          if (addon.provider && !addonsByProvider[addon.provider]) {
            addonsByProvider[addon.provider] = addons.filter(a => a.provider === addon.provider);
          }
        });
        
        console.log("Addons by provider:", {
          "AF1": addonsByProvider["American Financial 1"].length,
          "AF2": addonsByProvider["American Financial 2"].length,
          "AF3": addonsByProvider["American Financial 3"].length,
          "Essential Care": addonsByProvider["Essential Care Individual"].length,
          "AMT1": addonsByProvider["AMT Addons 1"].length,
          "AMT2": addonsByProvider["AMT Addons 2"].length,
          "Leo": addonsByProvider["Leo Addons"].length
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
  }, [selectedType, selectedState]); // Add selectedState as a dependency

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
        
        // Store the raw data for later use
        setAirtableData(data.records);
        
        console.log("Raw data from Airtable:", data.records.length, "records");
        
        // Process the data to organize by type
        const dataByType: Record<string, CarrierData> = {};
        
        // Collect all enrollment fees by carrier
        const allEnrollmentFeesByCarrier: Record<string, Set<string>> = {};
        
        data.records.forEach(record => {
          const type = record.fields.Type;
          const carrier = record.fields.Carriers;
          
          // Track enrollment fees by carrier
          if (carrier && record.fields["Enrollment Fees"]) {
            if (!allEnrollmentFeesByCarrier[carrier]) {
              allEnrollmentFeesByCarrier[carrier] = new Set();
            }
            allEnrollmentFeesByCarrier[carrier].add(record.fields["Enrollment Fees"]);
          }
          
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
          
          // Skip records that are add-ons (American Financial, Essential Care Individual, or AMT Addons)
          if (!carrier || 
              carrier.toLowerCase().includes('american financial') || 
              carrier.toLowerCase().includes('essential care individual') || 
              carrier.toLowerCase().includes('amt addons') ||
              carrier.toLowerCase().includes('leo addons') ||  // Add Leo Addons to the exclusion list
              carrier.toLowerCase().includes('addons')) {      // Exclude any carriers with "addons" in the name
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
              planCosts: [],
              planCommissions: []
            };
          }
          
          // Add plans for this carrier if they exist
          for (let i = 1; i <= 8; i++) {
            const planKey = `Plan ${i}`;
            const planCostKey = `Plan ${i} Cost`;
            const planCommissionKey = `Plan ${i} Commission`;
            
            if (record.fields[planKey] && record.fields[planCostKey]) {
              const planName = String(record.fields[planKey]).trim();
              const planCost = String(record.fields[planCostKey]).trim();
              const planCommission = record.fields[planCommissionKey] 
                ? String(record.fields[planCommissionKey]).trim() 
                : "0";
              
              // Only add if we have both a plan name and cost
              if (planName && planCost) {
                if (!dataByType[type].plans[carrier].planNames.includes(planName)) {
                  dataByType[type].plans[carrier].planNames.push(planName);
                  dataByType[type].plans[carrier].planCosts.push(planCost);
                  dataByType[type].plans[carrier].planCommissions.push(planCommission);
                }
              }
            }
          }
        });
        
        // Store enrollment fee options for easy access
        console.log("Enrollment fees by carrier:", allEnrollmentFeesByCarrier);
        
        // Mark types that have any addons (American Financial, Essential Care, AMT, Leo, etc.)
        data.records.forEach(record => {
          const type = record.fields.Type;
          const carrier = record.fields.Carriers;
          
          if (carrier && dataByType[type] && (
              carrier.includes('American Financial') || 
              carrier.includes('Essential Care Individual') || 
              carrier.includes('AMT Addons') ||
              carrier.includes('Leo Addons') ||
              carrier.toLowerCase().includes('addons')
          )) {
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
      setValue("insuranceDetails.planCommission", ""); // [X] Clear plan commission
      setValue("insuranceDetails.commissionRate", ""); // Add commission rate field
      setValue("insuranceDetails.hasAddons", false);
      setValue("insuranceDetails.selectedAddons", []);
      setValue("insuranceDetails.addonsCost", "");
      setValue("insuranceDetails.addonsCommission", ""); // [X] Clear addons commission
      setValue("insuranceDetails.totalCommission", "0"); // [X] Clear total commission
      setAvailablePlans([]);
      setAddonsEnabled(false);
      setSelectedAddons([]);
      setAddonsTotalCost("0");
      setAddonsTotalCommission("0"); // [X] Reset addon commission
      setPlanCommission("0"); // [X] Reset plan commission
      setTotalCommission("0"); // [X] Reset total commission
      
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

  // Handle state changes - re-filter plans and add-ons when state changes
  useEffect(() => {
    if (selectedState) {
      console.log("State changed to:", selectedState);
      
      // If carrier and type are selected, re-filter plans
      if (selectedType && selectedCarrier && allData[selectedType]?.plans[selectedCarrier]) {
        // This will be handled by the updated carrier effect
      }
      
      // If add-ons are enabled, re-fetch add-ons with state filtering
      if (selectedType && allData[selectedType]?.hasAddons) {
        fetchAddonData();
        
        // Clear add-on selections since available options may have changed
        setSelectedAddons([]);
        setAddonsTotalCost("0");
        setAddonsTotalCommission("0");
        setValue("insuranceDetails.selectedAddons", []);
        setValue("insuranceDetails.addonsCost", "0");
        setValue("insuranceDetails.addonsCommission", "0");
        
        // Recalculate total commission
        calculateTotalCommission(planCommission, selectedAddons);
      }
    }
  }, [selectedState, selectedType, selectedCarrier, allData, fetchAddonData, setValue, planCommission]);

  // Update plans when selected carrier changes - separate from type changes
  useEffect(() => {
    if (selectedType && selectedCarrier && allData[selectedType]?.plans[selectedCarrier]) {
      console.log("Setting up plans for carrier:", selectedCarrier);
      
      // Get all plans for the carrier
      const allPlans = allData[selectedType].plans[selectedCarrier].planNames;
      console.log("All plans before filtering:", allPlans);
      
      // Filter plans based on state availability
      const availablePlansForState = allPlans.filter(planName => 
        isPlanAvailableInState(planName, selectedState)
      );
      
      console.log("Available plans after state filtering:", availablePlansForState);
      setAvailablePlans(availablePlansForState);
      
      // Create a mapping of plan names to costs and commissions
      const costMap: Record<string, string> = {};
      const commissionMap: Record<string, string> = {}; // [X] Added commission mapping
      const enrollmentMap: Record<string, string> = {};
      
      availablePlansForState.forEach(plan => {
        // Find the index of the plan in the original array
        const planIndex = allData[selectedType].plans[selectedCarrier].planNames.indexOf(plan);
        
        // Ensure cost is a string and properly formatted
        const rawCost = allData[selectedType].plans[selectedCarrier].planCosts[planIndex];
        const costStr = typeof rawCost === 'object' ? 
          JSON.stringify(rawCost) : 
          (typeof rawCost === 'string' ? rawCost : String(rawCost));
        
        // Clean up the cost string to ensure it's just a number or formatted currency
        const cleanCost = costStr.replace(/[^0-9.]/g, '');
        costMap[plan] = cleanCost ? `$${cleanCost}` : "0";
        
        // Handle commission similarly
        const rawCommission = allData[selectedType].plans[selectedCarrier].planCommissions[planIndex];
        const commissionStr = typeof rawCommission === 'object' ? 
          JSON.stringify(rawCommission) : 
          (typeof rawCommission === 'string' ? rawCommission : String(rawCommission || "0"));
        
        // Check if commission is in decimal format (e.g., 0.30, 0.35)
        const commissionValue = parseFloat(commissionStr.replace(/[^0-9.]/g, ''));
        
        // If commission is in decimal format (between 0 and 1), convert to percentage
        // Otherwise, use the value as is
        const finalCommission = (commissionValue > 0 && commissionValue <= 1) ? 
          (commissionValue * 100).toString() : 
          commissionStr.replace(/[^0-9.]/g, '');
        
        commissionMap[plan] = finalCommission || "0"; // [X] Map commissions
        
        // Find the record for this plan in the raw data
        const planNumberForSearch = planIndex + 1;
        airtableData.forEach((record: AirtableRecord) => {
          if (record.fields.Type === selectedType && 
              record.fields.Carriers === selectedCarrier &&
              record.fields[`Plan ${planNumberForSearch}`] === plan) {
            if (record.fields['Enrollment Fees']) {
              enrollmentMap[plan] = record.fields['Enrollment Fees'];
            }
          }
        });
      });
      
      console.log("Processed cost map:", costMap);
      console.log("Processed commission map:", commissionMap);
      console.log("Processed enrollment fees map:", enrollmentMap);
      
      setPlanCosts(costMap);
      setPlanCommissions(commissionMap); // [X] Set commission mapping
      setPlanEnrollmentFees(enrollmentMap);
      
      // Clear plan selection when carrier changes or if the current plan is no longer available
      if (selectedPlan && !availablePlansForState.includes(selectedPlan)) {
        setValue("insuranceDetails.plan", "");
        setValue("insuranceDetails.planCost", "");
        setValue("insuranceDetails.planCommission", ""); // [X] Clear plan commission
      }
    } else if (selectedCarrier === "Access Health STM") {
      // Special handling for Access Health STM
      console.log("Access Health STM selected, providing custom plan options");
      
      // Set a single placeholder plan for Access Health STM
      setAvailablePlans(["Custom Plan"]);
      
      // Clear plan selection and costs
      setValue("insuranceDetails.plan", "Custom Plan");
      setValue("insuranceDetails.planCost", "");
      setValue("insuranceDetails.planCommission", "");
      setValue("insuranceDetails.commissionRate", "");
      setPlanCosts({});
      setPlanCommissions({});
    } else if (selectedCarrier) {
      // Only clear if carrier is selected but no plans are found
      setAvailablePlans([]);
      setPlanCosts({});
      setPlanCommissions({}); // [X] Clear commission mapping
    }
  }, [selectedCarrier, selectedType, selectedState, allData, setValue, selectedPlan]); // Add selectedState as a dependency

  // Update plan cost and commission when plan changes
  const handlePlanChange = (planName: string) => {
    console.log("Plan selected:", planName);
    
    // Skip normal plan cost handling if Access Health STM is selected
    if (isAccessHealthSelected) {
      console.log("Access Health STM selected, using manual cost entry");
      return;
    }
    
    const cost = planCosts[planName] || "";
    let commissionRate = planCommissions[planName] || "0";
    
    // Log commission data for debugging
    console.log("Raw commission rate:", commissionRate, "Type:", typeof commissionRate);
    
    // Special handling for Sigma Care Plus and other carriers with decimal commissions
    if (parseFloat(commissionRate) > 0) {
      // Commission rate is already handled above where we create the commissionMap
      console.log("Using existing commission rate:", commissionRate);
    } else {
      // Fallback to a default commission if no valid rate is found
      console.log("No valid commission rate found, using default");
      commissionRate = selectedCarrier.toLowerCase().includes("sigma") ? "30" : "20";
    }
    
    // Use the selected enrollment fee from dropdown instead of planEnrollmentFees
    const enrollmentFee = selectedEnrollmentFee || "0";
    
    // Calculate enrollment commission
    const enrollmentCommission = calculateEnrollmentCommission(enrollmentFee);
    
    // Debug the cost value
    console.log("Raw cost value:", cost, "Type:", typeof cost);
    console.log("Enrollment fee:", enrollmentFee);
    
    // Use the cost as the formatted cost - it's already formatted
    const formattedCost = cost;
    
    // Extract the numeric value for calculations
    const costValue = parseFloat(cost.replace(/[^0-9.]/g, ''));
    const enrollmentFeeValue = parseFloat(enrollmentFee.replace(/[^0-9.]/g, '') || "0");
    
    // Get add-ons cost value (extract numeric portion)
    const addonsCostValue = parseFloat(addonsTotalCost.replace(/[^0-9.]/g, '') || "0");
    
    // Calculate commission as a dollar amount
    let calculatedCommission = `$${(parseFloat(commissionRate) * 0.01 * costValue).toFixed(2)}`;
    let displayRate = commissionRate + "%";
    
    // Calculate first month premium (cost + enrollment fee + add-ons)
    const firstMonthPremium = costValue + enrollmentFeeValue + addonsCostValue;
    
    // Calculate monthly premium (cost + add-ons)
    const monthlyPremium = costValue + addonsCostValue;
    
    // Update first month premium breakdown for tooltip
    const firstMonthBreakdownItems = [
      { label: "Plan Cost", value: formattedCost }
    ];
    
    if (enrollmentFeeValue > 0) {
      firstMonthBreakdownItems.push({ 
        label: "Enrollment Fee", 
        value: `$${enrollmentFeeValue.toFixed(2)}` 
      });
    }
    
    if (addonsCostValue > 0) {
      firstMonthBreakdownItems.push({
        label: "Add-ons", 
        value: addonsTotalCost
      });
    }
    
    setFirstMonthBreakdown(firstMonthBreakdownItems);
    
    console.log("Setting plan cost to:", formattedCost);
    console.log("Commission rate:", commissionRate);
    console.log("Calculated commission:", calculatedCommission);
    console.log("Enrollment fee:", `$${enrollmentFee}`);
    console.log("First month premium:", `$${firstMonthPremium.toFixed(2)}`);
    console.log("Monthly premium:", `$${monthlyPremium.toFixed(2)}`);
    
    setValue("insuranceDetails.planCost", formattedCost);
    setValue("insuranceDetails.commissionRate", displayRate);
    setValue("insuranceDetails.planCommission", calculatedCommission);
    setValue("insuranceDetails.enrollmentFee", `$${enrollmentFee}`);
    setValue("insuranceDetails.enrollmentFeeCommission", `$${enrollmentCommission.toFixed(2)}`);
    setValue("insuranceDetails.firstMonthPremium", `$${firstMonthPremium.toFixed(2)}`);
    setValue("insuranceDetails.monthlyPremium", `$${monthlyPremium.toFixed(2)}`);
    setPlanCommission(calculatedCommission);
    
    // Calculate total commission (plan + addons)
    calculateTotalCommission(calculatedCommission, selectedAddons);
  };

  // Handle addon checkbox change
  const handleAddonsToggle = (checked: boolean) => {
    setAddonsEnabled(checked);
    setValue("insuranceDetails.hasAddons", checked);
    
    if (!checked) {
      setSelectedAddons([]);
      setAddonsTotalCost("0");
      setAddonsTotalCommission("0"); // [X] Reset addon commission
      setValue("insuranceDetails.selectedAddons", []);
      setValue("insuranceDetails.addonsCost", "0");
      setValue("insuranceDetails.addonsCommission", "0"); // [X] Reset addon commission in form
      
      // Clear the American Financial plan names
      setValue("insuranceDetails.americanFinancial1Plan", "");
      setValue("insuranceDetails.americanFinancial2Plan", "");
      setValue("insuranceDetails.americanFinancial3Plan", "");
      
      // Recalculate total commission with just the plan commission
      calculateTotalCommission(planCommission, []); // [X] Update total commission
      
      // Update premiums to remove add-ons
      updatePremiumsWithAddons();
    }
  };

  // Handle addon selection for radio buttons (original providers)
  const handleAddonSelectionRadio = (provider: string, addonName: string) => {
    handleAddonSelection(provider, addonName, true);
  };

  // Handle addon selection
  const handleAddonSelection = (provider: string, addonName: string, checked: boolean) => {
    // Create a unique identifier that includes both the name and provider
    const addonIdentifier = `${provider}:${addonName}`;
    
    let updatedAddons = [...selectedAddons];
    
    if (checked) {
      // Add the addon if it's not already selected
      if (!updatedAddons.includes(addonIdentifier)) {
        updatedAddons.push(addonIdentifier);
      }
    } else {
      // Remove the addon if it's selected
      updatedAddons = updatedAddons.filter(addon => addon !== addonIdentifier);
    }
    
    setSelectedAddons(updatedAddons);
    setValue("insuranceDetails.selectedAddons", updatedAddons);
    
    // Calculate total cost and commission
    const { totalCost, totalCommission } = calculateAddonsValues(updatedAddons);
    setAddonsTotalCost(totalCost);
    setAddonsTotalCommission(totalCommission);
    
    setValue("insuranceDetails.addonsCost", totalCost);
    setValue("insuranceDetails.addonsCommission", totalCommission);
    
    // Special handling for American Financial
    if (provider === "American Financial") {
      const americanFinancialAddons = updatedAddons.filter(addon => 
        addon.startsWith("American Financial:")
      );
      
      if (americanFinancialAddons.length > 0) {
        // ... existing American Financial code ...
      } else {
        // Clear American Financial values if none selected
        setValue("insuranceDetails.americanFinancialPlans", "");
        setValue("insuranceDetails.americanFinancialPremium", "");
        setValue("insuranceDetails.americanFinancialCommission", "");
      }
    }
    
    // Calculate overall total commission
    calculateTotalCommission(planCommission, updatedAddons);
    
    // Update monthly and first month premiums with add-ons
    updatePremiumsWithAddons();
  };

  // Handle addon selection for multiselect (Leo Addons)
  const handleMultiAddonSelection = (addonName: string, checked: boolean) => {
    // Create a unique identifier that includes both the name and provider
    const provider = "Leo Addons";
    const addonIdentifier = `${provider}:${addonName}`;
    
    let updatedAddons = [...selectedAddons];
    
    if (checked) {
      // Add the addon if it's not already selected
      if (!updatedAddons.includes(addonIdentifier)) {
        updatedAddons.push(addonIdentifier);
      }
    } else {
      // Remove the addon if it's selected
      updatedAddons = updatedAddons.filter(addon => addon !== addonIdentifier);
    }
    
    setSelectedAddons(updatedAddons);
    setValue("insuranceDetails.selectedAddons", updatedAddons);
    
    // Calculate total cost and commission
    const { totalCost, totalCommission } = calculateAddonsValues(updatedAddons);
    setAddonsTotalCost(totalCost);
    setAddonsTotalCommission(totalCommission);
    
    setValue("insuranceDetails.addonsCost", totalCost);
    setValue("insuranceDetails.addonsCommission", totalCommission);
    
    // Handle Leo Addons specifically
    const leoAddons = updatedAddons.filter(addon => 
      addon.startsWith("Leo Addons:")
    );
    
    if (leoAddons.length > 0) {
      // Collect Leo addon names, premiums, and commissions
      let leoPlans = "";
      let totalLeoPremium = 0;
      let totalLeoCommission = 0;
      
      leoAddons.forEach(addonIdentifier => {
        const addonName = addonIdentifier.split(":")[1];
        const addon = availableAddons.find(a => a.planName === addonName && a.provider === "Leo Addons");
        
        if (addon) {
          // Add to list of Leo plans
          leoPlans += (leoPlans ? ", " : "") + addonName;
          
          // Add premium
          const premiumValue = parseFloat(addon.planCost.replace(/[^0-9.]/g, ''));
          if (!isNaN(premiumValue)) {
            totalLeoPremium += premiumValue;
          }
          
          // Add commission
          const commissionValue = parseFloat(addon.planCommission.replace(/[^0-9.]/g, ''));
          if (!isNaN(commissionValue)) {
            // If commission is a percentage, calculate the actual value
            if (commissionValue <= 1) {
              totalLeoCommission += premiumValue * commissionValue;
            } else {
              totalLeoCommission += premiumValue * (commissionValue / 100);
            }
          }
        }
      });
      
      // Set Leo Addons values
      setValue("insuranceDetails.leoAddonsPlans", leoPlans);
      setValue("insuranceDetails.leoAddonsPremium", `$${totalLeoPremium.toFixed(2)}`);
      setValue("insuranceDetails.leoAddonsCommission", `$${totalLeoCommission.toFixed(2)}`);
    } else {
      // Clear Leo Addons values if none selected
      setValue("insuranceDetails.leoAddonsPlans", "");
      setValue("insuranceDetails.leoAddonsPremium", "");
      setValue("insuranceDetails.leoAddonsCommission", "");
    }
    
    // Calculate overall total commission
    calculateTotalCommission(planCommission, updatedAddons);
    
    // Update monthly and first month premiums with add-ons
    updatePremiumsWithAddons();
  };
  
  // Calculate total cost and commission of selected addons
  const calculateAddonsValues = (selectedAddons: string[]): { totalCost: string, totalCommission: string } => { // [X] Updated return type
    let totalCost = 0;
    let totalCommission = 0; // [X] Added commission total
    const costBreakdown: { label: string; value: string }[] = [];
    const commissionBreakdown: { label: string; value: string }[] = [];
    
    selectedAddons.forEach(selectedAddon => {
      // Parse the addon identifier (provider:name or just name)
      let addonName: string;
      let addonProvider: string | undefined;
      
      if (selectedAddon.includes(':')) {
        const [provider, name] = selectedAddon.split(':');
        addonProvider = provider;
        addonName = name;
      } else {
        addonName = selectedAddon;
      }
      
      // Find the addon in availableAddons
      const addon = availableAddons.find(a => 
        a.planName === addonName && 
        (!addonProvider || a.provider === addonProvider)
      );
      
      if (addon) {
        // Extract the cost value (remove $ and convert to number)
        const costString = typeof addon.planCost === 'string' ? 
          addon.planCost.replace(/[^0-9.]/g, '') : 
          String(addon.planCost).replace(/[^0-9.]/g, '');
        const cost = parseFloat(costString);
        
        // Extract the commission value as a rate
        const commissionRateString = addon.planCommission ? 
          (typeof addon.planCommission === 'string' ? 
            addon.planCommission.replace(/[^0-9.]/g, '') : 
            String(addon.planCommission).replace(/[^0-9.]/g, '')) : 
          "0";
        
        // Check if the commission is already a calculated value or a percentage rate
        let commissionValue;
        
        // If the commission value is very small (like 0.2) it's likely already a decimal percentage
        // If it's larger (like 20) it's likely a percentage that needs to be divided by 100
        const parsedCommission = parseFloat(commissionRateString);
        
        if (parsedCommission > 0 && parsedCommission <= 1) {
          // Already a decimal percentage (e.g., 0.2 for 20%)
          commissionValue = cost * parsedCommission;
          console.log(`Addon ${addon.planName}: Cost=${cost}, Rate=${parsedCommission * 100}% (decimal: ${parsedCommission}), Calculated=${commissionValue}`);
        } else {
          // Percentage that needs to be converted (e.g., 20 for 20%)
          const commissionRate = parsedCommission || 20; // Default to 20% if invalid
          const commissionRateDecimal = commissionRate / 100; // Convert percentage to decimal
          commissionValue = cost * commissionRateDecimal;
          console.log(`Addon ${addon.planName}: Cost=${cost}, Rate=${commissionRate}%, Calculated=${commissionValue}`);
        }
        
        if (!isNaN(cost)) {
          totalCost += cost;
          
          // Add to cost breakdown for tooltip
          costBreakdown.push({
            label: addonName,
            value: `$${cost.toFixed(2)}`
          });
          
          // Add the calculated commission
          if (!isNaN(commissionValue)) {
            totalCommission += commissionValue;
            
            // Add to commission breakdown for tooltip
            commissionBreakdown.push({
              label: addonName,
              value: `$${commissionValue.toFixed(2)}`
            });
          }
        }
      }
    });
    
    // Update the breakdown state variables
    setAddonCostBreakdown(costBreakdown);
    setAddonCommissionBreakdown(commissionBreakdown);
    
    // Format the result values
    const formattedTotalCost = `$${totalCost.toFixed(2)}`;
    const formattedTotalCommission = `$${totalCommission.toFixed(2)}`;
    
    // Update the form fields with the calculated values
    setValue("insuranceDetails.addonsCost", formattedTotalCost);
    setValue("insuranceDetails.addonsCommission", formattedTotalCommission);
    
    // Create return values
    const result = { 
      totalCost: formattedTotalCost,
      totalCommission: formattedTotalCommission
    };
    
    // Update premiums to reflect add-on changes
    // This needs to be scheduled after the state updates to ensure we have the latest values
    setTimeout(() => updatePremiumsWithAddons(), 0);
    
    return result;
  };
  
  // Calculate total cost of selected addons (legacy function kept for compatibility)
  const calculateAddonsCost = (selectedAddons: string[]): string => {
    const { totalCost } = calculateAddonsValues(selectedAddons);
    return totalCost;
  };
  
  // [X] Calculate total commission (plan + addons)
  const calculateTotalCommission = (planCommissionValue: string, selectedAddons: string[]) => {
    // Extract plan commission value
    const planCommissionNumber = parseFloat(planCommissionValue.replace(/[^0-9.]/g, '') || "0");
    
    // Get addon commissions
    const { totalCommission: addonCommissionValue } = calculateAddonsValues(selectedAddons);
    const addonCommissionNumber = parseFloat(addonCommissionValue.replace(/[^0-9.]/g, '') || "0");
    
    // Get enrollment commission
    const enrollmentCommissionValue = watch("insuranceDetails.enrollmentFeeCommission") || "$0";
    const enrollmentCommissionNumber = parseFloat(enrollmentCommissionValue.replace(/[^0-9.]/g, '') || "0");
    
    // Log commission values for debugging
    console.log("Commission calculation:", {
      plan: planCommissionNumber,
      addons: addonCommissionNumber,
      enrollment: enrollmentCommissionNumber,
      total: planCommissionNumber + addonCommissionNumber + enrollmentCommissionNumber
    });
    
    // Update the breakdown for the tooltip
    const breakdown = [
      { 
        label: "Plan Commission", 
        value: `$${planCommissionNumber.toFixed(2)}` 
      }
    ];
    
    if (addonCommissionNumber > 0) {
      breakdown.push({ 
        label: "Add-ons Commission", 
        value: `$${addonCommissionNumber.toFixed(2)}` 
      });
    }
    
    if (enrollmentCommissionNumber > 0) {
      breakdown.push({ 
        label: "Enrollment Commission", 
        value: `$${enrollmentCommissionNumber.toFixed(2)}` 
      });
    }
    
    setTotalCommissionBreakdown(breakdown);
    
    // Calculate total (plan + addons + enrollment)
    const total = planCommissionNumber + addonCommissionNumber + enrollmentCommissionNumber;
    const totalFormatted = `$${total.toFixed(2)}`;
    
    setTotalCommission(totalFormatted);
    setValue("insuranceDetails.totalCommission", totalFormatted);
  };
  
  // Check if an addon is selected
  const isAddonSelected = (addonName: string, provider?: string): boolean => {
    const addonIdentifier = provider ? `${provider}:${addonName}` : addonName;
    return selectedAddons.includes(addonIdentifier);
  };
  
  // Helper function to group addons by type
  const getAddonsByType = () => {
    // Group addons by provider type
    const groupedAddons: { [provider: string]: AddonPlan[] } = {};
    
    // Use availableAddons instead of undefined addons variable
    availableAddons.forEach(addon => {
      const provider = addon.provider || "Other";
      if (!groupedAddons[provider]) {
        groupedAddons[provider] = [];
      }
      groupedAddons[provider].push(addon);
    });
    
    return groupedAddons;
  };

  // Function to update premiums when add-ons change
  const updatePremiumsWithAddons = () => {
    const planCost = watch("insuranceDetails.planCost") || "$0";
    const planCostValue = parseFloat(planCost.replace(/[^0-9.]/g, '') || "0");
    const addonsCostValue = parseFloat(addonsTotalCost.replace(/[^0-9.]/g, '') || "0");
    const enrollmentFee = watch("insuranceDetails.enrollmentFee") || "$0";
    const enrollmentFeeValue = parseFloat(enrollmentFee.replace(/[^0-9.]/g, '') || "0");

    // Update monthly premium (plan + add-ons)
    const monthlyPremium = planCostValue + addonsCostValue;
    setValue("insuranceDetails.monthlyPremium", `$${monthlyPremium.toFixed(2)}`);

    // Update first month premium (plan + enrollment + add-ons)
    const firstMonthPremium = planCostValue + enrollmentFeeValue + addonsCostValue;
    setValue("insuranceDetails.firstMonthPremium", `$${firstMonthPremium.toFixed(2)}`);
    
    // Update first month premium breakdown
    const firstMonthBreakdownItems = [
      { label: "Plan Cost", value: planCost }
    ];
    
    if (enrollmentFeeValue > 0) {
      firstMonthBreakdownItems.push({ 
        label: "Enrollment Fee", 
        value: `$${enrollmentFeeValue.toFixed(2)}` 
      });
    }
    
    if (addonsCostValue > 0) {
      firstMonthBreakdownItems.push({
        label: "Add-ons", 
        value: addonsTotalCost
      });
    }
    
    setFirstMonthBreakdown(firstMonthBreakdownItems);
  };

  // Fetch insurance types
  useEffect(() => {
    const fetchInsuranceTypes = async () => {
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
        
        // Extract unique types from the data
        const types = [...new Set(data.records.map(record => record.fields.Type))];
        setInsuranceTypes(types);
      } catch (error) {
        console.error('Error fetching insurance types:', error);
        // Fallback to default values if API fails
        setInsuranceTypes(['Health', 'Life', 'Auto', 'Home']);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchInsuranceTypes();
  }, []);

  // Update enrollment fee options when carrier changes
  useEffect(() => {
    if (selectedCarrier) {
      // Collect all enrollment fees for this carrier from the airtable data
      const feeOptions = new Set<string>();
      
      airtableData.forEach((record: AirtableRecord) => {
        if (record.fields.Carriers === selectedCarrier && 
            record.fields["Enrollment Fees"]) {
          // Check if the enrollment fee is a comma-separated list
          const feeValue = record.fields["Enrollment Fees"];
          if (typeof feeValue === 'string' && feeValue.includes(',')) {
            // Split the comma-separated list into individual values
            const fees = feeValue.split(',').map(fee => fee.trim().replace(/^\$/, ''));
            fees.forEach(fee => {
              if (fee) feeOptions.add(fee);
            });
          } else {
            // Add the single value
            const fee = typeof feeValue === 'string' ? feeValue.replace(/^\$/, '') : String(feeValue);
            feeOptions.add(fee);
          }
        }
      });
      
      // Add default options if none found
      if (feeOptions.size === 0) {
        feeOptions.add("0");
        feeOptions.add("27.50");
        feeOptions.add("50");
        feeOptions.add("99");
        feeOptions.add("125");
      }
      
      // Convert set to array and sort
      const sortedOptions = Array.from(feeOptions).sort((a, b) => {
        // Convert to numbers for proper sorting
        const numA = parseFloat(a.replace(/[^0-9.]/g, ''));
        const numB = parseFloat(b.replace(/[^0-9.]/g, ''));
        return numA - numB;
      });
      
      console.log("Enrollment fee options for carrier", selectedCarrier, ":", sortedOptions);
      setEnrollmentFeeOptions(sortedOptions);
      
      // Set default enrollment fee (first option)
      if (sortedOptions.length > 0) {
        setSelectedEnrollmentFee(sortedOptions[0]);
        setValue("insuranceDetails.enrollmentFee", `$${sortedOptions[0]}`);
        const enrollmentCommission = calculateEnrollmentCommission(sortedOptions[0]);
        setValue("insuranceDetails.enrollmentFeeCommission", `$${enrollmentCommission.toFixed(2)}`);
      } else {
        setSelectedEnrollmentFee("");
        setValue("insuranceDetails.enrollmentFee", "$0");
        setValue("insuranceDetails.enrollmentFeeCommission", "$0");
      }
    }
  }, [selectedCarrier, airtableData, setValue]);

  // Handle enrollment fee change
  const handleEnrollmentFeeChange = (fee: string) => {
    setSelectedEnrollmentFee(fee);
    setValue("insuranceDetails.enrollmentFee", `$${fee}`);
    
    // Calculate enrollment commission
    const enrollmentCommission = calculateEnrollmentCommission(fee);
    setValue("insuranceDetails.enrollmentFeeCommission", `$${enrollmentCommission.toFixed(2)}`);
    
    // Recalculate first month premium
    if (selectedPlan) {
      const cost = planCosts[selectedPlan] || "0";
      const costValue = parseFloat(cost.replace(/[^0-9.]/g, ''));
      const enrollmentFeeValue = parseFloat(fee.replace(/[^0-9.]/g, '') || "0");
      const firstMonthPremium = costValue + enrollmentFeeValue;
      
      setValue("insuranceDetails.firstMonthPremium", `$${firstMonthPremium.toFixed(2)}`);
      
      // Recalculate total commission to include new enrollment commission
      calculateTotalCommission(planCommission, selectedAddons);
    }
  };

  return (
    <div className="space-y-4">
      {/* Insurance State Field */}
      <FormField
        control={control}
        name="insuranceDetails.insuranceState"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Insurance State <sub>[Airtable: Insurance State]</sub></FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Select Insurance State" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="AL">Alabama</SelectItem>
                <SelectItem value="AK">Alaska</SelectItem>
                <SelectItem value="AZ">Arizona</SelectItem>
                <SelectItem value="AR">Arkansas</SelectItem>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="CO">Colorado</SelectItem>
                <SelectItem value="CT">Connecticut</SelectItem>
                <SelectItem value="DE">Delaware</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="GA">Georgia</SelectItem>
                <SelectItem value="HI">Hawaii</SelectItem>
                <SelectItem value="ID">Idaho</SelectItem>
                <SelectItem value="IL">Illinois</SelectItem>
                <SelectItem value="IN">Indiana</SelectItem>
                <SelectItem value="IA">Iowa</SelectItem>
                <SelectItem value="KS">Kansas</SelectItem>
                <SelectItem value="KY">Kentucky</SelectItem>
                <SelectItem value="LA">Louisiana</SelectItem>
                <SelectItem value="ME">Maine</SelectItem>
                <SelectItem value="MD">Maryland</SelectItem>
                <SelectItem value="MA">Massachusetts</SelectItem>
                <SelectItem value="MI">Michigan</SelectItem>
                <SelectItem value="MN">Minnesota</SelectItem>
                <SelectItem value="MS">Mississippi</SelectItem>
                <SelectItem value="MO">Missouri</SelectItem>
                <SelectItem value="MT">Montana</SelectItem>
                <SelectItem value="NE">Nebraska</SelectItem>
                <SelectItem value="NV">Nevada</SelectItem>
                <SelectItem value="NH">New Hampshire</SelectItem>
                <SelectItem value="NJ">New Jersey</SelectItem>
                <SelectItem value="NM">New Mexico</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="NC">North Carolina</SelectItem>
                <SelectItem value="ND">North Dakota</SelectItem>
                <SelectItem value="OH">Ohio</SelectItem>
                <SelectItem value="OK">Oklahoma</SelectItem>
                <SelectItem value="OR">Oregon</SelectItem>
                <SelectItem value="PA">Pennsylvania</SelectItem>
                <SelectItem value="RI">Rhode Island</SelectItem>
                <SelectItem value="SC">South Carolina</SelectItem>
                <SelectItem value="SD">South Dakota</SelectItem>
                <SelectItem value="TN">Tennessee</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="UT">Utah</SelectItem>
                <SelectItem value="VT">Vermont</SelectItem>
                <SelectItem value="VA">Virginia</SelectItem>
                <SelectItem value="WA">Washington</SelectItem>
                <SelectItem value="WV">West Virginia</SelectItem>
                <SelectItem value="WI">Wisconsin</SelectItem>
                <SelectItem value="WY">Wyoming</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Type of Insurance Field */}
      <FormField
        control={control}
        name="insuranceDetails.typeOfInsurance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type of Insurance <sub>[Airtable: Type of Insurance]</sub></FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder={loadingTypes ? "Loading..." : "Select Type of Insurance"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {loadingTypes ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  insuranceTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="insuranceDetails.carrierU65"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Carrier U65 <sub>[Airtable: Carrier U65]</sub></FormLabel>
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
            <FormLabel>Plan <sub>[Airtable: Plan]</sub></FormLabel>
            <FormControl>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  // Special handling for Access Health STM - don't calculate cost from plans
                  if (!isAccessHealthSelected) {
                    handlePlanChange(value);
                  }
                }} 
                defaultValue={field.value}
                disabled={!selectedCarrier || (availablePlans.length === 0 && !isAccessHealthSelected)}
              >
                <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder={
                    loading 
                      ? "Loading..." 
                      : !selectedCarrier 
                        ? "Select Carrier first" 
                        : availablePlans.length === 0 
                          ? selectedState 
                            ? `No plans available in ${getStateNameFromCode(selectedState)}` 
                            : "No plans available" 
                          : "Select Plan"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : availablePlans.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {!selectedCarrier 
                        ? "Select Carrier first" 
                        : selectedState 
                          ? `No plans available in ${getStateNameFromCode(selectedState)}` 
                          : "No plans available"}
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
            <FormLabel>Plan Cost <sub>[Airtable: Carrier U65 Premium]</sub></FormLabel>
            <FormControl>
              {isAccessHealthSelected ? (
                <Input 
                  value={manualPlanCost} 
                  onChange={(e) => {
                    const value = e.target.value;
                    setManualPlanCost(value);
                    
                    // Calculate commission based on entered cost
                    let rate = 0.3; // 30% for under $500
                    let displayRate = "30%";
                    
                    // Clean the input value for numeric processing
                    const numericValue = value.replace(/[^0-9.]/g, '');
                    const cost = parseFloat(numericValue);
                    
                    if (!isNaN(cost)) {
                      // Determine commission rate based on cost
                      if (cost > 500) {
                        rate = 0.35; // 35% for over $500
                        displayRate = "35%";
                      }
                      
                      // Calculate commission
                      const calculatedCommission = `$${(cost * rate).toFixed(2)}`;
                      
                      // Update form values
                      setValue("insuranceDetails.planCost", `$${numericValue}`);
                      setValue("insuranceDetails.commissionRate", displayRate);
                      setValue("insuranceDetails.planCommission", calculatedCommission);
                      setPlanCommission(calculatedCommission);
                      
                      // Calculate total commission
                      calculateTotalCommission(calculatedCommission, selectedAddons);
                    }
                  }}
                  placeholder="Enter plan cost"
                />
              ) : (
                <Input {...field} readOnly />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Commission Rate Field */}
      <FormField
        control={control}
        name="insuranceDetails.commissionRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Commission Rate <sub>[Airtable: Commission Rate]</sub></FormLabel>
            <FormControl>
              <Input {...field} readOnly />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* [X] Plan Commission Field */}
      <FormField
        control={control}
        name="insuranceDetails.planCommission"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plan Commission <sub>[Airtable: Carrier U65 Commission]</sub></FormLabel>
            <FormControl>
              <Input {...field} readOnly />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Add-ons Section */}
      {console.log("Add-ons section condition:", JSON.stringify({
        selectedType,
        hasAddons: selectedType ? allData[selectedType]?.hasAddons : false,
        availableAddons: availableAddons.length
      }))}
      
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
                <FormLabel>Do you want to include add-ons? <sub>[Airtable: Has Addons]</sub></FormLabel>
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
                      <RadioGroup 
                        value={selectedAddons.find(name => {
                          const addon = availableAddons.find(a => a.planName === name);
                           return addon?.provider === "American Financial 1";
                         })}
                        onValueChange={(value) => handleAddonSelectionRadio("American Financial 1", value)}
                      >
                        {availableAddons
                          .filter(addon => addon.provider === "American Financial 1")
                          .map((addon, index) => (
                            <div key={`${addon.provider}-${addon.planName}-${index}`} className="flex items-center space-x-2 border-b pb-2">
                              <RadioGroupItem value={addon.planName} id={`addon-${addon.provider}-${index}`} />
                              <div className="space-y-1">
                                <label 
                                  htmlFor={`addon-${addon.provider}-${index}`} 
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {addon.planName}
                                </label>
                                <p className="text-xs text-gray-500">Cost: ${addon.planCost}</p>
                                <p className="text-xs text-gray-500">Commission: {Number(addon.planCommission) <= 1 ? Number(addon.planCommission) * 100 : Number(addon.planCommission)}%</p>
                              </div>
                            </div>
                          ))}
                      </RadioGroup>
                    </div>
                  )}
                  
                  {/* American Financial 2 - AME Add-ons */}
                  {availableAddons.some(addon => addon.provider === "American Financial 2") && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm border-b pb-1">American Financial 2 - Accident Medical Expense</h5>
                      <RadioGroup 
                        value={selectedAddons.find(name => {
                          const addon = availableAddons.find(a => a.planName === name);
                           return addon?.provider === "American Financial 2";
                         })}
                        onValueChange={(value) => handleAddonSelectionRadio("American Financial 2", value)}
                      >
                        {availableAddons
                          .filter(addon => addon.provider === "American Financial 2")
                          .map((addon, index) => (
                            <div key={`${addon.provider}-${addon.planName}-${index}`} className="flex items-center space-x-2 border-b pb-2">
                              <RadioGroupItem value={addon.planName} id={`addon-${addon.provider}-${index}`} />
                              <div className="space-y-1">
                                <label 
                                  htmlFor={`addon-${addon.provider}-${index}`} 
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {addon.planName}
                                </label>
                                <p className="text-xs text-gray-500">Cost: ${addon.planCost}</p>
                                <p className="text-xs text-gray-500">Commission: {Number(addon.planCommission) <= 1 ? Number(addon.planCommission) * 100 : Number(addon.planCommission)}%</p>
                              </div>
                            </div>
                          ))}
                      </RadioGroup>
                    </div>
                  )}
                  
                  {/* American Financial 3 - Critical Illness Add-ons */}
                  {availableAddons.some(addon => addon.provider === "American Financial 3") && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm border-b pb-1">American Financial 3 - Critical Illness</h5>
                      <RadioGroup 
                        value={selectedAddons.find(name => {
                          const addon = availableAddons.find(a => a.planName === name);
                           return addon?.provider === "American Financial 3";
                         })}
                        onValueChange={(value) => handleAddonSelectionRadio("American Financial 3", value)}
                      >
                        {availableAddons
                          .filter(addon => addon.provider === "American Financial 3")
                          .map((addon, index) => (
                            <div key={`${addon.provider}-${addon.planName}-${index}`} className="flex items-center space-x-2 border-b pb-2">
                              <RadioGroupItem value={addon.planName} id={`addon-${addon.provider}-${index}`} />
                              <div className="space-y-1">
                                <label 
                                  htmlFor={`addon-${addon.provider}-${index}`} 
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {addon.planName}
                                </label>
                                <p className="text-xs text-gray-500">Cost: ${addon.planCost}</p>
                                <p className="text-xs text-gray-500">Commission: {Number(addon.planCommission) <= 1 ? Number(addon.planCommission) * 100 : Number(addon.planCommission)}%</p>
                              </div>
                            </div>
                          ))}
                      </RadioGroup>
                    </div>
                  )}
                  
                  {/* Essential Care Individual Add-ons */}
                  {availableAddons.some(addon => addon.provider === "Essential Care Individual") && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm border-b pb-1">Essential Care Individual</h5>
                      <RadioGroup 
                        value={selectedAddons.find(name => {
                          const addon = availableAddons.find(a => a.planName === name);
                           return addon?.provider === "Essential Care Individual";
                         })}
                        onValueChange={(value) => handleAddonSelectionRadio("Essential Care Individual", value)}
                      >
                        {availableAddons
                          .filter(addon => addon.provider === "Essential Care Individual")
                          .map((addon, index) => (
                            <div key={`${addon.provider}-${addon.planName}-${index}`} className="flex items-center space-x-2 border-b pb-2">
                              <RadioGroupItem value={addon.planName} id={`addon-${addon.provider}-${index}`} />
                              <div className="space-y-1">
                                <label 
                                  htmlFor={`addon-${addon.provider}-${index}`} 
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {addon.planName}
                                </label>
                                <p className="text-xs text-gray-500">Cost: ${addon.planCost}</p>
                                <p className="text-xs text-gray-500">Commission: {Number(addon.planCommission) <= 1 ? Number(addon.planCommission) * 100 : Number(addon.planCommission)}%</p>
                              </div>
                            </div>
                          ))}
                      </RadioGroup>
                    </div>
                  )}
                  
                  {/* Leo Addons - Multiselect */}
                  {availableAddons.some(addon => addon.provider === "Leo Addons") && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm border-b pb-1">Leo Addons</h5>
                      <div className="space-y-2">
                        {availableAddons
                          .filter(addon => addon.provider === "Leo Addons")
                          .map((addon, index) => (
                            <div key={`${addon.provider}-${addon.planName}-${index}`} className="flex items-start space-x-2 border-b pb-2">
                              <Checkbox 
                                id={`addon-${addon.provider}-${index}`} 
                                checked={isAddonSelected(addon.planName, "Leo Addons")}
                                onCheckedChange={(checked) => handleMultiAddonSelection(addon.planName, checked === true)}
                              />
                              <div className="space-y-1">
                                <label 
                                  htmlFor={`addon-${addon.provider}-${index}`} 
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {addon.planName}
                                </label>
                                <p className="text-xs text-gray-500">Cost: ${addon.planCost}</p>
                                <p className="text-xs text-gray-500">Commission: {Number(addon.planCommission) <= 1 ? Number(addon.planCommission) * 100 : Number(addon.planCommission)}%</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* AMT Addons 1 */}
                  {availableAddons.some(addon => addon.provider === "AMT Addons 1") && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm border-b pb-1">AMT Addons 1</h5>
                      <RadioGroup 
                        value={selectedAddons.find(name => {
                          const addon = availableAddons.find(a => a.planName === name);
                           return addon?.provider === "AMT Addons 1";
                         })}
                        onValueChange={(value) => handleAddonSelectionRadio("AMT Addons 1", value)}
                      >
                        {availableAddons
                          .filter(addon => addon.provider === "AMT Addons 1")
                          .map((addon, index) => (
                            <div key={`${addon.provider}-${addon.planName}-${index}`} className="flex items-center space-x-2 border-b pb-2">
                              <RadioGroupItem value={addon.planName} id={`addon-${addon.provider}-${index}`} />
                              <div className="space-y-1">
                                <label 
                                  htmlFor={`addon-${addon.provider}-${index}`} 
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {addon.planName}
                                </label>
                                <p className="text-xs text-gray-500">Cost: ${addon.planCost}</p>
                                <p className="text-xs text-gray-500">Commission: {Number(addon.planCommission) <= 1 ? Number(addon.planCommission) * 100 : Number(addon.planCommission)}%</p>
                              </div>
                            </div>
                          ))}
                      </RadioGroup>
                    </div>
                  )}
                  
                  {/* AMT Addons 2 */}
                  {availableAddons.some(addon => addon.provider === "AMT Addons 2") && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm border-b pb-1">AMT Addons 2</h5>
                      <RadioGroup 
                        value={selectedAddons.find(name => {
                          const addon = availableAddons.find(a => a.planName === name);
                           return addon?.provider === "AMT Addons 2";
                         })}
                        onValueChange={(value) => handleAddonSelectionRadio("AMT Addons 2", value)}
                      >
                        {availableAddons
                          .filter(addon => addon.provider === "AMT Addons 2")
                          .map((addon, index) => (
                            <div key={`${addon.provider}-${addon.planName}-${index}`} className="flex items-center space-x-2 border-b pb-2">
                              <RadioGroupItem value={addon.planName} id={`addon-${addon.provider}-${index}`} />
                              <div className="space-y-1">
                                <label 
                                  htmlFor={`addon-${addon.provider}-${index}`} 
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {addon.planName}
                                </label>
                                <p className="text-xs text-gray-500">Cost: ${addon.planCost}</p>
                                <p className="text-xs text-gray-500">Commission: {Number(addon.planCommission) <= 1 ? Number(addon.planCommission) * 100 : Number(addon.planCommission)}%</p>
                              </div>
                            </div>
                          ))}
                      </RadioGroup>
                    </div>
                  )}
                  
                </div>
              )}
            </div>
          )}
          
          <FormField
            control={control}
            name="insuranceDetails.addonsCost"
            render={({ field }) => (
              <FormItem className="pt-3">
                <FormLabel>
                  Total Add-ons Cost <sub>[Airtable: Addons Cost]</sub>
                  {addonCostBreakdown.length > 0 && (
                    <InfoTooltip items={addonCostBreakdown} />
                  )}
                </FormLabel>
                <FormControl>
                  <Input {...field} value={addonsTotalCost} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* [X] Add-ons Commission Field */}
          <FormField
            control={control}
            name="insuranceDetails.addonsCommission"
            render={({ field }) => (
              <FormItem className="pt-3">
                <FormLabel>
                  Total Add-ons Commission <sub>[Airtable: Addons Commission]</sub>
                  {addonCommissionBreakdown.length > 0 && (
                    <InfoTooltip items={addonCommissionBreakdown} />
                  )}
                </FormLabel>
                <FormControl>
                  <Input {...field} value={addonsTotalCommission} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Replace the dropdown with radio buttons for Enrollment Fee */}
      <FormField
        control={control}
        name="insuranceDetails.enrollmentFee"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Enrollment Fee <sub>[Airtable: Enrollment Fees]</sub></FormLabel>
            <FormControl>
              <RadioGroup 
                onValueChange={(value) => {
                  field.onChange(`$${value}`);
                  handleEnrollmentFeeChange(value);
                }}
                value={selectedEnrollmentFee}
                className="flex flex-col space-y-1"
              >
                {enrollmentFeeOptions.length === 0 ? (
                  <div className="text-sm text-gray-500">No enrollment fees available</div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {enrollmentFeeOptions.map((fee) => (
                      <div className="flex items-center space-x-2" key={fee}>
                        <RadioGroupItem value={fee} id={`fee-${fee}`} disabled={!selectedCarrier} />
                        <label 
                          htmlFor={`fee-${fee}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          ${fee}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="insuranceDetails.enrollmentFeeCommission"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Enrollment Commission <sub>[Airtable: Enrollment Commission]</sub></FormLabel>
            <FormControl>
              <Input {...field} readOnly />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="insuranceDetails.firstMonthPremium"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              First Month Premium <sub>[Airtable: First Month Premium]</sub>
              {firstMonthBreakdown.length > 0 && (
                <InfoTooltip items={firstMonthBreakdown} />
              )}
            </FormLabel>
            <FormControl>
              <Input {...field} readOnly />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="insuranceDetails.monthlyPremium"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Monthly Premium <sub>[Airtable: Monthly Premium]</sub>
              <InfoTooltip 
                items={[
                  { label: "Plan Cost", value: watch("insuranceDetails.planCost") || "$0" },
                  ...(parseFloat(addonsTotalCost.replace(/[^0-9.]/g, '')) > 0 ? 
                    [{ label: "Add-ons", value: addonsTotalCost }] : [])
                ]} 
              />
            </FormLabel>
            <FormControl>
              <Input {...field} readOnly />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* [X] Total Commission Field - Moved here */}
      <FormField
        control={control}
        name="insuranceDetails.totalCommission"
        render={({ field }) => (
          <FormItem className="pt-3">
            <FormLabel>
              Total Commission <sub>[Airtable: Total Commission]</sub>
              {totalCommissionBreakdown.length > 0 && (
                <InfoTooltip items={totalCommissionBreakdown} />
              )}
            </FormLabel>
            <FormControl>
              <Input {...field} value={totalCommission} readOnly />
            </FormControl>
            <FormDescription className="text-sm text-muted-foreground">
              Includes: Plan Commission + Add-ons Commission + Enrollment Commission
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}