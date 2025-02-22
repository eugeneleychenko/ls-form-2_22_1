const baseId = 'appYMEW2CsYkdpQ7c';
const tableId = 'tblBxPxL2R5AEyZaC';
const metaEndpoint = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;

fetch(metaEndpoint, {
  headers: {
    Authorization: `Bearer pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025`
  }
})
.then(response => response.json())
.then(data => {
  // Find our specific table
  const table = data.tables.find(t => t.id === tableId);
  if (table) {
    // Extract field names
    const fields = table.fields.map(field => ({
      name: field.name,
      type: field.type
    }));
    console.log('Table Fields:', JSON.stringify(fields, null, 2));
  } else {
    console.log('Table not found');
  }
})
.catch(error => {
  console.error('Error fetching fields:', error);
});
