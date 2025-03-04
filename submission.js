const baseId = 'appYMEW2CsYkdpQ7c';
const tableId = 'tblBxPxL2R5AEyZaC';
const endpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`;
const apiKey = 'pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025';

// Function to fetch only the latest submission from Airtable
function fetchLatestSubmission() {
  console.log('Fetching latest submission from Airtable...');
  
  // Just request records without sorting to see what fields are available
  return fetch(`${endpoint}?maxRecords=1`, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Successfully fetched submission');
    
    // Output the record structure to see available fields
    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      console.log('Record ID:', record.id);
      console.log('Record Fields:', Object.keys(record.fields));
      console.log('Record has createdTime:', record.createdTime);
    }
    
    // Return only the first record if it exists, otherwise null
    return data.records.length > 0 ? data.records[0] : null;
  })
  .catch(error => {
    console.error('Error fetching submission:', error);
    return null;
  });
}

// Export the function for use in other files
module.exports = {
  fetchLatestSubmission
};

// If this file is run directly, execute the function and log the results
if (require.main === module) {
  fetchLatestSubmission().then(submission => {
    console.log('Complete submission data:');
    console.log(JSON.stringify(submission, null, 2));
  });
}
