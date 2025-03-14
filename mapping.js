const baseId = 'appYMEW2CsYkdpQ7c';
const tableName = 'tbl2WlsDz9rPXhVVY';
const endpoint = `https://api.airtable.com/v0/${baseId}/${tableName}`;

fetch(endpoint, {
  headers: {
    Authorization: `Bearer pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025`
  }
})
.then(response => response.json())
.then(data => {
  // Create an object to store all data by type
  const dataByType = {};

  // Process each record
  data.records.forEach(record => {
    const type = record.fields.Type;
    const carrier = record.fields.Carriers;
    
    // Initialize the type object if it doesn't exist
    if (!dataByType[type]) {
      dataByType[type] = {
        carriers: new Set(),
        plans: {
          plan1: new Set(),
          plan1Cost: new Set(),
          plan1Commission: new Set(),
          plan2: new Set(),
          plan2Cost: new Set(),
          plan2Commission: new Set(),
          plan3: new Set(),
          plan3Cost: new Set(),
          plan3Commission: new Set(),
          plan4: new Set(),
          plan4Cost: new Set(),
          plan4Commission: new Set(),
          plan5: new Set(),
          plan5Cost: new Set(),
          plan5Commission: new Set(),
          plan6: new Set(),
          plan6Cost: new Set(),
          plan6Commission: new Set(),
          plan7: new Set(),
          plan7Cost: new Set(),
          plan7Commission: new Set(),
          plan8: new Set(),
          plan8Cost: new Set(),
          plan8Commission: new Set(),
        },
        // New structure to map plans, costs, and commissions
        planMappings: [],
        // Add a structure to store all records with their full data
        records: []
      };
    }

    // Add carrier and plan data to their respective Sets
    dataByType[type].carriers.add(carrier);
    
    // Add plans, costs, and commissions if they exist
    if (record.fields['Plan 1']) dataByType[type].plans.plan1.add(record.fields['Plan 1']);
    if (record.fields['Plan 1 Cost']) dataByType[type].plans.plan1Cost.add(record.fields['Plan 1 Cost']);
    if (record.fields['Plan 1 Commission']) dataByType[type].plans.plan1Commission.add(record.fields['Plan 1 Commission']);
    
    if (record.fields['Plan 2']) dataByType[type].plans.plan2.add(record.fields['Plan 2']);
    if (record.fields['Plan 2 Cost']) dataByType[type].plans.plan2Cost.add(record.fields['Plan 2 Cost']);
    if (record.fields['Plan 2 Commission']) dataByType[type].plans.plan2Commission.add(record.fields['Plan 2 Commission']);
    
    if (record.fields['Plan 3']) dataByType[type].plans.plan3.add(record.fields['Plan 3']);
    if (record.fields['Plan 3 Cost']) dataByType[type].plans.plan3Cost.add(record.fields['Plan 3 Cost']);
    if (record.fields['Plan 3 Commission']) dataByType[type].plans.plan3Commission.add(record.fields['Plan 3 Commission']);
    
    if (record.fields['Plan 4']) dataByType[type].plans.plan4.add(record.fields['Plan 4']);
    if (record.fields['Plan 4 Cost']) dataByType[type].plans.plan4Cost.add(record.fields['Plan 4 Cost']);
    if (record.fields['Plan 4 Commission']) dataByType[type].plans.plan4Commission.add(record.fields['Plan 4 Commission']);
    
    if (record.fields['Plan 5']) dataByType[type].plans.plan5.add(record.fields['Plan 5']);
    if (record.fields['Plan 5 Cost']) dataByType[type].plans.plan5Cost.add(record.fields['Plan 5 Cost']);
    if (record.fields['Plan 5 Commission']) dataByType[type].plans.plan5Commission.add(record.fields['Plan 5 Commission']);
    
    if (record.fields['Plan 6']) dataByType[type].plans.plan6.add(record.fields['Plan 6']);
    if (record.fields['Plan 6 Cost']) dataByType[type].plans.plan6Cost.add(record.fields['Plan 6 Cost']);
    if (record.fields['Plan 6 Commission']) dataByType[type].plans.plan6Commission.add(record.fields['Plan 6 Commission']);
    
    if (record.fields['Plan 7']) dataByType[type].plans.plan7.add(record.fields['Plan 7']);
    if (record.fields['Plan 7 Cost']) dataByType[type].plans.plan7Cost.add(record.fields['Plan 7 Cost']);
    if (record.fields['Plan 7 Commission']) dataByType[type].plans.plan7Commission.add(record.fields['Plan 7 Commission']);
    
    if (record.fields['Plan 8']) dataByType[type].plans.plan8.add(record.fields['Plan 8']);
    if (record.fields['Plan 8 Cost']) dataByType[type].plans.plan8Cost.add(record.fields['Plan 8 Cost']);
    if (record.fields['Plan 8 Commission']) dataByType[type].plans.plan8Commission.add(record.fields['Plan 8 Commission']);
    
    // Create mappings between plans, costs, and commissions
    for (let i = 1; i <= 8; i++) {
      const planKey = `Plan ${i}`;
      const costKey = `Plan ${i} Cost`;
      const commissionKey = `Plan ${i} Commission`;
      
      if (record.fields[planKey] && (record.fields[costKey] || record.fields[commissionKey])) {
        dataByType[type].planMappings.push({
          carrier: carrier,
          plan: record.fields[planKey],
          cost: record.fields[costKey] || null,
          commission: record.fields[commissionKey] || null,
          // Add the two new columns
          enrollmentFees: record.fields['Enrollment Fees'] || null,
          statesUnavailable: record.fields['States Unavailable'] || null
        });
      }
    }
    
    // Store the complete record data
    dataByType[type].records.push({
      id: record.id,
      type: type,
      carrier: carrier,
      // Include all plan data
      plan1: record.fields['Plan 1'] || null,
      plan1Cost: record.fields['Plan 1 Cost'] || null,
      plan1Commission: record.fields['Plan 1 Commission'] || null,
      plan2: record.fields['Plan 2'] || null,
      plan2Cost: record.fields['Plan 2 Cost'] || null,
      plan2Commission: record.fields['Plan 2 Commission'] || null,
      plan3: record.fields['Plan 3'] || null,
      plan3Cost: record.fields['Plan 3 Cost'] || null,
      plan3Commission: record.fields['Plan 3 Commission'] || null,
      plan4: record.fields['Plan 4'] || null,
      plan4Cost: record.fields['Plan 4 Cost'] || null,
      plan4Commission: record.fields['Plan 4 Commission'] || null,
      plan5: record.fields['Plan 5'] || null,
      plan5Cost: record.fields['Plan 5 Cost'] || null,
      plan5Commission: record.fields['Plan 5 Commission'] || null,
      plan6: record.fields['Plan 6'] || null,
      plan6Cost: record.fields['Plan 6 Cost'] || null,
      plan6Commission: record.fields['Plan 6 Commission'] || null,
      plan7: record.fields['Plan 7'] || null,
      plan7Cost: record.fields['Plan 7 Cost'] || null,
      plan7Commission: record.fields['Plan 7 Commission'] || null,
      plan8: record.fields['Plan 8'] || null,
      plan8Cost: record.fields['Plan 8 Cost'] || null,
      plan8Commission: record.fields['Plan 8 Commission'] || null,
      // Add the two new columns
      enrollmentFees: record.fields['Enrollment Fees'] || null,
      statesUnavailable: record.fields['States Unavailable'] || null,
      // Include any other fields that might be useful
      addons: record.fields['Addons?'] || false,
      // Store the original record for reference
      originalRecord: record.fields
    });
  });

  // Convert Sets to Arrays and create final output
  const formattedOutput = {};
  for (const [type, data] of Object.entries(dataByType)) {
    formattedOutput[type] = {
      carriers: Array.from(data.carriers).sort(),
      plans: {
        plan1: Array.from(data.plans.plan1).sort(),
        plan1Cost: Array.from(data.plans.plan1Cost).sort(),
        plan1Commission: Array.from(data.plans.plan1Commission).sort(),
        plan2: Array.from(data.plans.plan2).sort(),
        plan2Cost: Array.from(data.plans.plan2Cost).sort(),
        plan2Commission: Array.from(data.plans.plan2Commission).sort(),
        plan3: Array.from(data.plans.plan3).sort(),
        plan3Cost: Array.from(data.plans.plan3Cost).sort(),
        plan3Commission: Array.from(data.plans.plan3Commission).sort(),
        plan4: Array.from(data.plans.plan4).sort(),
        plan4Cost: Array.from(data.plans.plan4Cost).sort(),
        plan4Commission: Array.from(data.plans.plan4Commission).sort(),
        plan5: Array.from(data.plans.plan5).sort(),
        plan5Cost: Array.from(data.plans.plan5Cost).sort(),
        plan5Commission: Array.from(data.plans.plan5Commission).sort(),
        plan6: Array.from(data.plans.plan6).sort(),
        plan6Cost: Array.from(data.plans.plan6Cost).sort(),
        plan6Commission: Array.from(data.plans.plan6Commission).sort(),
        plan7: Array.from(data.plans.plan7).sort(),
        plan7Cost: Array.from(data.plans.plan7Cost).sort(),
        plan7Commission: Array.from(data.plans.plan7Commission).sort(),
        plan8: Array.from(data.plans.plan8).sort(),
        plan8Cost: Array.from(data.plans.plan8Cost).sort(),
        plan8Commission: Array.from(data.plans.plan8Commission).sort(),
      },
      // Include the plan mappings in the output
      planMappings: data.planMappings,
      // Include the full records
      records: data.records
    };
  }

  // Create a tabular view of the data
  const tabularData = [];
  
  // For each type and record, create a row-based view
  for (const [type, data] of Object.entries(dataByType)) {
    data.records.forEach(record => {
      // For each plan in the record, create a separate row
      for (let i = 1; i <= 8; i++) {
        const planKey = `plan${i}`;
        const costKey = `${planKey}Cost`;
        const commissionKey = `${planKey}Commission`;
        
        if (record[planKey]) {
          tabularData.push({
            type: type,
            carrier: record.carrier,
            planNumber: i,
            planName: record[planKey],
            planCost: record[costKey],
            planCommission: record[commissionKey],
            enrollmentFees: record.enrollmentFees,
            statesUnavailable: record.statesUnavailable,
            addons: record.addons
          });
        }
      }
    });
  }

  console.log("Formatted data by type:");
  console.log(JSON.stringify(formattedOutput, null, 2));
  
  console.log("\nTabular data (row-based view):");
  console.log(JSON.stringify(tabularData, null, 2));
  
  // Optional: Create a CSV-like output for easy viewing
  console.log("\nCSV-like view:");
  console.log("Type,Carrier,Plan #,Plan Name,Plan Cost,Plan Commission,Enrollment Fees,States Unavailable,Has Addons");
  tabularData.forEach(row => {
    console.log(`${row.type},${row.carrier},${row.planNumber},${row.planName},${row.planCost},${row.planCommission},${row.enrollmentFees},${row.statesUnavailable},${row.addons}`);
  });
})
.catch(error => {
  console.error('Error fetching data:', error);
});
