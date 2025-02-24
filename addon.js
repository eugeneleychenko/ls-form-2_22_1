const baseId = 'appYMEW2CsYkdpQ7c';
const tableName = 'tbl2WlsDz9rPXhVVY';
const endpoint = `https://api.airtable.com/v0/${baseId}/${tableName}`;
const apiKey = 'pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025';

// Function to fetch and process addon data
function fetchAddons() {
  fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })
  .then(response => response.json())
  .then(data => {
    // Create an object to store all addons by type
    const addonsByType = {};
    const allAddons = [];

    // First pass: identify all records that are addons themselves
    data.records.forEach(record => {
      // Check if this record is an addon (based on the carrier being American Financial)
      const isAddon = record.fields.Carriers && record.fields.Carriers.includes('American Financial');
      
      if (isAddon) {
        // Extract the addon number from the carrier name (e.g., "American Financial 1")
        let addonNumber = '1';
        if (record.fields.Carriers.includes(' 1')) addonNumber = '1';
        if (record.fields.Carriers.includes(' 2')) addonNumber = '2';
        if (record.fields.Carriers.includes(' 3')) addonNumber = '3';
        
        allAddons.push({
          id: record.id,
          name: record.fields.Carriers,
          addonNumber: addonNumber,
          type: record.fields.Type || 'Unknown Type',
          plans: []
        });
        
        // Add plans if they exist
        if (record.fields['Plan 1'] && record.fields['Plan 1 Cost']) {
          // Clean up the plan name and cost
          const planName = record.fields['Plan 1'].replace(/\s+/g, ' ').trim();
          const planCost = record.fields['Plan 1 Cost'].replace(/\$+/g, '').trim();
          
          allAddons[allAddons.length - 1].plans.push({
            name: cleanPlanName(planName),
            cost: planCost
          });
        }
        
        if (record.fields['Plan 2'] && record.fields['Plan 2 Cost']) {
          // Clean up the plan name and cost
          const planName = record.fields['Plan 2'].replace(/\s+/g, ' ').trim();
          const planCost = record.fields['Plan 2 Cost'].replace(/\$+/g, '').trim();
          
          allAddons[allAddons.length - 1].plans.push({
            name: cleanPlanName(planName),
            cost: planCost
          });
        }
        
        if (record.fields['Plan 3'] && record.fields['Plan 3 Cost']) {
          // Clean up the plan name and cost
          const planName = record.fields['Plan 3'].replace(/\s+/g, ' ').trim();
          const planCost = record.fields['Plan 3 Cost'].replace(/\$+/g, '').trim();
          
          allAddons[allAddons.length - 1].plans.push({
            name: cleanPlanName(planName),
            cost: planCost
          });
        }
      }
    });

    // Group addons by type
    allAddons.forEach(addon => {
      if (!addonsByType[addon.type]) {
        addonsByType[addon.type] = [];
      }
      addonsByType[addon.type].push(addon);
    });

    // Display the results in a clean format
    console.log('=== ADDONS BY TYPE ===');
    
    for (const [type, addons] of Object.entries(addonsByType)) {
      console.log(`\n${type.toUpperCase()} (${addons.length} addons):`);
      
      // Sort addons by their number
      addons.sort((a, b) => a.addonNumber - b.addonNumber);
      
      addons.forEach(addon => {
        console.log(`  ${addon.name}:`);
        
        addon.plans.forEach(plan => {
          console.log(`    - ${plan.name}: $${plan.cost}`);
        });
      });
    }
    
    // Create a summary of all addons
    console.log('\n=== ADDON SUMMARY ===');
    
    const addonSummary = {};
    
    // Group by addon name across all types
    allAddons.forEach(addon => {
      const addonName = addon.name;
      
      if (!addonSummary[addonName]) {
        addonSummary[addonName] = {
          types: new Set(),
          plans: new Map() // Use a Map with plan name as key to avoid duplicates
        };
      }
      
      addonSummary[addonName].types.add(addon.type);
      
      // Add unique plans using a Map to avoid duplicates
      addon.plans.forEach(plan => {
        // Use the plan name as the key, and store the plan object as the value
        // If there are multiple costs for the same plan name, we'll use the first one
        if (!addonSummary[addonName].plans.has(plan.name)) {
          addonSummary[addonName].plans.set(plan.name, plan);
        }
      });
    });
    
    // Display the summary
    for (const [addonName, data] of Object.entries(addonSummary)) {
      console.log(`\n${addonName}:`);
      console.log(`  Available for: ${Array.from(data.types).join(', ')}`);
      console.log('  Plans:');
      
      // Convert the Map back to an array for display
      const uniquePlans = Array.from(data.plans.values());
      
      // Sort plans by name
      uniquePlans.sort((a, b) => {
        // Extract numeric values from plan names for better sorting
        const aMatch = a.name.match(/(\d+(?:,\d+)?)/);
        const bMatch = b.name.match(/(\d+(?:,\d+)?)/);
        
        if (aMatch && bMatch) {
          const aValue = parseInt(aMatch[1].replace(',', ''));
          const bValue = parseInt(bMatch[1].replace(',', ''));
          return aValue - bValue;
        }
        
        return a.name.localeCompare(b.name);
      });
      
      uniquePlans.forEach(plan => {
        console.log(`    - ${plan.name}: $${plan.cost}`);
      });
    }
  })
  .catch(error => {
    console.error('Error fetching addon data:', error);
  });
}

// Helper function to clean up plan names
function cleanPlanName(name) {
  // Remove any trailing colons and extra spaces
  return name.replace(/:\s*$/, '').replace(/\s+/g, ' ').trim();
}

// Execute the function
fetchAddons();

