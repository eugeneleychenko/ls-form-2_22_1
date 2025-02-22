const baseId = 'appYMEW2CsYkdpQ7c';
const tableName = 'tbl2WlsDz9rPXhVVY';
const endpoint = `https://api.airtable.com/v0/${baseId}/${tableName}`;

export type CarriersByType = {
  [key: string]: string[];
};

export const fetchCarriers = async (): Promise<CarriersByType> => {
  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025`
      }
    });

    const data = await response.json();
    const carriersByType: CarriersByType = {};

    data.records.forEach((record: any) => {
      const type = record.fields.Type;
      const carrier = record.fields.Carriers;

      if (!carriersByType[type]) {
        carriersByType[type] = [];
      }

      if (!carriersByType[type].includes(carrier)) {
        carriersByType[type].push(carrier);
      }
    });

    // Sort carriers within each type
    Object.keys(carriersByType).forEach(type => {
      carriersByType[type].sort();
    });

    return carriersByType;
  } catch (error) {
    console.error('Error fetching carriers:', error);
    return {};
  }
};

// Get all available plan types
export const getPlanTypes = (carriers: CarriersByType): string[] => {
  return Object.keys(carriers).sort();
};

// Get carriers for a specific plan type
export const getCarriersForPlan = (carriers: CarriersByType, planType: string): string[] => {
  return carriers[planType] || [];
}; 