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
  // Create an object to store carriers by type
  const carriersByType = {};

  // Process each record
  data.records.forEach(record => {
    const type = record.fields.Type;
    const carrier = record.fields.Carriers;

    // Initialize the type array if it doesn't exist
    if (!carriersByType[type]) {
      carriersByType[type] = new Set();
    }

    // Add carrier to the Set to avoid duplicates
    carriersByType[type].add(carrier);
  });

  // Convert Sets to Arrays and create final output
  const formattedOutput = {};
  for (const [type, carriers] of Object.entries(carriersByType)) {
    formattedOutput[type] = Array.from(carriers).sort();
  }

  console.log(JSON.stringify(formattedOutput, null, 2));
})
.catch(error => {
  console.error('Error fetching data:', error);
});
