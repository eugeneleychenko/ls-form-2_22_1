const Airtable = require('airtable');

const baseId = 'appYMEW2CsYkdpQ7c';
const tableId = 'tblBxPxL2R5AEyZaC';
const apiKey = 'pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025';

// Configure Airtable
Airtable.configure({
  apiKey: apiKey
});

const base = Airtable.base(baseId);

// Function to fetch record by Lead ID
async function fetchRecordByLeadId(leadId) {
  try {
    const records = await base(tableId).select({
      filterByFormula: `{Lead ID} = '${leadId}'`
    }).firstPage();
    
    if (records && records.length > 0) {
      return records[0];
    } else {
      console.error('No record found with Lead ID:', leadId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching record:', error);
    return null;
  }
}

// Fetch the record with Lead ID 876
async function main() {
  const record = await fetchRecordByLeadId('876');
  
  if (record) {
    console.log('Record found for Lead ID 876:');
    
    // Check specifically for American Financial fields
    console.log('\nAmerican Financial Fields:');
    console.log('American Financial Plan 1:', record.fields['American Financial Plan 1'] || 'NOT SET');
    console.log('American Financial 1 Premium:', record.fields['American Financial 1 Premium'] || 'NOT SET');
    console.log('American Financial 1 Commission:', record.fields['American Financial 1 Commission'] || 'NOT SET');
    
    console.log('American Financial Plan 2:', record.fields['American Financial Plan 2'] || 'NOT SET');
    console.log('American Financial 2 Premium:', record.fields['American Financial 2 Premium'] || 'NOT SET');
    console.log('American Financial 2 Commission:', record.fields['American Financial 2 Commission'] || 'NOT SET');
    
    console.log('American Financial Plan 3:', record.fields['American Financial Plan 3'] || 'NOT SET');
    console.log('American Financial 3 Premium:', record.fields['American Financial 3 Premium'] || 'NOT SET');
    console.log('American Financial 3 Commission:', record.fields['American Financial 3 Commission'] || 'NOT SET');
    
    // Check for AMT fields
    console.log('\nAMT Fields:');
    console.log('AMT 1:', record.fields['AMT 1'] || 'NOT SET');
    console.log('AMT 1 Commission:', record.fields['AMT 1 Commission'] || 'NOT SET');
    console.log('AMT 2:', record.fields['AMT 2'] || 'NOT SET');
    console.log('AMT 2 Commission:', record.fields['AMT 2 Commission'] || 'NOT SET');
    
    // Check for Leo Addons fields
    console.log('\nLeo Addons Fields:');
    console.log('Leo Addons:', record.fields['Leo Addons'] || 'NOT SET');
    console.log('Leo Addons Commissions:', record.fields['Leo Addons Commissions'] || 'NOT SET');
    
    // Check for Total Premium
    console.log('\nTotal Premium:', record.fields['Total Premium'] || 'NOT SET');
    
    // Check for all fields to see everything that was saved
    console.log('\nAll fields in record:');
    console.log(JSON.stringify(record.fields, null, 2));
  }
}

main(); 