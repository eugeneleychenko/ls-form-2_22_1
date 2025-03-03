const baseId = 'appYMEW2CsYkdpQ7c';
const tableId = 'tblBxPxL2R5AEyZaC';
const endpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`;

https://airtable.com/appYMEW2CsYkdpQ7c/shrQ0FciTfp8PzYIh/tblBxPxL2R5AEyZaC

// Function to fetch column headings and field types from the specified table
function fetchSubmissionFields() {
  console.log('Fetching column headings and field types from Airtable...');
  
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
      // Get the schema information to determine field order and types
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
          // Map field types to JavaScript/expected input types
          const fieldTypeMapping = {
            'singleLineText': 'string',
            'multilineText': 'string',
            'richText': 'string',
            'multipleAttachment': 'file/array',
            'checkbox': 'boolean',
            'singleSelect': 'string (from options)',
            'multipleSelect': 'array of strings (from options)',
            'date': 'string (ISO 8601 date)',
            'dateTime': 'string (ISO 8601 date+time)',
            'phoneNumber': 'string',
            'email': 'string (email format)',
            'url': 'string (URL format)',
            'number': 'number',
            'currency': 'number',
            'percent': 'number',
            'duration': 'number',
            'rating': 'number',
            'formula': 'varies (depends on formula)',
            'rollup': 'varies (depends on rollup)',
            'count': 'number',
            'lookup': 'varies (depends on referenced field)',
            'autoNumber': 'number',
            'barcode': 'string',
            'button': 'n/a (interface element)',
            'createdTime': 'string (ISO 8601 date+time)',
            'lastModifiedTime': 'string (ISO 8601 date+time)',
            'createdBy': 'object',
            'lastModifiedBy': 'object',
            'linkedRecord': 'array of record IDs'
          };
          
          // Return field names and their types in order
          const fieldsWithTypes = table.fields.map(field => {
            // Get the mapped JavaScript type or use the raw type if not mapped
            const expectedType = fieldTypeMapping[field.type] || field.type;
            
            // Include options for select fields if available
            let options = null;
            if ((field.type === 'singleSelect' || field.type === 'multipleSelect') && field.options && field.options.choices) {
              options = field.options.choices.map(choice => choice.name);
            }
            
            return {
              name: field.name,
              type: field.type,
              expectedType: expectedType,
              options: options
            };
          });
          
          console.log('Successfully fetched column headings and field types');
          return fieldsWithTypes;
        } else {
          // Fallback: return keys from the first record if schema info is not available
          console.log('Table schema not found, returning keys from first record without type info');
          return Object.keys(data.records[0].fields).map(key => ({
            name: key,
            type: 'unknown',
            expectedType: 'unknown'
          }));
        }
      });
    } else {
      console.log('No records found in the table');
      return [];
    }
  })
  .catch(error => {
    console.error('Error fetching column headings and field types:', error);
    return [];
  });
}

// Export the function for use in other files
module.exports = {
  fetchSubmissionFields
};

// If this file is run directly, execute the function and log the results
if (require.main === module) {
  fetchSubmissionFields().then(fieldsWithTypes => {
    console.log(JSON.stringify(fieldsWithTypes, null, 2));
  });
}
