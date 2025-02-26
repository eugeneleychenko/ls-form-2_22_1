const baseId = 'appYMEW2CsYkdpQ7c';
const tableId = 'tblBxPxL2R5AEyZaC';
const endpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`;

https://airtable.com/appYMEW2CsYkdpQ7c/shrQ0FciTfp8PzYIh/tblBxPxL2R5AEyZaC

// Function to fetch all fields from the specified table
function fetchSubmissionFields() {
  console.log('Fetching submission fields from Airtable...');
  
  return fetch(endpoint, {
    headers: {
      Authorization: `Bearer pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.records && data.records.length > 0) {
      // Process the records to extract all fields
      const fields = {};
      
      data.records.forEach(record => {
        // Add all fields from each record to our fields object
        Object.keys(record.fields).forEach(key => {
          if (!fields[key]) {
            fields[key] = new Set();
          }
          
          // Add the value to the set (to avoid duplicates)
          if (Array.isArray(record.fields[key])) {
            record.fields[key].forEach(value => fields[key].add(value));
          } else {
            fields[key].add(record.fields[key]);
          }
        });
      });
      
      // Convert sets to arrays for the final output
      const formattedFields = {};
      Object.keys(fields).forEach(key => {
        formattedFields[key] = Array.from(fields[key]).sort();
      });
      
      console.log('Successfully fetched submission fields');
      return formattedFields;
    } else {
      console.log('No records found in the table');
      return {};
    }
  })
  .catch(error => {
    console.error('Error fetching submission fields:', error);
    return {};
  });
}

// Export the function for use in other files
module.exports = {
  fetchSubmissionFields
};

// If this file is run directly, execute the function and log the results
if (require.main === module) {
  fetchSubmissionFields().then(fields => {
    console.log(JSON.stringify(fields, null, 2));
  });
}
