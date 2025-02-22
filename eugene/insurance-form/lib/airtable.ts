import { FormData } from '@/types/form'

// Using environment variables for sensitive information
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID
const AIRTABLE_TABLE_ID = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
  throw new Error('Missing required Airtable environment variables')
}

export const submitToAirtable = async (formData: FormData) => {
  try {
    // Map form data to Airtable fields
    const airtableRecord = {
      fields: {
        // Basic Information (Required fields)
        'Lead ID': parseInt(formData.basicInformation.leadId) || 0,  // Ensure numeric
        'First Name': formData.basicInformation.firstName,  // Match exact field name
        'Last Name': formData.basicInformation.lastName,    // Match exact field name

        // Basic Information (Optional fields)
        ...(formData.basicInformation.email && { 'Email': formData.basicInformation.email }),
        ...(formData.basicInformation.dateOfBirth && { 'Date of Birth': formData.basicInformation.dateOfBirth }),
        ...(formData.basicInformation.leadSource && { 'Lead Source': formData.basicInformation.leadSource }),
        ...(formData.basicInformation.insuranceState && { 'State': formData.basicInformation.insuranceState }),
        ...(formData.basicInformation.typeOfInsurance && { 'Insurance Type': formData.basicInformation.typeOfInsurance }),
        
        // Health Information
        ...(formData.healthInformation?.currentlyInsured !== undefined && { 
          'Currently Insured': formData.healthInformation.currentlyInsured ? 'Yes' : 'No'
        }),
        ...(formData.healthInformation?.lastTimeInsured && { 'Last Time Insured': formData.healthInformation.lastTimeInsured }),
        ...(formData.healthInformation?.currentMedications && { 'Current Medications': formData.healthInformation.currentMedications }),
        ...(formData.healthInformation?.preExistingConditions && { 'Pre-existing Conditions': formData.healthInformation.preExistingConditions }),
        ...(formData.healthInformation?.majorHospitalizations && { 'Major Hospitalizations': formData.healthInformation.majorHospitalizations }),
        ...(formData.healthInformation?.projectedAnnualIncome && { 
          'Annual Income': parseInt(formData.healthInformation.projectedAnnualIncome) || 0
        }),
        
        // Insurance Details
        ...(formData.insuranceDetails?.carrierU65 && { 'Carrier': formData.insuranceDetails.carrierU65 }),
        ...(formData.insuranceDetails?.plan && { 'Plan Type': formData.insuranceDetails.plan }),
        ...(formData.insuranceDetails?.carrierACA && { 'ACA Carrier': formData.insuranceDetails.carrierACA }),
        ...(formData.insuranceDetails?.acaPlanPremium && { 
          'Premium': parseInt(formData.insuranceDetails.acaPlanPremium) || 0
        }),
        
        // Personal Details
        ...(formData.personalDetails?.ssn && { 'SSN': formData.personalDetails.ssn }),
        ...(formData.personalDetails?.gender && { 'Gender': formData.personalDetails.gender }),
        ...(formData.personalDetails?.height && { 'Height': formData.personalDetails.height }),
        ...(formData.personalDetails?.weight && { 'Weight': parseInt(formData.personalDetails.weight) || 0 }),
        ...(formData.personalDetails?.smokerStatus !== undefined && { 
          'Smoker': formData.personalDetails.smokerStatus ? 'Yes' : 'No'
        }),
        
        // Contact Numbers
        ...(formData.contactNumbers?.cellPhone && { 'Mobile Phone': formData.contactNumbers.cellPhone }),
        ...(formData.contactNumbers?.workPhone && { 'Work Phone': formData.contactNumbers.workPhone }),
        
        // Address Information
        ...(formData.addressInformation?.addressLine1 && { 'Address': formData.addressInformation.addressLine1 }),
        ...(formData.addressInformation?.addressLine2 && { 'Address 2': formData.addressInformation.addressLine2 }),
        ...(formData.addressInformation?.city && { 'City': formData.addressInformation.city }),
        ...(formData.addressInformation?.state && { 'State': formData.addressInformation.state }),
        ...(formData.addressInformation?.zipCode && { 'ZIP': formData.addressInformation.zipCode }),
        
        // Billing Information
        ...(formData.billingInformation?.sameAsApplicant !== undefined && { 
          'Same as Primary': formData.billingInformation.sameAsApplicant ? 'Yes' : 'No'
        }),
        ...(formData.billingInformation?.billingAddressLine1 && { 'Billing Address': formData.billingInformation.billingAddressLine1 }),
        ...(formData.billingInformation?.billingCity && { 'Billing City': formData.billingInformation.billingCity }),
        ...(formData.billingInformation?.billingState && { 'Billing State': formData.billingInformation.billingState }),
        ...(formData.billingInformation?.billingZipCode && { 'Billing ZIP': formData.billingInformation.billingZipCode }),
        ...(formData.billingInformation?.cardType && { 'Payment Method': formData.billingInformation.cardType }),
        
        // Agent Information
        ...(formData.agentInformation?.agentName && { 'Agent Name': formData.agentInformation.agentName }),
        ...(formData.agentInformation?.fronterName && { 'Fronter': formData.agentInformation.fronterName }),
        ...(formData.agentInformation?.notes && { 'Notes': formData.agentInformation.notes }),
      }
    }

    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(airtableRecord)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Airtable error details:', errorData)
      throw new Error(`Failed to submit to Airtable: ${errorData?.error?.message || 'Unknown error'}`)
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