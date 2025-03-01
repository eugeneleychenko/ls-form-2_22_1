const baseId = 'appYMEW2CsYkdpQ7c';
const tableId = 'tblBxPxL2R5AEyZaC';
const endpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`;

https://airtable.com/appYMEW2CsYkdpQ7c/shrQ0FciTfp8PzYIh/tblBxPxL2R5AEyZaC

// Function to fetch column headings from the specified table
function fetchSubmissionFields() {
  console.log('Fetching column headings from Airtable...');
  
  return fetch(endpoint + '?maxRecords=1', {
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
      // Get the schema information to determine field order
      return fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
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
      .then(schemaData => {
        // Find the table in the schema
        const table = schemaData.tables.find(t => t.id === tableId);
        if (table && table.fields) {
          // Return just the field names in order
          const orderedFields = table.fields.map(field => field.name);
          console.log('Successfully fetched column headings');
          return orderedFields;
        } else {
          // Fallback: return keys from the first record if schema info is not available
          console.log('Table schema not found, returning keys from first record');
          return Object.keys(data.records[0].fields);
        }
      });
    } else {
      console.log('No records found in the table');
      return [];
    }
  })
  .catch(error => {
    console.error('Error fetching column headings:', error);
    return [];
  });
}

// Export the function for use in other files
module.exports = {
  fetchSubmissionFields
};

// If this file is run directly, execute the function and log the results
if (require.main === module) {
  fetchSubmissionFields().then(columnHeadings => {
    console.log(columnHeadings);
  });
}
