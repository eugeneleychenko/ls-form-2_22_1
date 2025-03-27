// Test form data structure to mimic the real form submission
const formData = {
  basicInformation: {
    leadId: 'TEST-FORM-' + Date.now(),
    firstName: 'Test',
    lastName: 'Form'
  },
  insuranceDetails: {
    typeOfInsurance: 'Individual + Spouse',
    insuranceState: 'CA',
    carrierU65: 'Test Carrier',
    plan: 'Test Plan $100',
    planCost: '$100',
    planCommission: '$30',
    
    // American Financial Plans - these should map to "American Financial Plan X" fields
    americanFinancial1Plan: 'AF AD&D 50K $93.00',
    americanFinancial1Premium: '$93',
    americanFinancial1Commission: '$20',
    
    americanFinancial2Plan: 'AF AME 1000 $45.00',
    americanFinancial2Premium: '$45',
    americanFinancial2Commission: '$20',
    
    americanFinancial3Plan: 'AF Critical Illness 2,500 $64.00',
    americanFinancial3Premium: '$64',
    americanFinancial3Commission: '$20',
    
    // AMT Plans - these should map to "AMT X" fields
    amt1Plan: 'AMT- Safeguard w/TeleMed $134.98',
    amt1Commission: '$30',
    
    amt2Plan: 'TeleMed $43.97',
    amt2Commission: '$30',
    
    // Leo Addons - this should map to "Leo Addons" field
    leoAddonsPlans: 'Telemedicine $69.95, Virtual Primary Care +RX $329.00',
    leoAddonsCommission: '$253.36',
    
    // Other fields
    enrollmentFee: '$99',
    enrollmentFeeCommission: '$10',
    totalCommission: '$567.31'
  }
};

// Simulate the Airtable mapping logic
function mapToAirtableFields(formData) {
  const airtableFields = {
    'Lead ID': formData.basicInformation.leadId,
    'firstName': formData.basicInformation.firstName,
    'lastName': formData.basicInformation.lastName,
    'Type': formData.insuranceDetails.typeOfInsurance,
    'Insurance State': formData.insuranceDetails.insuranceState,
    'Carrier U65': formData.insuranceDetails.carrierU65,
    'Plan': formData.insuranceDetails.plan,
    'Carrier U65 Premium': formData.insuranceDetails.planCost,
    'Carrier U65 Commission': formData.insuranceDetails.planCommission,
    
    // Map American Financial fields
    'American Financial Plan 1': formData.insuranceDetails.americanFinancial1Plan,
    'American Financial 1 Premium': formData.insuranceDetails.americanFinancial1Premium,
    'American Financial 1 Commission': formData.insuranceDetails.americanFinancial1Commission,
    
    'American Financial Plan 2': formData.insuranceDetails.americanFinancial2Plan,
    'American Financial 2 Premium': formData.insuranceDetails.americanFinancial2Premium,
    'American Financial 2 Commission': formData.insuranceDetails.americanFinancial2Commission,
    
    'American Financial Plan 3': formData.insuranceDetails.americanFinancial3Plan,
    'American Financial 3 Premium': formData.insuranceDetails.americanFinancial3Premium,
    'American Financial 3 Commission': formData.insuranceDetails.americanFinancial3Commission,
    
    // Map AMT fields
    'AMT 1': formData.insuranceDetails.amt1Plan,
    'AMT 1 Commission': formData.insuranceDetails.amt1Commission,
    
    'AMT 2': formData.insuranceDetails.amt2Plan,
    'AMT 2 Commission': formData.insuranceDetails.amt2Commission,
    
    // Map Leo Addons fields
    'Leo Addons': formData.insuranceDetails.leoAddonsPlans,
    'Leo Addons Commissions': formData.insuranceDetails.leoAddonsCommission,
    
    // Map other fields
    'Enrollment Fee': formData.insuranceDetails.enrollmentFee,
    'Enrollment Fee Commission': formData.insuranceDetails.enrollmentFeeCommission,
    'Total Commission': formData.insuranceDetails.totalCommission
  };
  
  return airtableFields;
}

// Test the mapping
const airtableFields = mapToAirtableFields(formData);

// Print the results
console.log('FORM DATA');
console.log('=========');
console.log(JSON.stringify(formData, null, 2));

console.log('\nMAPPED AIRTABLE FIELDS');
console.log('=====================');
console.log(JSON.stringify(airtableFields, null, 2));

// Check specifically for American Financial, AMT and Leo Addon fields
console.log('\nCHECKING ADDON FIELDS');
console.log('===================');

// Check American Financial fields
console.log('American Financial:');
console.log('Plan 1:', airtableFields['American Financial Plan 1'] || 'NOT MAPPED');
console.log('Plan 2:', airtableFields['American Financial Plan 2'] || 'NOT MAPPED');
console.log('Plan 3:', airtableFields['American Financial Plan 3'] || 'NOT MAPPED');

// Check AMT fields
console.log('\nAMT:');
console.log('AMT 1:', airtableFields['AMT 1'] || 'NOT MAPPED');
console.log('AMT 2:', airtableFields['AMT 2'] || 'NOT MAPPED');

// Check Leo Addons field
console.log('\nLeo Addons:');
console.log('Leo Addons:', airtableFields['Leo Addons'] || 'NOT MAPPED'); 