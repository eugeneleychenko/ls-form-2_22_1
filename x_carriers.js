/**
 * x_carriers.js - Fetches carrier data from Airtable
 * 
 * This script retrieves carrier information from the specified Airtable base
 * including plan information and costs to match the table structure.
 */

const baseId = 'appYMEW2CsYkdpQ7c';
const tableId = 'tbl2WlsDz9rPXhVVY';
const apiKey = 'pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025';
const endpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`;

/**
 * Fetches all carriers from the Airtable database
 * @returns {Promise<Array>} Array of carrier records
 */
async function fetchCarriers() {
  console.log('Fetching carriers from Airtable...');
  
  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.records && data.records.length > 0) {
      console.log(`Successfully fetched ${data.records.length} carriers`);
      
      // Process the data to match the table structure
      const processedData = processCarrierData(data.records);
      return processedData;
    } else {
      console.log('No carriers found in the table');
      return [];
    }
  } catch (error) {
    console.error('Error fetching carriers:', error);
    return [];
  }
}

/**
 * Format a value to a string, handling various data types
 * @param {*} value - The value to format
 * @returns {string} The formatted value as a string
 */
function formatValue(value) {
  if (value === undefined || value === null) {
    return '#ERROR!';
  }
  
  if (typeof value === 'object') {
    // If it's an object, return error
    return '#ERROR!';
  }
  
  return value.toString();
}

/**
 * Process carrier data to match the table structure
 * @param {Array} records - Raw carrier records from Airtable
 * @returns {Array} Processed carrier records
 */
function processCarrierData(records) {
  return records.map(record => {
    const carrier = {
      id: record.id,
      name: record.fields.Name || 'N/A',
      plans: []
    };
    
    // Process Plan 1
    if (record.fields['Plan 1']) {
      carrier.plans.push({
        planNumber: 1,
        name: record.fields['Plan 1'],
        cost: formatValue(record.fields['Plan 1 Cost']),
        coverage: formatValue(record.fields['Plan 1 Coverage'] || 0.30)
      });
    }
    
    // Process Plan 2
    if (record.fields['Plan 2']) {
      carrier.plans.push({
        planNumber: 2,
        name: record.fields['Plan 2'],
        cost: formatValue(record.fields['Plan 2 Cost']),
        coverage: formatValue(record.fields['Plan 2 Coverage'] || 0.30)
      });
    }
    
    // Add more plans as needed based on the table structure
    // Process Plans 3-14 if they exist
    for (let i = 3; i <= 14; i++) {
      const planField = `Plan ${i}`;
      const costField = `Plan ${i} Cost`;
      const coverageField = `Plan ${i} Coverage`;
      
      if (record.fields[planField]) {
        carrier.plans.push({
          planNumber: i,
          name: record.fields[planField],
          cost: formatValue(record.fields[costField]),
          coverage: formatValue(record.fields[coverageField] || 0.30)
        });
      }
    }
    
    return carrier;
  });
}

/**
 * Formats a string to a specific width with padding
 * @param {string} str - The string to format
 * @param {number} width - The desired width
 * @returns {string} The padded string
 */
function padString(str, width) {
  str = String(str || '');
  if (str.length > width) {
    return str.substring(0, width);
  }
  return str + ' '.repeat(width - str.length);
}

/**
 * Displays carrier information in a table format similar to the screenshot
 */
async function displayCarriersTable() {
  const carriers = await fetchCarriers();
  
  if (carriers.length === 0) {
    console.log('No carriers to display');
    return;
  }
  
  // Define column widths - ensure they're properly sized for the data
  const colWidths = {
    carrier: 20,
    plan1: 40,
    plan1Cost: 15,
    plan1Coverage: 10,
    plan2: 40,
    plan2Cost: 15
  };
  
  // Create the table header
  console.log(
    padString('Carriers', colWidths.carrier) +
    padString('Plan 1', colWidths.plan1) +
    padString('Plan 1 Cost', colWidths.plan1Cost) +
    padString('Plan 1 C...', colWidths.plan1Coverage) +
    padString('Plan 2', colWidths.plan2) +
    padString('Plan 2 Cost', colWidths.plan2Cost)
  );
  
  // Create a separator row
  console.log(
    padString('='.repeat(colWidths.carrier), colWidths.carrier) +
    padString('='.repeat(colWidths.plan1), colWidths.plan1) +
    padString('='.repeat(colWidths.plan1Cost), colWidths.plan1Cost) +
    padString('='.repeat(colWidths.plan1Coverage), colWidths.plan1Coverage) +
    padString('='.repeat(colWidths.plan2), colWidths.plan2) +
    padString('='.repeat(colWidths.plan2Cost), colWidths.plan2Cost)
  );
  
  // Create the table rows
  carriers.forEach((carrier, index) => {
    const rowNum = index + 1;
    let plan1 = 'N/A';
    let plan1Cost = 'N/A';
    let plan1Coverage = 'N/A';
    let plan2 = 'N/A';
    let plan2Cost = 'N/A';
    
    if (carrier.plans.length > 0) {
      const plan1Data = carrier.plans.find(plan => plan.planNumber === 1);
      if (plan1Data) {
        plan1 = plan1Data.name;
        plan1Cost = plan1Data.cost;
        plan1Coverage = plan1Data.coverage;
      }
      
      const plan2Data = carrier.plans.find(plan => plan.planNumber === 2);
      if (plan2Data) {
        plan2 = plan2Data.name;
        plan2Cost = plan2Data.cost;
      }
    }
    
    console.log(
      padString(`${rowNum}. ${carrier.name}`, colWidths.carrier) +
      padString(plan1, colWidths.plan1) +
      padString(plan1Cost, colWidths.plan1Cost) +
      padString(plan1Coverage, colWidths.plan1Coverage) +
      padString(plan2, colWidths.plan2) +
      padString(plan2Cost, colWidths.plan2Cost)
    );
  });
}

/**
 * Searches for Everest plans and displays detailed information
 */
async function checkEverestPlans() {
  const carriers = await fetchCarriers();
  
  if (carriers.length === 0) {
    console.log('No carriers to display');
    return;
  }
  
  console.log('\n=== EVEREST PLANS DETAILS ===\n');
  
  carriers.forEach(carrier => {
    // Search for "Everest" in the carrier name or plan names
    const isEverest = 
      carrier.name.toLowerCase().includes('everest') || 
      carrier.plans.some(plan => plan.name.toLowerCase().includes('everest'));
    
    if (isEverest) {
      console.log(`Carrier: ${carrier.name} (ID: ${carrier.id})`);
      
      carrier.plans.forEach(plan => {
        console.log(`  Plan: ${plan.name}`);
        console.log(`    Cost: ${plan.cost}`);
        console.log(`    Commission Rate: ${plan.coverage}`);
        
        // Calculate commission amount
        const costValue = parseFloat(plan.cost.replace(/[^0-9.-]+/g, ''));
        const commissionRate = parseFloat(plan.coverage);
        if (!isNaN(costValue) && !isNaN(commissionRate)) {
          const commission = costValue * commissionRate;
          console.log(`    Commission Amount: $${commission.toFixed(2)}`);
        }
        
        console.log(''); // Add a blank line for readability
      });
    }
  });
}

/**
 * Searches for Health Choice Silver plans and displays detailed information
 */
async function checkHealthChoiceSilverPlans() {
  const carriers = await fetchCarriers();
  
  if (carriers.length === 0) {
    console.log('No carriers to display');
    return;
  }
  
  console.log('\n=== HEALTH CHOICE SILVER PLANS DETAILS ===\n');
  
  carriers.forEach(carrier => {
    // Search for "Health Choice" in the carrier name or plan names
    const isHealthChoice = 
      carrier.name.toLowerCase().includes('health choice') || 
      carrier.plans.some(plan => plan.name.toLowerCase().includes('health choice'));
    
    if (isHealthChoice) {
      console.log(`Carrier: ${carrier.name} (ID: ${carrier.id})`);
      
      carrier.plans.forEach(plan => {
        if (plan.name.toLowerCase().includes('health choice')) {
          console.log(`  Plan: ${plan.name}`);
          console.log(`    Cost: ${plan.cost}`);
          console.log(`    Commission Rate: ${plan.coverage}`);
          
          // Calculate commission amount
          const costValue = parseFloat(plan.cost.replace(/[^0-9.-]+/g, ''));
          const commissionRate = parseFloat(plan.coverage);
          if (!isNaN(costValue) && !isNaN(commissionRate)) {
            const commission = costValue * commissionRate;
            console.log(`    Commission Amount: $${commission.toFixed(2)}`);
          }
          
          console.log(''); // Add a blank line for readability
        }
      });
    }
  });
}

// Export functions for use in other files
module.exports = {
  fetchCarriers,
  displayCarriersTable,
  checkEverestPlans,
  checkHealthChoiceSilverPlans
};

// If this file is run directly, execute the display function
if (require.main === module) {
  // displayCarriersTable();
  // checkEverestPlans();
  checkHealthChoiceSilverPlans();
}
