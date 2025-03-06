const Airtable = require('airtable');

const baseId = 'appYMEW2CsYkdpQ7c';
const tableId = 'tblBxPxL2R5AEyZaC';
const apiKey = 'pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025';

// Configure Airtable
Airtable.configure({
  apiKey: apiKey
});

const base = Airtable.base(baseId);

// Function to fetch only the latest submission from Airtable
async function fetchLatestSubmission() {
  console.log('Fetching latest submission from Airtable...');
  
  try {
    // Get all records to make sure we don't miss any, including the latest one
    const records = await base(tableId)
      .select({
        // No maxRecords limit to ensure we get all records
      })
      .firstPage();
    
    console.log(`Successfully fetched ${records.length} submissions`);
    
    if (records && records.length > 0) {
      // Sort records by _createdTime which is the internal field for creation time
      records.sort((a, b) => {
        return new Date(b._rawJson.createdTime) - new Date(a._rawJson.createdTime);
      });
      
      const latestRecord = records[0]; // Get the latest record
      console.log('Latest Record ID:', latestRecord.id);
      console.log('Latest Record Lead ID:', latestRecord.fields['Lead ID'] || 'N/A');
      console.log('Latest Record created time:', latestRecord._rawJson.createdTime);
      
      // Return the record with its fields
      return latestRecord;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching submission:', error);
    return null;
  }
}

// Function to find submission by Lead ID
async function findSubmissionByLeadId(leadId) {
  console.log(`Searching for submission with Lead ID: ${leadId}...`);
  
  try {
    // Query for the specific Lead ID
    const records = await base(tableId)
      .select({
        filterByFormula: `{Lead ID} = '${leadId}'`
      })
      .firstPage();
    
    if (records && records.length > 0) {
      console.log(`Found ${records.length} record(s) with Lead ID: ${leadId}`);
      const record = records[0];
      console.log('Record ID:', record.id);
      return record;
    } else {
      console.log(`No records found with Lead ID: ${leadId}`);
      return null;
    }
  } catch (error) {
    console.error('Error finding submission by Lead ID:', error);
    return null;
  }
}

// Function to find submissions by name (first or last)
async function findSubmissionsByName(nameQuery) {
  if (!nameQuery || nameQuery.trim().length < 2) {
    console.log('Search query too short, minimum 2 characters required');
    return [];
  }
  
  console.log(`Searching for submissions with name containing: ${nameQuery}...`);
  
  const query = nameQuery.trim();
  
  try {
    // Get all records first since Airtable's SEARCH function may be unreliable
    const records = await base(tableId)
      .select()
      .firstPage();
    
    if (records && records.length > 0) {
      console.log(`Retrieved ${records.length} records, now filtering by name`);
      
      // Filter records manually with JavaScript for more reliable name matching
      const matchingRecords = records.filter(record => {
        // Get the name fields, ensuring they exist and are strings
        const firstName = ((record.fields.firstName || '') + '').toLowerCase();
        const lastName = ((record.fields.lastName || '') + '').toLowerCase();
        
        // Check if the query is contained in either first or last name
        return firstName.includes(query.toLowerCase()) || 
               lastName.includes(query.toLowerCase());
      });
      
      // Sort by most recent first
      matchingRecords.sort((a, b) => {
        return new Date(b._rawJson.createdTime) - new Date(a._rawJson.createdTime);
      });
      
      console.log(`Found ${matchingRecords.length} record(s) containing "${query}" in name fields`);
      
      // For each record, log the name for debugging
      matchingRecords.forEach(record => {
        const firstName = record.fields.firstName || '';
        const lastName = record.fields.lastName || '';
        console.log(`Match: ${firstName} ${lastName} (ID: ${record.id})`);
      });
      
      return matchingRecords;
    } else {
      console.log('No records found in the table');
      return [];
    }
  } catch (error) {
    console.error('Error finding submissions by name:', error);
    return [];
  }
}

// Export the functions for use in other files
module.exports = {
  fetchLatestSubmission,
  findSubmissionByLeadId,
  findSubmissionsByName
};

// If this file is run directly, execute both functions and log the results
if (require.main === module) {
  console.log("=== FETCHING LATEST SUBMISSION ===");
  fetchLatestSubmission().then(latestSubmission => {
    console.log('\nLatest submission summary:');
    if (latestSubmission) {
      const leadId = latestSubmission.fields['Lead ID'] || 'N/A';
      const firstName = latestSubmission.fields['firstName'] || 'N/A';
      const lastName = latestSubmission.fields['lastName'] || 'N/A';
      console.log(`Lead ID: ${leadId}, Name: ${firstName} ${lastName}`);
    } else {
      console.log('No submission found');
    }
    
    console.log("\n=== SEARCHING FOR SPECIFIC LEAD ID 11235 ===");
    // Check for Lead ID 11235
    findSubmissionByLeadId('11235').then(specificSubmission => {
      console.log('\nLead ID 11235 submission summary:');
      if (specificSubmission) {
        const createdTime = specificSubmission._rawJson.createdTime;
        const firstName = specificSubmission.fields['firstName'] || 'N/A';
        const lastName = specificSubmission.fields['lastName'] || 'N/A';
        console.log(`Lead ID: 11235, Name: ${firstName} ${lastName}, Created: ${createdTime}`);
        
        // After finding by ID, also test the name search
        console.log("\n=== TESTING NAME SEARCH ===");
        // Use the first name from the found submission for the name search
        if (firstName !== 'N/A') {
          findSubmissionsByName(firstName).then(nameMatches => {
            console.log(`Found ${nameMatches.length} submissions matching name "${firstName}"`);
          });
        }
      } else {
        console.log('No submission found with Lead ID 11235');
      }
    });
  });
}
