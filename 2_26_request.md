# Plan for Implementing Commission Calculations in insurance-details.tsx

## Overview
We need to update the insurance-details.tsx file to calculate commissions based on the selected plans and add-ons. The mapping.js file already contains the logic for collecting commission data from the Airtable API.

## Implementation Steps

1. **Update the AirtableRecord Interface**
   - Add the commission fields to the AirtableRecord interface to properly type the data
   - Include "Plan 1 Commission", "Plan 2 Commission", etc. in the interface

2. **Add Commission State Variables**
   - Create state variables to store the commission values for plans
   - Add a variable to track the total commission amount

3. **Modify the Data Processing Logic**
   - Update the data fetching and processing to include commission data
   - Create a mapping between plans and their associated commissions
   - Store commission data alongside plan and cost data

4. **Update Plan Selection Handler**
   - Modify the handlePlanChange function to also set the commission value when a plan is selected
   - Add a field to display the commission value in the UI

5. **Update Add-on Selection Logic**
   - Modify the add-on selection logic to also track commissions for add-ons
   - Calculate the total commission including both plan and add-on commissions

6. **Add Commission Display Fields**
   - Add form fields to display the plan commission
   - Add form fields to display the add-on commissions
   - Add a field to display the total commission

7. **Update Form Context**
   - Add new fields to the form context for storing commission values
   - Ensure commission values are included in form submissions

## Detailed Implementation

### 1. Update Data Structures
```typescript
// Add commission fields to the interface
interface AirtableRecord {
  // ... existing fields
  "Plan 1 Commission"?: string;
  "Plan 2 Commission"?: string;
  "Plan 3 Commission"?: string;
  "Plan 4 Commission"?: string;
  "Plan 5 Commission"?: string;
  "Plan 6 Commission"?: string;
  "Plan 7 Commission"?: string;
  "Plan 8 Commission"?: string;
}

// Update CarrierData interface
interface CarrierData {
  carriers: string[];
  hasAddons: boolean;
  plans: {
    [carrier: string]: {
      planNames: string[];
      planCosts: string[];
      planCommissions: string[]; // Add this field
    }
  };
}

// Add commission to AddonPlan interface
interface AddonPlan {
  planName: string;
  planCost: string;
  planCommission: string; // Add this field
  planNumber: string;
  provider?: string;
  addonType: string;
}
```

### 2. Add State Variables
```typescript
const [planCommission, setPlanCommission] = useState<string>("");
const [addonCommissions, setAddonCommissions] = useState<Record<string, string>>({});
const [totalCommission, setTotalCommission] = useState<string>("0");
```

### 3. Update Data Processing
```typescript
// In the data processing section:
if (record.fields[planKey] && record.fields[planCostKey]) {
  const planName = String(record.fields[planKey]).trim();
  const planCost = String(record.fields[planCostKey]).trim();
  const planCommission = record.fields[`${planKey} Commission`] 
    ? String(record.fields[`${planKey} Commission`]).trim() 
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
```

### 4. Update Plan Selection Handler
```typescript
// Update plan cost and commission when plan changes
const handlePlanChange = (planName: string) => {
  console.log("Plan selected:", planName);
  
  const cost = planCosts[planName] || "";
  const commission = planCommissions[planName] || "0";
  
  console.log("Setting plan cost to:", cost);
  console.log("Setting plan commission to:", commission);
  
  setValue("insuranceDetails.planCost", cost);
  setValue("insuranceDetails.planCommission", commission);
  setPlanCommission(commission);
  
  // Recalculate total commission
  calculateTotalCommission(commission, selectedAddons);
};
```

### 5. Update Add-on Selection Logic
```typescript
// Handle addon selection with commission
const handleAddonSelection = (addonName: string, provider: string) => {
  // ... existing code
  
  // Calculate total cost and commission
  const { totalCost, totalCommission } = calculateAddonsValues(updatedAddons);
  setAddonsTotalCost(totalCost);
  setValue("insuranceDetails.addonsCost", totalCost);
  
  // Update commission values
  setValue("insuranceDetails.addonsCommission", totalCommission);
  
  // Calculate overall total commission
  calculateTotalCommission(planCommission, updatedAddons);
};

// Calculate total cost and commission of selected addons
const calculateAddonsValues = (selectedAddons: string[]): { totalCost: string, totalCommission: string } => {
  let totalCost = 0;
  let totalCommission = 0;
  
  availableAddons.forEach(addon => {
    if (selectedAddons.includes(addon.planName)) {
      // Extract the cost value
      const costString = addon.planCost.replace(/[^0-9.]/g, '');
      const cost = parseFloat(costString);
      
      // Extract the commission value
      const commissionString = addon.planCommission?.replace(/[^0-9.]/g, '') || "0";
      const commission = parseFloat(commissionString);
      
      if (!isNaN(cost)) {
        totalCost += cost;
      }
      
      if (!isNaN(commission)) {
        totalCommission += commission;
      }
    }
  });
  
  return { 
    totalCost: `$${totalCost.toFixed(2)}`,
    totalCommission: `$${totalCommission.toFixed(2)}`
  };
};

// Calculate total commission (plan + addons)
const calculateTotalCommission = (planCommissionValue: string, selectedAddons: string[]) => {
  // Extract plan commission value
  const planCommissionNumber = parseFloat(planCommissionValue.replace(/[^0-9.]/g, '') || "0");
  
  // Get addon commissions
  const { totalCommission: addonCommissionValue } = calculateAddonsValues(selectedAddons);
  const addonCommissionNumber = parseFloat(addonCommissionValue.replace(/[^0-9.]/g, '') || "0");
  
  // Calculate total
  const total = planCommissionNumber + addonCommissionNumber;
  const totalFormatted = `$${total.toFixed(2)}`;
  
  setTotalCommission(totalFormatted);
  setValue("insuranceDetails.totalCommission", totalFormatted);
};
```

### 6. Add Commission Display Fields
```tsx
{/* Plan Commission Field */}
<FormField
  control={control}
  name="insuranceDetails.planCommission"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Plan Commission</FormLabel>
      <FormControl>
        <Input {...field} readOnly />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

{/* Add-ons Commission Field (when add-ons are enabled) */}
{addonsEnabled && (
  <FormField
    control={control}
    name="insuranceDetails.addonsCommission"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Add-ons Commission</FormLabel>
        <FormControl>
          <Input {...field} readOnly />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)}

{/* Total Commission Field */}
<FormField
  control={control}
  name="insuranceDetails.totalCommission"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Total Commission</FormLabel>
      <FormControl>
        <Input {...field} value={totalCommission} readOnly />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Testing
1. Test with different plan selections to ensure commission values are correctly displayed
2. Test with different add-on selections to verify commission calculations
3. Verify that the total commission is correctly calculated as the sum of plan and add-on commissions 