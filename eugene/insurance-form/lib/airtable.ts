import { FormData } from '@/types/form'

// Using environment variables for sensitive information
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID
const AIRTABLE_TABLE_ID = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
  throw new Error('Missing required Airtable environment variables')
}

// Helper function to ensure number fields are sent as numbers
const ensureNumber = (value: string | undefined): number | undefined => {
  if (!value || value === '') return undefined;
  // Remove any non-numeric characters except decimal point
  // This will strip dollar signs, commas, and other currency formatting
  const numericValue = value.replace(/[^\d.-]/g, '');
  const parsedValue = parseFloat(numericValue);
  return isNaN(parsedValue) ? undefined : parsedValue;
}

// Helper function to ensure currency fields are sent as strings
// Based on Airtable schema, most premium/commission fields expect string values
const ensureCurrencyString = (value: string | undefined): string | undefined => {
  if (!value || value === '') return undefined;
  // Remove any non-numeric characters except decimal point
  // This will also strip dollar signs, commas, etc.
  const numericValue = value.replace(/[^\d.-]/g, '');
  const parsedValue = parseFloat(numericValue);
  if (isNaN(parsedValue)) return undefined;
  
  // Return as string with 2 decimal places, without currency symbols
  return (Math.round(parsedValue * 100) / 100).toString();
}

// Helper function to ensure dates are in proper ISO format
const ensureDate = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  // If the value is already in YYYY-MM-DD format, return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  
  try {
    // Try to parse the date and format it correctly
    const date = new Date(value);
    if (isNaN(date.getTime())) return undefined; // Invalid date
    
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  } catch (e) {
    return undefined;
  }
}

// Helper function to ensure boolean values are actual booleans
const ensureBoolean = (value: any): boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  return Boolean(value);
}

// Currency fields that need to be numbers, not strings
const currencyNumberFields = [
  'Projected Annual Income',
  'ACA Plan Premium'
];

// Fields that do not exist in Airtable schema and should be removed
const invalidFields: string[] = [
  'ACA Plan Deductible',
  'Has Add-ons', 
  'Selected Add-ons',
  'Add-ons Cost',
  'Commission Rate', // These additional fields appear in the form data but not in Airtable
  'Add-ons Commission',
  'Enrollment Commission'
]; // American Financial Plan fields exist in Airtable and should NOT be in this list

const stringFields = [
  'Carrier U65 Premium',
  'Enrollment Fee', 'Carrier U65 Commission',
  'American Financial 1 Premium', 'American Financial 1 Commission',
  'American Financial 2 Premium', 'American Financial 2 Commission',
  'American Financial 3 Premium', 'American Financial 3 Commission',
  'Essential Care Premium', 'Essential Care Commission',
  'Total Premium', 'Enrollment Fee Commission', 'Total Commission'
];

// Function to check for common issues in the submission data
const validateSubmissionData = (data: any) => {
  const issues: string[] = [];
  
  // Check for any fields with undefined values (Airtable will reject these)
  for (const [key, value] of Object.entries(data.fields)) {
    if (value === undefined) {
      issues.push(`Field "${key}" has an undefined value.`);
      // Remove undefined fields
      delete data.fields[key];
    }
  }
  
  // Specific checks for known fields that have type requirements
  const numberFields = [
    'Zip', 'Billing Zip', 'CVV'
  ];
  
  // Convert number fields to ensure they're numbers
  numberFields.forEach(field => {
    if (field in data.fields && typeof data.fields[field] !== 'number') {
      const originalValue = data.fields[field];
      data.fields[field] = ensureNumber(String(originalValue));
      
      if (data.fields[field] === undefined) {
        issues.push(`Number field "${field}" could not be converted from "${originalValue}".`);
        delete data.fields[field]; // Remove invalid number fields
      }
    }
  });
  
  // Convert currency fields that must be numbers
  currencyNumberFields.forEach(field => {
    if (field in data.fields && typeof data.fields[field] !== 'number') {
      const originalValue = data.fields[field];
      data.fields[field] = ensureNumber(String(originalValue));
      
      if (data.fields[field] === undefined) {
        issues.push(`Currency number field "${field}" could not be converted from "${originalValue}".`);
        delete data.fields[field]; // Remove invalid fields
      }
    }
  });
  
  // Convert currency fields to strings
  stringFields.forEach(field => {
    if (field in data.fields) {
      const originalValue = data.fields[field];
      if (typeof originalValue !== 'string') {
        data.fields[field] = ensureCurrencyString(String(originalValue));
        
        if (data.fields[field] === undefined) {
          issues.push(`String field "${field}" could not be converted from "${originalValue}".`);
          delete data.fields[field]; // Remove invalid fields
        }
      }
    }
  });
  
  // Convert date fields to ISO format
  const dateFields = [
    'DOB', 'Dependent 1 DOB', 'Dependent 2 DOB', 'Dependent 3 DOB', 
    'Dependent 4 DOB', 'Dependent 5 DOB', 'Dependent 6 DOB'
  ];
  
  dateFields.forEach(field => {
    if (field in data.fields && typeof data.fields[field] === 'string') {
      const originalValue = data.fields[field];
      data.fields[field] = ensureDate(String(originalValue));
      
      if (data.fields[field] === undefined) {
        issues.push(`Date field "${field}" could not be converted from "${originalValue}".`);
        delete data.fields[field]; // Remove invalid date fields
      }
    }
  });
  
  // Ensure boolean fields are actual booleans
  const booleanFields = [
    'Currently Insured', 'Billing Info same as Applicant', 'Smoker?'
  ];
  
  booleanFields.forEach(field => {
    if (field in data.fields) {
      const originalValue = data.fields[field];
      if (field === 'Smoker?') {
        // Handle special case for Smoker field which expects "Yes"/"No"
        data.fields[field] = originalValue === true || originalValue === 'Yes' ? 'Yes' : 'No';
      } else {
        // Standard boolean fields
        data.fields[field] = ensureBoolean(originalValue);
      }
    }
  });
  
  return issues;
}

export const submitToAirtable = async (formData: FormData) => {
  // Map form data to Airtable fields
  const airtableRecord = {
    fields: {
      // Basic Information (Required fields)
      'Lead ID': formData.basicInformation.leadId,
      'firstName': formData.basicInformation.firstName,
      'lastName': formData.basicInformation.lastName,

      // Basic Information (Optional fields)
      ...(formData.basicInformation.email && { 'email': formData.basicInformation.email }),
      ...(formData.basicInformation.dateOfBirth && { 'DOB': ensureDate(formData.basicInformation.dateOfBirth) }),
      ...(formData.basicInformation.leadSource && { 'Lead Source': formData.basicInformation.leadSource }),
      
      // Health Information
      ...('currentlyInsured' in (formData.healthInformation || {}) ? { 'Currently Insured': ensureBoolean(formData.healthInformation?.currentlyInsured) } : {}),
      ...(formData.healthInformation?.lastTimeInsured && { 'Last Time Insured': formData.healthInformation.lastTimeInsured }),
      ...(formData.healthInformation?.currentMedications && { 'Current Medications': formData.healthInformation.currentMedications }),
      ...(formData.healthInformation?.preExistingConditions && { 'Pre Existing Conditions': formData.healthInformation.preExistingConditions }),
      ...(formData.healthInformation?.majorHospitalizations && { 'Major Hospitalizations/Surgeries': formData.healthInformation.majorHospitalizations }),
      ...(formData.healthInformation?.projectedAnnualIncome && { 'Projected Annual Income': ensureNumber(formData.healthInformation.projectedAnnualIncome) }),
      
      // Insurance Details
      ...(formData.insuranceDetails?.insuranceState && { 'Insurance State': formData.insuranceDetails.insuranceState }),
      ...(formData.insuranceDetails?.typeOfInsurance && { 'Type': formData.insuranceDetails.typeOfInsurance }),
      ...(formData.insuranceDetails?.carrierU65 && { 'Carrier U65': formData.insuranceDetails.carrierU65 }),
      ...(formData.insuranceDetails?.plan && { 'Plan': formData.insuranceDetails.plan }),
      
      // Premium and commission fields that do exist in the Airtable schema
      ...(formData.insuranceDetails?.planCost && { 'Carrier U65 Premium': ensureCurrencyString(formData.insuranceDetails.planCost) }),
      ...(formData.insuranceDetails?.carrierACA && { 'Carrier ACA': formData.insuranceDetails.carrierACA }),
      ...(formData.insuranceDetails?.acaPlanPremium && { 'ACA Plan Premium': ensureNumber(formData.insuranceDetails.acaPlanPremium) }),
      // Remove ACA Plan Deductible as it doesn't exist in schema
      ...(formData.insuranceDetails?.enrollmentFee && { 'Enrollment Fee': ensureCurrencyString(formData.insuranceDetails.enrollmentFee) }),
      ...(formData.insuranceDetails?.planCommission && { 'Carrier U65 Commission': ensureCurrencyString(formData.insuranceDetails.planCommission) }),
      ...(formData.insuranceDetails?.americanFinancial1Premium && { 'American Financial 1 Premium': ensureCurrencyString(formData.insuranceDetails.americanFinancial1Premium) }),
      ...(formData.insuranceDetails?.americanFinancial1Commission && { 'American Financial 1 Commission': ensureCurrencyString(formData.insuranceDetails.americanFinancial1Commission) }),
      ...(formData.insuranceDetails?.americanFinancial1Plan && { 'American Financial Plan 1': formData.insuranceDetails.americanFinancial1Plan }),
      ...(formData.insuranceDetails?.americanFinancial2Premium && { 'American Financial 2 Premium': ensureCurrencyString(formData.insuranceDetails.americanFinancial2Premium) }),
      ...(formData.insuranceDetails?.americanFinancial2Commission && { 'American Financial 2 Commission': ensureCurrencyString(formData.insuranceDetails.americanFinancial2Commission) }),
      ...(formData.insuranceDetails?.americanFinancial2Plan && { 'American Financial Plan 2': formData.insuranceDetails.americanFinancial2Plan }),
      ...(formData.insuranceDetails?.americanFinancial3Premium && { 'American Financial 3 Premium': ensureCurrencyString(formData.insuranceDetails.americanFinancial3Premium) }),
      ...(formData.insuranceDetails?.americanFinancial3Commission && { 'American Financial 3 Commission': ensureCurrencyString(formData.insuranceDetails.americanFinancial3Commission) }),
      ...(formData.insuranceDetails?.americanFinancial3Plan && { 'American Financial Plan 3': formData.insuranceDetails.americanFinancial3Plan }),
      ...(formData.insuranceDetails?.essentialCarePremium && { 'Essential Care Premium': ensureCurrencyString(formData.insuranceDetails.essentialCarePremium) }),
      ...(formData.insuranceDetails?.essentialCareCommission && { 'Essential Care Commission': ensureCurrencyString(formData.insuranceDetails.essentialCareCommission) }),
      ...(formData.insuranceDetails?.totalPremium && { 'Total Premium': ensureCurrencyString(formData.insuranceDetails.totalPremium) }),
      ...(formData.insuranceDetails?.enrollmentFeeCommission && { 'Enrollment Fee Commission': ensureCurrencyString(formData.insuranceDetails.enrollmentFeeCommission) }),
      ...(formData.insuranceDetails?.totalCommission && { 'Total Commission': ensureCurrencyString(formData.insuranceDetails.totalCommission) }),
      // Remove Add-ons fields as they don't exist in schema
      
      // Personal Details
      ...(formData.personalDetails?.ssn && { 'SSN': formData.personalDetails.ssn }),
      ...(formData.personalDetails?.gender && { 'Gender': formData.personalDetails.gender }),
      ...(formData.personalDetails?.height && { 'Height': formData.personalDetails.height }), // Changed from ensureNumber since Airtable expects singleLineText
      ...(formData.personalDetails?.weight && { 'Weight': formData.personalDetails.weight }), // Changed from ensureNumber since Airtable expects singleLineText
      ...('smokerStatus' in (formData.personalDetails || {}) ? { 'Smoker?': formData.personalDetails?.smokerStatus ? 'Yes' : 'No' } : {}),
      
      // Contact Numbers
      ...(formData.contactNumbers?.cellPhone && { 'Cell Phone': formData.contactNumbers.cellPhone }),
      ...(formData.contactNumbers?.workPhone && { 'Work Phone': formData.contactNumbers.workPhone }),
      
      // Address Information
      ...(formData.addressInformation?.addressLine1 && { 'Address Line 1': formData.addressInformation.addressLine1 }),
      ...(formData.addressInformation?.addressLine2 && { 'Address Line 2': formData.addressInformation.addressLine2 }),
      ...(formData.addressInformation?.city && { 'City': formData.addressInformation.city }),
      ...(formData.addressInformation?.state && { 'State': formData.addressInformation.state }),
      ...(formData.addressInformation?.zipCode && { 'Zip': ensureNumber(formData.addressInformation.zipCode) }),
      
      // Billing Information
      ...('sameAsApplicant' in (formData.billingInformation || {}) ? { 'Billing Info same as Applicant': ensureBoolean(formData.billingInformation?.sameAsApplicant) } : {}),
      ...(formData.billingInformation?.billingAddressLine1 && { 'Billing Address Line 1': formData.billingInformation.billingAddressLine1 }),
      ...(formData.billingInformation?.billingAddressLine2 && { 'Billing Address Line 2': formData.billingInformation.billingAddressLine2 }),
      ...(formData.billingInformation?.billingCity && { 'Billing City': formData.billingInformation.billingCity }),
      ...(formData.billingInformation?.billingState && { 'Billing State': formData.billingInformation.billingState }),
      ...(formData.billingInformation?.billingZipCode && { 'Billing Zip': ensureNumber(formData.billingInformation.billingZipCode) }),
      ...(formData.billingInformation?.cardType && { 'Card Type': formData.billingInformation.cardType }),
      ...(formData.billingInformation?.cardNumber && { 'Card Number': formData.billingInformation.cardNumber }),
      ...(formData.billingInformation?.expMonth && { 'Exp. Month': formData.billingInformation.expMonth }),
      ...(formData.billingInformation?.expYear && { 'Exp. Year': formData.billingInformation.expYear }),
      ...(formData.billingInformation?.cvv && { 'CVV': ensureNumber(formData.billingInformation.cvv) }),
      
      // Agent Information
      ...(formData.agentInformation?.agentName && { 'Agent': formData.agentInformation.agentName }),
      ...(formData.agentInformation?.fronterName && { 'Fronter Name': formData.agentInformation.fronterName }),
      ...(formData.agentInformation?.notes && { 'Notes': formData.agentInformation.notes }),
      
      // Map Dependents (up to 6)
      ...mapDependents(formData.dependentsInformation || [])
    }
  }
  
  // Validate the submission data and fix any issues
  const issues = validateSubmissionData(airtableRecord);
  if (issues.length > 0) {
    console.warn('Submission data issues (fixed):', issues);
  }

  try {
    // Enhanced debugging for all currency fields
    const debugCurrencyFields = {
      'Carrier U65 Premium': {
        value: airtableRecord.fields['Carrier U65 Premium'],
        type: typeof airtableRecord.fields['Carrier U65 Premium'],
        originalValue: formData.insuranceDetails?.planCost
      },
      'Projected Annual Income': {
        value: airtableRecord.fields['Projected Annual Income'],
        type: typeof airtableRecord.fields['Projected Annual Income'],
        originalValue: formData.healthInformation?.projectedAnnualIncome
      },
      'ACA Plan Premium': {
        value: airtableRecord.fields['ACA Plan Premium'],
        type: typeof airtableRecord.fields['ACA Plan Premium'],
        originalValue: formData.insuranceDetails?.acaPlanPremium
      },
      'Total Commission': {
        value: airtableRecord.fields['Total Commission'],
        type: typeof airtableRecord.fields['Total Commission'],
        originalValue: formData.insuranceDetails?.totalCommission
      }
    };
    
    console.log('Debug - Key Currency Fields:', debugCurrencyFields);
    console.log('Form Data (insuranceDetails):', formData.insuranceDetails);
    
    // Explicitly remove invalid fields
    invalidFields.forEach(field => {
      if (field in airtableRecord.fields) {
        delete (airtableRecord.fields as Record<string, any>)[field];
        console.log(`Removed invalid field: ${field}`);
      }
    });
    
    // Remove empty values to avoid validation errors
    Object.keys(airtableRecord.fields).forEach(key => {
      // Use type assertion to fix the linter error
      const fields = airtableRecord.fields as Record<string, any>;
      if (fields[key] === '' || fields[key] === undefined) {
        delete fields[key];
        console.log(`Removed empty field: ${key}`);
      }
    });
    
    // Log the payload for debugging
    console.log('Submitting to Airtable with data:', JSON.stringify(airtableRecord, null, 2));
    
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(airtableRecord)
    })

    if (!response.ok) {
      // Log the error response from Airtable for debugging
      const errorText = await response.text();
      console.error('Airtable error response:', errorText);
      throw new Error(`Failed to submit to Airtable: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting to Airtable:', error)
    throw error
  }
}

function mapDependents(dependents: FormData['dependentsInformation'] = []) {
  const dependentFields: Record<string, string | number | boolean> = {}
  
  console.log('Mapping dependents:', dependents);
  
  dependents.forEach((dependent, index) => {
    const num = index + 1
    if (num <= 6 && dependent) {
      // For first dependent (index 0), don't include the number in field names
      const prefix = num === 1 ? 'Dependent ' : `Dependent ${num} `;
      
      console.log(`Mapping dependent ${num}:`, dependent, `using prefix: "${prefix}"`);
      
      if (dependent.name) dependentFields[`${prefix}Name`] = dependent.name
      if (dependent.gender) dependentFields[`${prefix}Gender`] = dependent.gender
      if (dependent.relationship) dependentFields[`${prefix}Relationship`] = dependent.relationship
      
      // Make sure ensureDate never returns undefined in this context
      const formattedDate = ensureDate(dependent.dob);
      if (dependent.dob && formattedDate) dependentFields[`${prefix}DOB`] = formattedDate;
      
      if (dependent.ssn) dependentFields[`${prefix}SSN`] = dependent.ssn
    }
  })
  
  console.log('Final mapped dependent fields:', dependentFields);
  
  return dependentFields
} 