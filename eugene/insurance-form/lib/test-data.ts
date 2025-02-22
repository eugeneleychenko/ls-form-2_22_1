import { FormData } from "@/types/form"

export const generateTestData = (): FormData => ({
  basicInformation: {
    leadId: "TEST-" + Math.floor(Math.random() * 10000),
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    dateOfBirth: "1990-01-01",
    leadSource: "Website",
    insuranceState: "California",
    typeOfInsurance: "Health"
  },
  healthInformation: {
    currentlyInsured: true,
    lastTimeInsured: "2023-12-31",
    currentMedications: "None",
    preExistingConditions: "None",
    majorHospitalizations: "None",
    projectedAnnualIncome: "75000"
  },
  insuranceDetails: {
    carrierU65: "Test Carrier",
    plan: "Individual",
    carrierACA: "Access Health STM",
    acaPlanPremium: "350",
    acaPlanDeductible: "2500"
  },
  personalDetails: {
    ssn: "123-45-6789",
    gender: "Male",
    height: "5'10\"",
    weight: "170",
    smokerStatus: false
  },
  contactNumbers: {
    cellPhone: "555-123-4567",
    workPhone: "555-987-6543"
  },
  addressInformation: {
    addressLine1: "123 Test Street",
    addressLine2: "Apt 4B",
    city: "Test City",
    state: "CA",
    zipCode: "12345"
  },
  dependentsInformation: [
    {
      name: "Jane Doe",
      relationship: "Spouse",
      dob: "1992-05-15",
      gender: "Female",
      ssn: "987-65-4321"
    }
  ],
  billingInformation: {
    sameAsApplicant: true,
    billingAddressLine1: "123 Test Street",
    billingAddressLine2: "Apt 4B",
    billingCity: "Test City",
    billingState: "CA",
    billingZipCode: "12345",
    cardType: "Visa",
    cardNumber: "**** **** **** 4242"
  },
  agentInformation: {
    agentName: "Test Agent",
    fronterName: "Test Fronter",
    notes: "Test application for demonstration purposes"
  }
}); 