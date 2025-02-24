const baseId = 'appYMEW2CsYkdpQ7c';
const commissions2TableId = 'tblFJVvuZ2CfhD77D';
const dataEndpoint = `https://api.airtable.com/v0/${baseId}/Commissions2`;

// Function to fetch addon data from the Commissions2 table
function fetchAddonData() {
  console.log('Fetching addon data from Commissions2 table...');
  
  // Fetch records from the Commissions2 table
  return fetch(`${dataEndpoint}?maxRecords=20`, {
    headers: {
      Authorization: `Bearer pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.records && data.records.length > 0) {
      // Find records with addon data
      const recordsWithAddons = data.records.filter(record => {
        const keys = Object.keys(record.fields);
        return keys.some(key => 
          key.toLowerCase().includes('addon') && 
          Array.isArray(record.fields[key]) && 
          record.fields[key].length > 0
        );
      });
      
      if (recordsWithAddons.length > 0) {
        // Process each record with addon data
        return recordsWithAddons.map(record => {
          // Extract addon categories
          const addonCategories = {
            individual: extractAddonCategory(record, 'Individual Addons'),
            family: extractAddonCategory(record, 'Family Addons'),
            individualSpouse: extractAddonCategory(record, 'Individual + Spouse Addons'),
            individualChildren: extractAddonCategory(record, 'Individual + Children Addons')
          };
          
          return {
            id: record.id,
            addonCategories
          };
        });
      } else {
        console.log('No records found with addon data');
        return [];
      }
    } else {
      console.log('No records found in Commissions2 table');
      return [];
    }
  })
  .catch(error => {
    console.error('Error fetching addon data:', error);
    return [];
  });
}

// Helper function to extract addon category data
function extractAddonCategory(record, categoryName) {
  const fields = record.fields;
  
  // Check if this category exists in the record
  if (!fields[categoryName] || !Array.isArray(fields[categoryName]) || fields[categoryName].length === 0) {
    return null;
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
    const planNum = planNumber ? planNumber[1] : index + 1;
    
    // Find the corresponding cost field
    const costField = costFields.find(field => field.includes(`Plan ${planNum} Cost`));
    
    return {
      planName: fields[planField][0],
      planCost: costField ? fields[costField][0] : null,
      planNumber: planNum
    };
  });
  
  return {
    linkedRecordIds: fields[categoryName],
    plans
  };
}

// Main function to run the script
function main() {
  fetchAddonData()
    .then(addonData => {
      if (addonData.length > 0) {
        console.log('\nAddon Data:');
        addonData.forEach((record, index) => {
          console.log(`\nRecord ${index + 1}:`);
          
          // Display Individual Addons
          if (record.addonCategories.individual) {
            console.log('\nIndividual Addons:');
            record.addonCategories.individual.plans.forEach(plan => {
              console.log(`- Plan ${plan.planNumber}: ${plan.planName} (${plan.planCost})`);
            });
          }
          
          // Display Family Addons
          if (record.addonCategories.family) {
            console.log('\nFamily Addons:');
            record.addonCategories.family.plans.forEach(plan => {
              console.log(`- Plan ${plan.planNumber}: ${plan.planName} (${plan.planCost})`);
            });
          }
          
          // Display Individual + Spouse Addons
          if (record.addonCategories.individualSpouse) {
            console.log('\nIndividual + Spouse Addons:');
            record.addonCategories.individualSpouse.plans.forEach(plan => {
              console.log(`- Plan ${plan.planNumber}: ${plan.planName} (${plan.planCost})`);
            });
          }
          
          // Display Individual + Children Addons
          if (record.addonCategories.individualChildren) {
            console.log('\nIndividual + Children Addons:');
            record.addonCategories.individualChildren.plans.forEach(plan => {
              console.log(`- Plan ${plan.planNumber}: ${plan.planName} (${plan.planCost})`);
            });
          }
        });
      }
    });
}

// Run the script
main();
