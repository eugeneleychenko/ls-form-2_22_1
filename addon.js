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
      // Check if this record is an addon (based on the carrier)
      const isAddon = record.fields.Carriers && (
        record.fields.Carriers.includes('American Financial') || 
        record.fields.Carriers.includes('Essential Care Individual') ||
        record.fields.Carriers.includes('AMT Addons') ||
        record.fields.Carriers.includes('Leo Addons') ||
        record.fields.Carriers.includes('Addons') // Catch any carrier with "Addons" in the name
      );
      
      if (isAddon) {
        // Extract the addon number from the carrier name (e.g., "American Financial 1")
        let addonNumber = '1';
        let addonType = '';
        
        if (record.fields.Carriers.includes('American Financial')) {
          addonType = 'American Financial';
          if (record.fields.Carriers.includes(' 1')) addonNumber = '1';
          if (record.fields.Carriers.includes(' 2')) addonNumber = '2';
          if (record.fields.Carriers.includes(' 3')) addonNumber = '3';
        } else if (record.fields.Carriers.includes('Essential Care Individual')) {
          addonType = 'Essential Care';
          addonNumber = '1';
        } else if (record.fields.Carriers.includes('AMT Addons')) {
          addonType = 'AMT';
          if (record.fields.Carriers.includes(' 1')) addonNumber = '1';
          if (record.fields.Carriers.includes(' 2')) addonNumber = '2';
        } else if (record.fields.Carriers.includes('Leo Addons')) {
          addonType = 'Leo';
          addonNumber = '1';
        } else {
          // Extract addon type from the carrier name for any other carriers
          const carrierName = record.fields.Carriers;
          // Try to extract the type (text before "Addons" or before a number)
          const typeMatch = carrierName.match(/^(.*?)\s+(?:Addons|\d)/i);
          addonType = typeMatch ? typeMatch[1].trim() : 'Other';
          
          // Try to extract the number if present
          const numberMatch = carrierName.match(/\s+(\d+)\s*$/);
          addonNumber = numberMatch ? numberMatch[1] : '1';
        }
        
        allAddons.push({
          id: record.id,
          name: record.fields.Carriers,
          addonNumber: addonNumber,
          addonType: addonType,
          type: record.fields.Type || 'Unknown Type',
          plans: []
        });
        
        // Process all plans from 1 to 11
        for (let i = 1; i <= 11; i++) {
          const planField = `Plan ${i}`;
          const costField = `Plan ${i} Cost`;
          const commissionField = `Plan ${i} Commission`;
          
          if (record.fields[planField] && record.fields[costField]) {
            // Clean up the plan name and cost
            const planName = record.fields[planField].replace(/\s+/g, ' ').trim();
            const planCost = record.fields[costField].replace(/\$+/g, '').trim();
            // Get commission if available
            let planCommission = '0';
            if (record.fields[commissionField]) {
              const commissionValue = record.fields[commissionField];
              if (typeof commissionValue === 'string') {
                planCommission = commissionValue.replace(/\$+/g, '').trim();
              } else if (typeof commissionValue === 'number') {
                planCommission = commissionValue.toString();
              } else {
                planCommission = '0';
              }
            }
            
            allAddons[allAddons.length - 1].plans.push({
              name: cleanPlanName(planName),
              cost: planCost,
              commission: planCommission,
              planNumber: i.toString()
            });
          }
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
          console.log(`    - ${plan.name}: $${plan.cost} (Commission: ${plan.commission || '0'})`);
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
        console.log(`    - ${plan.name}: $${plan.cost} (Commission: ${plan.commission || '0'})`);
      });
    }
    
    // Add a section to display addons by carrier type
    console.log('\n=== ADDONS BY CARRIER ===');
    
    // Group addons by carrier type
    const addonsByCarrier = {
      'American Financial': [],
      'Essential Care': [],
      'AMT': [],
      'Leo': [],
      'Other': []  // Add category for other carriers
    };
    
    allAddons.forEach(addon => {
      if (addon.addonType) {
        // If the carrier type exists in our predefined categories, use it
        if (addonsByCarrier[addon.addonType]) {
          addonsByCarrier[addon.addonType].push(addon);
        } else {
          // If not, add to 'Other'
          addonsByCarrier['Other'].push(addon);
        }
      }
    });
    
    // Display addons by carrier
    for (const [carrier, addons] of Object.entries(addonsByCarrier)) {
      if (addons.length > 0) {
        console.log(`\n${carrier} (${addons.length} addons):`);
        
        // Sort addons by their number
        addons.sort((a, b) => a.addonNumber - b.addonNumber);
        
        addons.forEach(addon => {
          console.log(`  ${addon.name}:`);
          
          addon.plans.forEach(plan => {
            console.log(`    - ${plan.name}: $${plan.cost} (Commission: ${plan.commission || '0'})`);
          });
        });
      }
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

