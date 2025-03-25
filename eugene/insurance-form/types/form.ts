export interface FormData {
  basicInformation: {
    leadId: string;
    firstName: string;
    lastName: string;
    email?: string;
    dateOfBirth?: string;
    leadSource?: string;
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
    insuranceState?: string;
    typeOfInsurance?: string;
    carrierU65?: string;
    plan?: string;
    planCost?: string;
    planCommission?: string;
    commissionRate?: string;
    carrierACA?: string;
    acaPlanPremium?: string;
    acaPlanDeductible?: string;
    enrollmentFee?: string;
    enrollmentFeeCommission?: string;
    americanFinancial1Premium?: string;
    americanFinancial1Commission?: string;
    americanFinancial1Plan?: string;
    americanFinancial2Premium?: string;
    americanFinancial2Commission?: string;
    americanFinancial2Plan?: string;
    americanFinancial3Premium?: string;
    americanFinancial3Commission?: string;
    americanFinancial3Plan?: string;
    amt1Plan?: string;
    amt1Premium?: string;
    amt1Commission?: string;
    amt2Plan?: string;
    amt2Premium?: string;
    amt2Commission?: string;
    leoAddonsPlans?: string;
    leoAddonsPremium?: string;
    leoAddonsCommission?: string;
    essentialCarePremium?: string;
    essentialCareCommission?: string;
    totalPremium?: string;
    totalCommission?: string;
    hasAddons?: boolean;
    selectedAddons?: string[];
    addonsCost?: string;
    addonsCommission?: string;
    submitApplicationDate?: string;
    effectiveDate?: string;
    monthlyPremium?: string;
    firstMonthPremium?: string;
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
    expMonth?: string;
    expYear?: string;
    cvv?: string;
    bankAch?: boolean;
    bankName?: string;
    accountType?: string;
    routingNumber?: string;
    accountNumber?: string;
  };
  agentInformation?: {
    agentName?: string;
    fronterName?: string;
    notes?: string;
  };
} 