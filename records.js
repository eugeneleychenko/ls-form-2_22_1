const baseId = 'appYMEW2CsYkdpQ7c';
const tableId = 'tblBxPxL2R5AEyZaC';
const recordsEndpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`;

fetch(recordsEndpoint, {
  headers: {
    Authorization: `Bearer pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025`
  }
})
.then(response => response.json())
.then(data => {
  // Print all records with nice formatting
  console.log('Table Records:', JSON.stringify(data.records, null, 2));
  
  // Print count of records
  console.log(`Total records: ${data.records.length}`);
})
.catch(error => {
  console.error('Error fetching records:', error);
});