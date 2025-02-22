export interface FormData {
  basicInformation: {
    leadId: string;
    firstName: string;
    lastName: string;
    email?: string;
    dateOfBirth?: string;
    leadSource?: string;
    insuranceState?: string;
    typeOfInsurance?: string;
  };
  healthInformation?: {
    currentlyInsured?: boolean;
    lastTimeInsured?: string;
    currentMedications?: string;
    preExistingConditions?: string;
    majorHospitalizations?: string;
    projectedAnnualIncome?: string;
  };
  insuranceDetails?: {
    carrierU65?: string;
    plan?: string;
    carrierACA?: string;
    acaPlanPremium?: string;
    acaPlanDeductible?: string;
  };
  personalDetails?: {
    ssn?: string;
    gender?: string;
    height?: string;
    weight?: string;
    smokerStatus?: boolean;
  };
  contactNumbers?: {
    cellPhone?: string;
    workPhone?: string;
  };
  addressInformation?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  dependentsInformation?: Array<{
    name?: string;
    dob?: string;
    ssn?: string;
    gender?: string;
    relationship?: string;
  }>;
  billingInformation?: {
    sameAsApplicant?: boolean;
    billingAddressLine1?: string;
    billingAddressLine2?: string;
    billingCity?: string;
    billingState?: string;
    billingZipCode?: string;
    cardType?: string;
    cardNumber?: string;
  };
  agentInformation?: {
    agentName?: string;
    fronterName?: string;
    notes?: string;
  };
} 