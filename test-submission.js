const Airtable = require('airtable');

const baseId = 'appYMEW2CsYkdpQ7c';
const tableId = 'tblBxPxL2R5AEyZaC';
const apiKey = 'pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025';

// Configure Airtable
Airtable.configure({
  apiKey: apiKey
});

const base = Airtable.base(baseId);

// Create a test submission with all the necessary fields
async function createTestSubmission() {
  console.log('Creating test submission with all addon fields...');
  
  // Create a unique lead ID based on current timestamp
  const leadId = `TEST-${Date.now()}`;
  
  // Create the test record
  const record = {
    'Lead ID': leadId,
    'firstName': 'Test',
    'lastName': 'Addons',
    'Type': 'Individual + Spouse',
    'Insurance State': 'CA',
    'Carrier U65': 'Test Carrier',
    'Plan': 'Test Plan $100',
    'Carrier U65 Premium': '100',
    'Carrier U65 Commission': '30',
    
    // American Financial fields
    'American Financial Plan 1': 'AF AD&D 50K $93.00',
    'American Financial 1 Premium': '93',
    'American Financial 1 Commission': '20',
    
    'American Financial Plan 2': 'AF AME 1000 $45.00',
    'American Financial 2 Premium': '45',
    'American Financial 2 Commission': '20',
    
    'American Financial Plan 3': 'AF Critical Illness 2,500 $64.00',
    'American Financial 3 Premium': '64',
    'American Financial 3 Commission': '20',
    
    // AMT fields - removed the Premium fields since they don't exist in Airtable
    'AMT 1': 'AMT- Safeguard w/TeleMed $134.98',
    'AMT 1 Commission': '30',
    
    'AMT 2': 'TeleMed $43.97',
    'AMT 2 Commission': '30',
    
    // Leo Addons fields
    'Leo Addons': 'Telemedicine $69.95, Virtual Primary Care +RX $329.00',
    'Leo Addons Commissions': '253.36',
    
    // Other necessary fields
    'Enrollment Fee': '99',
    'Enrollment Fee Commission': '10',
    'Total Commission': '567.31'
  };
  
  try {
    console.log('Submitting test record:', record);
    const createdRecord = await base(tableId).create(record);
    console.log('Successfully created test record with ID:', createdRecord.id);
    return createdRecord;
  } catch (error) {
    console.error('Error creating test record:', error);
    return null;
  }
}

// Function to fetch record by ID
async function fetchRecordById(recordId) {
  try {
    const record = await base(tableId).find(recordId);
    return record;
  } catch (error) {
    console.error('Error fetching record:', error);
    return null;
  }
}

// Main execution
async function main() {
  // Create the test submission
  const createdRecord = await createTestSubmission();
  
  if (createdRecord) {
    console.log('\nWaiting 5 seconds for Airtable to process the submission...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Fetch the record to verify all fields were properly saved
    console.log('\nFetching the submitted record to verify all fields...');
    const fetchedRecord = await fetchRecordById(createdRecord.id);
    
    if (fetchedRecord) {
      const fields = fetchedRecord.fields;
      
      console.log('\n=== VERIFICATION RESULTS ===');
      console.log('American Financial Plans:');
      console.log('American Financial Plan 1:', fields['American Financial Plan 1'] || 'Not Found');
      console.log('American Financial Plan 2:', fields['American Financial Plan 2'] || 'Not Found');
      console.log('American Financial Plan 3:', fields['American Financial Plan 3'] || 'Not Found');
      console.log('American Financial 1 Premium:', fields['American Financial 1 Premium'] || 'Not Found');
      console.log('American Financial 2 Premium:', fields['American Financial 2 Premium'] || 'Not Found');
      console.log('American Financial 3 Premium:', fields['American Financial 3 Premium'] || 'Not Found');
      
      console.log('\nAMT Plans:');
      console.log('AMT 1:', fields['AMT 1'] || 'Not Found');
      console.log('AMT 2:', fields['AMT 2'] || 'Not Found');
      console.log('AMT 1 Commission:', fields['AMT 1 Commission'] || 'Not Found');
      console.log('AMT 2 Commission:', fields['AMT 2 Commission'] || 'Not Found');
      
      console.log('\nLeo Addons:');
      console.log('Leo Addons:', fields['Leo Addons'] || 'Not Found');
      console.log('Leo Addons Commissions:', fields['Leo Addons Commissions'] || 'Not Found');
      
      console.log('\nAll submitted fields:');
      Object.keys(fields).sort().forEach(key => {
        console.log(`${key}: ${fields[key]}`);
      });
    }
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
}); 