import { FormData } from '@/types/form'

// Using environment variables for sensitive information
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID
const AIRTABLE_TABLE_ID = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
  throw new Error('Missing required Airtable environment variables')
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
      ...(formData.basicInformation.dateOfBirth && { 'DOB': formData.basicInformation.dateOfBirth }),
      ...(formData.basicInformation.leadSource && { 'Lead Source': formData.basicInformation.leadSource }),
      ...(formData.basicInformation.insuranceState && { 'Insurance State': formData.basicInformation.insuranceState }),
      ...(formData.basicInformation.typeOfInsurance && { 'Type': formData.basicInformation.typeOfInsurance }),
      
      // Health Information
      ...(formData.healthInformation?.currentlyInsured && { 'Currently Insured': formData.healthInformation.currentlyInsured }),
      ...(formData.healthInformation?.lastTimeInsured && { 'Last Time Insured': formData.healthInformation.lastTimeInsured }),
      ...(formData.healthInformation?.currentMedications && { 'Current Medications': formData.healthInformation.currentMedications }),
      ...(formData.healthInformation?.preExistingConditions && { 'Pre Existing Conditions': formData.healthInformation.preExistingConditions }),
      ...(formData.healthInformation?.majorHospitalizations && { 'Major Hospitalizations/Surgeries': formData.healthInformation.majorHospitalizations }),
      ...(formData.healthInformation?.projectedAnnualIncome && { 'Projected Annual Income': formData.healthInformation.projectedAnnualIncome }),
      
      // Insurance Details
      ...(formData.insuranceDetails?.carrierU65 && { 'Carrier U65': formData.insuranceDetails.carrierU65 }),
      ...(formData.insuranceDetails?.plan && { 'Plan': formData.insuranceDetails.plan }),
      ...(formData.insuranceDetails?.carrierACA && { 'Carrier ACA': formData.insuranceDetails.carrierACA }),
      ...(formData.insuranceDetails?.acaPlanPremium && { 'ACA Plan Premium': formData.insuranceDetails.acaPlanPremium }),
      
      // Personal Details
      ...(formData.personalDetails?.ssn && { 'SSN': formData.personalDetails.ssn }),
      ...(formData.personalDetails?.gender && { 'Gender': formData.personalDetails.gender }),
      ...(formData.personalDetails?.height && { 'Height': formData.personalDetails.height }),
      ...(formData.personalDetails?.weight && { 'Weight': formData.personalDetails.weight }),
      ...(formData.personalDetails?.smokerStatus !== undefined && { 'Smoker?': formData.personalDetails.smokerStatus ? 'Yes' : 'No' }),
      
      // Contact Numbers
      ...(formData.contactNumbers?.cellPhone && { 'Cell Phone': formData.contactNumbers.cellPhone }),
      ...(formData.contactNumbers?.workPhone && { 'Work Phone': formData.contactNumbers.workPhone }),
      
      // Address Information
      ...(formData.addressInformation?.addressLine1 && { 'Address Line 1': formData.addressInformation.addressLine1 }),
      ...(formData.addressInformation?.addressLine2 && { 'Address Line 2': formData.addressInformation.addressLine2 }),
      ...(formData.addressInformation?.city && { 'City': formData.addressInformation.city }),
      ...(formData.addressInformation?.state && { 'State': formData.addressInformation.state }),
      ...(formData.addressInformation?.zipCode && { 'Zip': formData.addressInformation.zipCode }),
      
      // Billing Information
      ...(formData.billingInformation?.sameAsApplicant !== undefined && { 'Billing Info same as Applicant': formData.billingInformation.sameAsApplicant }),
      ...(formData.billingInformation?.billingAddressLine1 && { 'Billing Address Line 1': formData.billingInformation.billingAddressLine1 }),
      ...(formData.billingInformation?.billingAddressLine2 && { 'Billing Address Line 2': formData.billingInformation.billingAddressLine2 }),
      ...(formData.billingInformation?.billingCity && { 'Billing City': formData.billingInformation.billingCity }),
      ...(formData.billingInformation?.billingState && { 'Billing State': formData.billingInformation.billingState }),
      ...(formData.billingInformation?.billingZipCode && { 'Billing Zip': formData.billingInformation.billingZipCode }),
      ...(formData.billingInformation?.cardType && { 'Card Type': formData.billingInformation.cardType }),
      ...(formData.billingInformation?.cardNumber && { 'Card Number': formData.billingInformation.cardNumber }),
      
      // Agent Information
      ...(formData.agentInformation?.agentName && { 'Agent': formData.agentInformation.agentName }),
      ...(formData.agentInformation?.fronterName && { 'Fronter Name': formData.agentInformation.fronterName }),
      ...(formData.agentInformation?.notes && { 'Notes': formData.agentInformation.notes }),
      
      // Map Dependents (up to 6)
      ...mapDependents(formData.dependentsInformation || [])
    }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(airtableRecord)
    })

    if (!response.ok) {
      throw new Error('Failed to submit to Airtable')
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting to Airtable:', error)
    throw error
  }
}

function mapDependents(dependents: FormData['dependentsInformation'] = []) {
  const dependentFields: Record<string, string> = {}
  
  dependents.forEach((dependent, index) => {
    const num = index + 1
    if (num <= 6 && dependent) {
      if (dependent.name) dependentFields[`Dependent ${num} Name`] = dependent.name
      if (dependent.gender) dependentFields[`Dependent ${num} Gender`] = dependent.gender
      if (dependent.relationship) dependentFields[`Dependent ${num} Relationship`] = dependent.relationship
      if (dependent.dob) dependentFields[`Dependent ${num} DOB`] = dependent.dob
      if (dependent.ssn) dependentFields[`Dependent ${num} SSN`] = dependent.ssn
    }
  })
  
  return dependentFields
} 