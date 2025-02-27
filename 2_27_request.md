# State-Based Filtering Implementation Plan

## Overview
Implement functionality to filter both insurance plans and add-ons based on state availability. Some plans have state exclusions noted in their names, such as "TeleMed $43.97 (N/A UT,VT)" or "AMT - Vision $29.97 (N/A MT,VT)", indicating they are not available in certain states.

## Implementation Steps

### 1. Parse State Exclusion Information
- Create utility functions to extract excluded states from plan/add-on names
- Parse the parenthetical expressions like "(N/A UT,VT)" using regex
- Convert these excluded states into arrays for easy comparison

```typescript
function getExcludedStates(planName: string): string[] {
  const match = planName.match(/\(N\/A\s+([A-Z,\s]+)\)/);
  if (match && match[1]) {
    return match[1].split(',').map(state => state.trim());
  }
  return [];
}

function isPlanAvailableInState(planName: string, selectedState: string): boolean {
  const excludedStates = getExcludedStates(planName);
  return !excludedStates.includes(selectedState);
}
```

### 2. Update Regular Plans Filtering Logic
- Modify the useEffect hook that watches for carrier changes to also filter based on state
- Add a dependency on the selected state
- Filter out plans that aren't available in the selected state

```typescript
const selectedState = useWatch({
  control,
  name: "insuranceDetails.insuranceState",
  defaultValue: ""
});

useEffect(() => {
  if (selectedType && selectedCarrier && selectedState && allData[selectedType]?.plans[selectedCarrier]) {
    // Get all plans for the carrier
    const allPlans = allData[selectedType].plans[selectedCarrier].planNames;
    
    // Filter plans based on state availability
    const availablePlansForState = allPlans.filter(planName => 
      isPlanAvailableInState(planName, selectedState)
    );
    
    setAvailablePlans(availablePlansForState);
    
    // Create updated cost and commission maps with only available plans
    const costMap: Record<string, string> = {};
    const commissionMap: Record<string, string> = {};
    
    availablePlansForState.forEach(plan => {
      const planIndex = allData[selectedType].plans[selectedCarrier].planNames.indexOf(plan);
      costMap[plan] = allData[selectedType].plans[selectedCarrier].planCosts[planIndex];
      commissionMap[plan] = allData[selectedType].plans[selectedCarrier].planCommissions[planIndex];
    });
    
    setPlanCosts(costMap);
    setPlanCommissions(commissionMap);
    
    // Clear plan selection if the current plan is no longer available
    if (selectedPlan && !availablePlansForState.includes(selectedPlan)) {
      setValue("insuranceDetails.plan", "");
      setValue("insuranceDetails.planCost", "");
      setValue("insuranceDetails.planCommission", "");
    }
  }
}, [selectedCarrier, selectedType, selectedState, allData, setValue, selectedPlan]);
```

### 3. Update Add-ons Filtering Logic
- Modify the fetchAddonData function to filter add-ons based on state
- Store the filtered add-ons in state

```typescript
// Modify fetchAddonData to accept selectedState parameter
const fetchAddonData = useCallback(async (selectedState: string) => {
  if (!selectedType) return;
  
  setLoadingAddons(true);
  
  try {
    // ... existing API fetch code ...
    
    if (addonRecords.length > 0) {
      const addons: AddonPlan[] = [];
      
      // Process each addon record
      addonRecords.forEach((record: AirtableRecord) => {
        // ... existing processing code ...
        
        // Process each plan in the record
        for (let i = 1; i <= 3; i++) {
          // ... existing plan extraction code ...
          
          // Check state availability before adding to add-ons
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
      });
      
      // ... existing code to group and set add-ons ...
    }
  } catch (error) {
    console.error('Error fetching addon data:', error);
    setAvailableAddons([]);
  } finally {
    setLoadingAddons(false);
  }
}, [selectedType]);

// Update the useEffect hook to pass selected state to fetchAddonData
useEffect(() => {
  if (selectedType && allData[selectedType]) {
    setCarriers(allData[selectedType].carriers);
    
    // Clear selections when type changes
    setValue("insuranceDetails.carrierU65", "");
    setValue("insuranceDetails.plan", "");
    // ... other reset code ...
    
    // Check if this type has add-ons and fetch them with state filtering
    const hasAddons = allData[selectedType]?.hasAddons || false;
    if (hasAddons && selectedState) {
      fetchAddonData(selectedState);
    }
  } else {
    setCarriers([]);
  }
}, [selectedType, allData, setValue, fetchAddonData, selectedState]);
```

### 4. Handle State Changes
- Add an effect that responds to state changes
- Re-fetch and re-filter both plans and add-ons when state changes

```typescript
useEffect(() => {
  if (selectedState) {
    // If carrier and type are selected, re-filter regular plans
    if (selectedType && selectedCarrier && allData[selectedType]?.plans[selectedCarrier]) {
      // This will be handled by the updated carrier effect above
    }
    
    // If add-ons are enabled, re-fetch add-ons with state filtering
    if (selectedType && allData[selectedType]?.hasAddons) {
      fetchAddonData(selectedState);
      
      // Clear add-on selections since available options may have changed
      setSelectedAddons([]);
      setAddonsTotalCost("0");
      setAddonsTotalCommission("0");
      setValue("insuranceDetails.selectedAddons", []);
      setValue("insuranceDetails.addonsCost", "0");
      setValue("insuranceDetails.addonsCommission", "0");
      
      // Recalculate total commission
      calculateTotalCommission(planCommission, []);
    }
  }
}, [selectedState, selectedType, selectedCarrier, allData, fetchAddonData, setValue, planCommission]);
```

### 5. Update UI/UX
- Modify the UI to show that plans are being filtered by state
- Add clear messaging when plans are unavailable in the selected state
- Consider adding tooltips to explain state restrictions

```tsx
// Example UI enhancement for plan dropdown
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
                    ? `No plans available in ${getStateNameFromCode(selectedState)}` 
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
                  : `No plans available in ${getStateNameFromCode(selectedState)}`}
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
```

### 6. Edge Cases and Error Handling
- Handle cases where no plans are available for a state
- Ensure proper reset of selections when state changes
- Add validation to prevent form submission with invalid selections
- Handle different formats of state exclusion notation consistently

### 7. Testing
- Test with various state selections to ensure filtering works
- Verify that changing states properly updates available plans and add-ons
- Ensure that selections are properly cleared when state changes make them invalid

## Timeline Estimate
- Utility functions for parsing state exclusions: 1 hour
- Update regular plans filtering: 2-3 hours
- Update add-ons filtering: 2-3 hours
- State change handling: 1-2 hours
- UI/UX improvements: 2-3 hours
- Testing and bug fixes: 3-4 hours

Total: Approximately 11-16 hours of development time

## Dependencies
- React Hook Form for watching state changes
- Existing plan and add-on data structures
- State dropdown component

## Future Improvements
- Consider updating the data structure to separate state exclusion data
- Add a more sophisticated state dependency system to handle complex rules
- Implement caching to improve performance
- Develop admin tools to manage state availability rules
