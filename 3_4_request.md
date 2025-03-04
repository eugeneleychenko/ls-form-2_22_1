one more thing, we need them to be able to choose Credit or Bank Transfer
I added a boolean field Bank ACH and string fields Bank Name, Account Type (dropdown checking or savings), Routing Number, Account Number





Latest column headings in submissions:

[
  {
    "name": "Lead ID",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "firstName",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "lastName",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "email",
    "type": "email",
    "expectedType": "string (email format)",
    "options": null
  },
  {
    "name": "Lead Source",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Insurance State",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Type",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Currently Insured",
    "type": "checkbox",
    "expectedType": "boolean",
    "options": null
  },
  {
    "name": "Last Time Insured",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Current Medications",
    "type": "multilineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Pre Existing Conditions",
    "type": "multilineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Major Hospitalizations/Surgeries",
    "type": "multilineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Projected Annual Income",
    "type": "currency",
    "expectedType": "number",
    "options": null
  },
  {
    "name": "Carrier U65",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Plan",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Carrier ACA",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "ACA Plan Premium",
    "type": "currency",
    "expectedType": "number",
    "options": null
  },
  {
    "name": "American Financial Plan 1",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "American Financial Plan 2",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "American Financial Plan 3",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "AMT 1",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "AMT 2",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Leo Addons",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "DOB",
    "type": "date",
    "expectedType": "string (ISO 8601 date)",
    "options": null
  },
  {
    "name": "SSN",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Gender",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Height",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Weight",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Smoker?",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Address Line 1",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Address Line 2",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "City",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "State",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Zip",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Cell Phone",
    "type": "phoneNumber",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Work Phone",
    "type": "phoneNumber",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Billing Info same as Applicant",
    "type": "checkbox",
    "expectedType": "boolean",
    "options": null
  },
  {
    "name": "Dependent Name",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent Gender",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent Relationship",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent DOB",
    "type": "date",
    "expectedType": "string (ISO 8601 date)",
    "options": null
  },
  {
    "name": "Dependent SSN",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 2 Name",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 2 Gender",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 2 Relationship",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 2 SSN",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 2 DOB",
    "type": "date",
    "expectedType": "string (ISO 8601 date)",
    "options": null
  },
  {
    "name": "Dependent 3 Name",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 3 Gender",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 3 Relationship",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 3 DOB",
    "type": "date",
    "expectedType": "string (ISO 8601 date)",
    "options": null
  },
  {
    "name": "Dependent 3 SSN",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 4 Name",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 4 Gender",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 4 Relationship",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 4 DOB",
    "type": "date",
    "expectedType": "string (ISO 8601 date)",
    "options": null
  },
  {
    "name": "Dependent 4 SSN",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 5 Name",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 5 Gender",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 5 Relationship",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 5 DOB",
    "type": "date",
    "expectedType": "string (ISO 8601 date)",
    "options": null
  },
  {
    "name": "Dependent 5 SSN",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 6 Name",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 6 Gender",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 6 Relationship",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Dependent 6 DOB",
    "type": "date",
    "expectedType": "string (ISO 8601 date)",
    "options": null
  },
  {
    "name": "Dependent 6 SSN",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Billing Address Line 1",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Billing Address Line 2",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Billing City",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Billing State",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Billing Zip",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Agent",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Fronter Name",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Notes",
    "type": "multilineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Card Type",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Card Number",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Exp. Month",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Exp. Year",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "CVV",
    "type": "number",
    "expectedType": "number",
    "options": null
  },
  {
    "name": "Bank ACH?",
    "type": "checkbox",
    "expectedType": "boolean",
    "options": null
  },
  {
    "name": "Bank Name",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Account Type",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Routing Number",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Account Number",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Carrier U65 Premium",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Enrollment Fee",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Carrier U65 Commission",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "American Financial 1 Premium",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "American Financial 1 Commission",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "American Financial 2 Premium",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "AMT 1 Commission",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "AMT 2 Commission",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "American Financial 2 Commission",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "American Financial 3 Premium",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "American Financial 3 Commission",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Essential Care Premium",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Essential Care Commission",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Leo Addons Commissions",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Total Premium",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Enrollment Fee Commission",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  },
  {
    "name": "Total Commission",
    "type": "singleLineText",
    "expectedType": "string",
    "options": null
  }
]