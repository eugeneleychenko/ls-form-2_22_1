// This script runs when the page loads
console.log('Form Prefiller extension is loaded and ready!');

// Global variables to track dependents
let dependentQueue = [];
let currentDependentIndex = 0;
let totalDependents = 0;

// Helper function to split date (YYYY-MM-DD format) - moved to global scope for reuse
function splitDate(date) {
  if (!date) return { year: '', month: '', day: '' };
  
  // Handle multiple date formats
  let parts;
  if (typeof date === 'string' && date.includes('-')) {
    parts = date.split('-');
  } else if (typeof date === 'string' && date.includes('/')) {
    parts = date.split('/');
    // Adjust for MM/DD/YYYY format
    if (parts.length === 3 && parts[2].length === 4) {
      return {
        year: parts[2],
        month: parseInt(parts[0], 10).toString(), // Remove leading zero
        day: parseInt(parts[1], 10).toString()    // Remove leading zero
      };
    }
  } else {
    console.warn('Unable to parse date:', date);
    return { year: '', month: '', day: '' };
  }
  
  // Standard YYYY-MM-DD format
  if (parts && parts.length === 3) {
    return {
      year: parts[0],
      month: parseInt(parts[1], 10).toString(), // Remove leading zero
      day: parseInt(parts[2], 10).toString()    // Remove leading zero
    };
  }
  
  console.warn('Unexpected date format:', date);
  return { year: '', month: '', day: '' };
}

// Helper function to split phone numbers - moved to global scope for reuse
function splitPhone(phone) {
  // Remove all non-numeric characters
  if (!phone) return { first: '', second: '', third: '' };
  
  const cleaned = phone.toString().replace(/\D/g, '');
  return {
    first: cleaned.substring(0, 3),
    second: cleaned.substring(3, 6),
    third: cleaned.substring(6, 10)
  };
}

// Helper function to get the first non-empty value from multiple field names - moved to global scope
function getFieldValue(fields, possibleFieldNames, defaultValue = "") {
  for (const fieldName of possibleFieldNames) {
    const value = fields[fieldName];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return defaultValue;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Content script received message:", request.action);
  
  // Handle form filling with different data sources
  if (request.action === 'fillForm') {
    console.log("Filling form with data source:", request.dataSource);
    
    if (request.dataSource === 'search' && request.submission) {
      // Fill form with the selected submission from search
      console.log("Using search submission:", request.submission);
      fillFormWithSubmission(request.submission);
      sendResponse({status: 'success'});
    } else {
      // Handle error when no submission is provided
      console.error("No valid submission provided for form filling");
      sendResponse({status: 'error', message: 'No valid submission provided'});
    }
    
    return true;
  }
  
  // Handle fetching submissions (with option to force refresh)
  else if (request.action === 'getSubmissions') {
    console.log("Getting submissions, forceRefresh:", request.forceRefresh);
    
    // If force refresh is requested, clear the cache first
    if (request.forceRefresh) {
      console.log("Forcing refresh of submissions cache");
      
      // Clear the local cache
      if (typeof submissionsCache !== 'undefined') {
        console.log("Clearing local submissionsCache");
        submissionsCache = []; 
      }
      
      // Also clear the background cache
      chrome.runtime.sendMessage({ action: 'clearCache' }, function(response) {
        console.log("Cache clear response:", response);
        
        // After clearing the cache, fetch submissions
        if (typeof fetchSubmissions === 'function') {
          console.log("Fetching fresh submissions after cache clear");
          fetchSubmissions(true) // Pass true to show logs when forcefully refreshing
            .then(submissions => {
              console.log(`Fetched ${submissions.length} fresh submissions after cache clear`);
              sendResponse({
                status: 'success',
                submissions: submissions
              });
            })
            .catch(error => {
              console.error("Error fetching fresh submissions:", error);
              sendResponse({
                status: 'error',
                error: error.message
              });
            });
        } else {
          sendResponse({
            status: 'error',
            message: 'fetchSubmissions function not available'
          });
        }
      });
    } else {
      // No force refresh, just get the current submissions
      if (typeof fetchSubmissions === 'function') {
        fetchSubmissions(false) // Pass false to hide logs when not forcefully refreshing
          .then(submissions => {
            sendResponse({
              status: 'success',
              submissions: submissions
            });
          })
          .catch(error => {
            sendResponse({
              status: 'error',
              error: error.message
            });
          });
      } else {
        sendResponse({
          status: 'error',
          message: 'fetchSubmissions function not available'
        });
      }
    }
    
    return true; // Will respond asynchronously
  }
  
  // Handle searching submissions by name
  else if (request.action === 'searchSubmissions') {
    console.log("Searching submissions for:", request.query);
    
    if (typeof searchSubmissionsByName === 'function') {
      try {
        // Make sure we have submissions loaded
        if (typeof submissionsCache === 'undefined' || !submissionsCache || !submissionsCache.length) {
          console.warn("Cannot search - submissions cache is empty");
          sendResponse({
            status: 'error',
            error: "No submissions loaded to search"
          });
          return true;
        }
        
        console.log(`Searching ${submissionsCache.length} submissions for "${request.query}"`);
        
        // Log some of the submissions to verify their data
        console.log("Sample of submissions in cache:");
        const sampleSubmissions = submissionsCache.slice(0, Math.min(5, submissionsCache.length));
        sampleSubmissions.forEach((submission, i) => {
          if (submission && submission.fields) {
            // Check for different field name formats
            const firstName = 
              submission.fields.firstName || 
              submission.fields.firstname || 
              submission.fields.FirstName || 
              submission.fields["First Name"] || 
              submission.fields["first name"] || '';
              
            const lastName = 
              submission.fields.lastName || 
              submission.fields.lastname || 
              submission.fields.LastName || 
              submission.fields["Last Name"] || 
              submission.fields["last name"] || '';
              
            console.log(`Sample ${i}: ${firstName} ${lastName} - Fields:`, JSON.stringify(submission.fields).substring(0, 100) + '...');
          } else {
            console.log(`Sample ${i}: Invalid submission or missing fields`);
          }
        });
        
        // Perform the search
        const results = searchSubmissionsByName(request.query);
        console.log(`Found ${results.length} matches for search "${request.query}"`);
        
        // Log a sample of the results for debugging
        if (results.length > 0) {
          console.log("Search result details:");
          const sample = results.slice(0, Math.min(5, results.length));
          sample.forEach((result, i) => {
            const firstName = 
              result.fields.firstName || 
              result.fields.firstname || 
              result.fields.FirstName || 
              result.fields["First Name"] || 
              result.fields["first name"] || '';
              
            const lastName = 
              result.fields.lastName || 
              result.fields.lastname || 
              result.fields.LastName || 
              result.fields["Last Name"] || 
              result.fields["last name"] || '';
              
            console.log(`Result ${i}: ${firstName} ${lastName}`);
          });
          
          // Send successful response with results
          sendResponse({
            status: 'success',
            results: results
          });
        } else {
          console.log("No matches found for search query:", request.query);
          sendResponse({
            status: 'success',
            results: []
          });
        }
      } catch (error) {
        console.error("Error searching submissions:", error);
        sendResponse({
          status: 'error',
          error: error.message || "Unknown error during search"
        });
      }
    } else {
      console.error("searchSubmissionsByName function not available");
      sendResponse({
        status: 'error',
        error: "searchSubmissionsByName function not available"
      });
    }
    
    return true;
  }
  
  // Handle getting submission count
  else if (request.action === 'getSubmissionCount') {
    console.log("Getting submission count");
    
    // Check if we have access to the submissions cache
    if (typeof submissionsCache !== 'undefined') {
      const count = submissionsCache.length;
      console.log(`Submission count: ${count}`);
      sendResponse({
        status: 'success',
        count: count
      });
    } else {
      console.error("submissionsCache not available");
      sendResponse({
        status: 'error',
        count: 0
      });
    }
    
    return true;
  }
  
  // Always return true to indicate we'll respond asynchronously
  return true;
});

// Function to load and parse the previous submission data
function loadPreviousSubmission() {
  // In a real implementation, you would fetch this from a file or API
  // For now, let's define it directly from the previous_submission.txt content
  const submissionData = {
    "id": "rec4rdOhvOGKETOAB",
    "createdTime": "2025-03-02T15:42:05.000Z",
    "fields": {
      "Carrier U65": "Advanced Wellness Plus",
      "American Financial 3 Premium": "125",
      "Exp. Month": "12",
      "Dependent 6 SSN": "111-22-3333",
      "Dependent Name": "Test Child 1",
      "Dependent 4 DOB": "2014-09-23",
      "Work Phone": "(555) 987-6543",
      "Dependent 5 Name": "Test Child 4",
      "Smoker?": "No",
      "Fronter Name": "Jane Fronter",
      "Dependent 6 Relationship": "parent",
      "Last Time Insured": "2023-01-01",
      "Projected Annual Income": 60000,
      "Card Number": "4111111111111111",
      "Weight": "180",
      "American Financial 2 Commission": "20",
      "American Financial Plan 1": "AF AD&D 50K $79.00",
      "Dependent 3 Gender": "male",
      "City": "Testville",
      "Gender": "male",
      "Enrollment Fee Commission": "20",
      "Dependent 6 DOB": "1965-02-28",
      "Billing Zip": "54321",
      "Insurance State": "CA",
      "Dependent Gender": "female",
      "ACA Plan Premium": 450,
      "Current Medications": "Aspirin, Vitamin D, Lisinopril",
      "Dependent 4 Relationship": "child",
      "Dependent 2 Relationship": "spouse",
      "Total Premium": "1150",
      "Carrier U65 Premium": "412.12",
      "Essential Care Premium": "100",
      "Lead Source": "website",
      "Zip": "12345",
      "Card Type": "visa",
      "Dependent 3 Relationship": "child",
      "Billing Address Line 2": "Suite 100",
      "Dependent 5 SSN": "222-33-4444",
      "Cell Phone": "(555) 123-4567",
      "State": "CA",
      "Dependent 4 Gender": "female",
      "Major Hospitalizations/Surgeries": "Appendectomy 2018, Knee surgery 2020",
      "Billing State": "NY",
      "DOB": "1990-01-01",
      "Dependent DOB": "2010-05-15",
      "Address Line 1": "123 Test Street",
      "Dependent 5 Relationship": "child",
      "Total Commission": "123.64",
      "CVV": 123,
      "American Financial Plan 3": "AF Critical Illness 2,500 $64.00",
      "American Financial 1 Premium": "50",
      "Dependent 3 SSN": "444-55-6666",
      "Essential Care Commission": "25",
      "American Financial 1 Commission": "15",
      "Dependent 3 Name": "Test Child 2",
      "Carrier U65 Commission": "123.64",
      "Lead ID": "1235",
      "firstName": "Test",
      "lastName": "User",
      "Address Line 2": "Apt 4B",
      "Notes": "Test submission with maximum data for comprehensive Airtable field testing",
      "Dependent 2 SSN": "456-78-9123",
      "American Financial 3 Commission": "30",
      "Height": "72",
      "Dependent 2 Gender": "female",
      "Dependent 5 DOB": "2016-11-12",
      "Carrier ACA": "Ambetter",
      "Dependent 2 Name": "Test Spouse",
      "Dependent 6 Gender": "male",
      "email": "test@example.com",
      "Billing Address Line 1": "456 Billing Street",
      "Dependent SSN": "987-65-4321",
      "Exp. Year": "2025",
      "Pre Existing Conditions": "Hypertension, Asthma",
      "Currently Insured": true,
      "Dependent 6 Name": "Test Parent",
      "Plan": "Advanced Wellness Plus 500 $412.12",
      "American Financial 2 Premium": "75",
      "Enrollment Fee": "27.5",
      "Dependent Relationship": "child",
      "Dependent 5 Gender": "male",
      "Type": "Individual",
      "SSN": "123-45-6789",
      "American Financial Plan 2": "AF AME 500 $29.95",
      "Billing City": "Billtown",
      "Dependent 3 DOB": "2012-07-19",
      "Dependent 4 Name": "Test Child 3",
      "Dependent 4 SSN": "333-44-5555",
      "Dependent 2 DOB": "1992-03-20",
      "Agent": "Agent Smith"
    }
  };
  
  return submissionData;
}

// Extract all dependents from the submission data
function extractAllDependents(fields) {
  const dependents = [];
  
  // Helper function to extract a dependent by index (0-5)
  function extractDependent(index) {
    // Prefix is empty for first dependent, or "Dependent N " for others
    const prefix = index === 0 ? "" : `Dependent ${index + 1} `;
    
    // Fields to look for
    const nameField = index === 0 ? "Dependent Name" : `${prefix}Name`;
    const relationshipField = index === 0 ? "Dependent Relationship" : `${prefix}Relationship`;
    const genderField = index === 0 ? "Dependent Gender" : `${prefix}Gender`;
    const dobField = index === 0 ? "Dependent DOB" : `${prefix}DOB`;
    const ssnField = index === 0 ? "Dependent SSN" : `${prefix}SSN`;
    
    // Check if there's any data for this dependent
    const hasName = fields[nameField];
    const hasRelationship = fields[relationshipField];
    const hasDOB = fields[dobField];
    
    // Only return a dependent if we have at least one key piece of information
    if (hasName || hasRelationship || hasDOB) {
      // Get the full name
      let firstName = "";
      let lastName = "";
      if (hasName) {
        const nameParts = fields[nameField].split(' ');
        if (nameParts.length > 1) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else {
          firstName = fields[nameField];
        }
      }
      
      // Normalize relationship
      let relationship = fields[relationshipField] || "";
      if (relationship && typeof relationship === 'string') {
        relationship = relationship.toLowerCase();
        if (relationship.includes('spouse') || relationship.includes('wife') || relationship.includes('husband')) {
          relationship = 'Spouse';
        } else if (relationship.includes('child') || relationship.includes('son') || relationship.includes('daughter')) {
          relationship = 'Child';
        } else {
          relationship = 'Child'; // Default
        }
      } else {
        relationship = 'Child'; // Default if not found
      }
      
      // Normalize gender
      let gender = fields[genderField] || "";
      if (gender && typeof gender === 'string') {
        gender = gender.toLowerCase();
        if (gender.includes('male') || gender === 'm') {
          gender = 'M';
        } else if (gender.includes('female') || gender === 'f') {
          gender = 'F';
        }
      }
      
      // Process DOB
      let dobMonth = "";
      let dobDay = "";
      let dobYear = "";
      if (hasDOB) {
        const dobParts = splitDate(fields[dobField]);
        dobMonth = dobParts.month;
        dobDay = dobParts.day;
        dobYear = dobParts.year;
      }
      
      return {
        firstName,
        lastName,
        relationship,
        gender,
        ssn: fields[ssnField] || "",
        dobMonth,
        dobDay,
        dobYear
      };
    }
    
    return null;
  }
  
  // Extract up to 6 dependents
  for (let i = 0; i < 6; i++) {
    const dependent = extractDependent(i);
    if (dependent) {
      dependents.push(dependent);
    }
  }
  
  return dependents;
}

// Helper function to map submission data to form fields
function mapSubmissionToFormData(submission) {
  if (!submission || !submission.fields) {
    console.error('Invalid submission data:', submission);
    return {};
  }
  
  const fields = submission.fields;
  console.log('Mapping submission fields:', Object.keys(fields));
  
  // Extract all dependents and store them in the global queue
  dependentQueue = extractAllDependents(fields);
  totalDependents = dependentQueue.length;
  currentDependentIndex = 0;
  
  console.log(`Found ${totalDependents} dependents in submission:`, dependentQueue);
  
  // Get name fields with multiple possible field names
  const firstName = getFieldValue(fields, [
    "firstName", "firstname", "FirstName", "First Name", "first name", "first_name"
  ]);
  
  const lastName = getFieldValue(fields, [
    "lastName", "lastname", "LastName", "Last Name", "last name", "last_name"
  ]);
  
  const middleName = getFieldValue(fields, [
    "middleName", "middlename", "MiddleName", "Middle Name", "middle name", "middle_name"
  ]);
  
  // Get address fields
  const address1 = getFieldValue(fields, [
    "Address Line 1", "Address", "address", "address1", "addressLine1", "street"
  ]);
  
  const address2 = getFieldValue(fields, [
    "Address Line 2", "address2", "addressLine2", "apt", "suite", "unit"
  ]);
  
  const city = getFieldValue(fields, [
    "City", "city"
  ]);
  
  const state = getFieldValue(fields, [
    "State", "state"
  ]);
  
  const zipcode = getFieldValue(fields, [
    "Zip", "zip", "zipcode", "ZipCode", "Zipcode", "postal", "Postal"
  ]).toString().replace(/,/g, '');
  
  // Get phone fields
  const cellPhone = splitPhone(getFieldValue(fields, [
    "Cell Phone", "cellPhone", "cell phone", "cell", "Cell", "mobile", "Mobile"
  ]));
  
  const workPhone = splitPhone(getFieldValue(fields, [
    "Work Phone", "workPhone", "work phone", "work", "Work", "office", "Office"
  ]));
  
  // Get email
  const email = getFieldValue(fields, [
    "email", "Email", "e-mail", "E-mail"
  ]);
  
  // Get SSN
  const ssn = getFieldValue(fields, [
    "SSN", "ssn", "Social Security", "socialSecurity", "social security"
  ]);
  
  // Get DOB fields
  const dobValue = getFieldValue(fields, [
    "DOB", "dob", "Date of Birth", "dateOfBirth", "birthDate", "Birth Date"
  ]);
  const dob = splitDate(dobValue);
  console.log('DOB from submission:', dobValue);
  console.log('Parsed DOB values:', dob);
  
  // Get gender
  const genderValue = getFieldValue(fields, [
    "Gender", "gender", "sex", "Sex"
  ]);
  
  // Convert gender to single character format if needed
  const genderMap = {
    "male": "M",
    "female": "F",
    "m": "M",
    "f": "F"
  };
  
  const gender = genderValue ? 
    (genderMap[genderValue.toString().toLowerCase()] || genderValue) : 'M';
  
  // Get agent
  const agent = getFieldValue(fields, [
    "Agent", "agent", "Agent Name", "agent name", "AgentName"
  ]);
  
  // Get notes
  const notes = getFieldValue(fields, [
    "Notes", "notes", "Comments", "comments", "Additional Notes", "additional notes"
  ]);
  
  // Get dependent info (first dependent)
  const firstDependentFirstName = getFieldValue(fields, [
    "Dependent First Name", "Dependent Firstname", "dependent first name", "dependent firstname"
  ]);
  
  const firstDependentLastName = getFieldValue(fields, [
    "Dependent Last Name", "Dependent Lastname", "dependent last name", "dependent lastname"
  ]);
  
  // If we have a full name but not separate first/last name, try to split it
  const firstDependentName = getFieldValue(fields, [
    "Dependent Name", "dependent name"
  ]);
  
  let dependentFirstName = firstDependentFirstName;
  let dependentLastName = firstDependentLastName;
  
  // If we have a full name but not separate parts, try to split it
  if (!dependentFirstName && firstDependentName) {
    const parts = firstDependentName.split(' ');
    if (parts.length > 1) {
      dependentFirstName = parts[0];
      dependentLastName = parts.slice(1).join(' ');
    } else {
      dependentFirstName = firstDependentName;
    }
  }
  
  let dependentRelationship = getFieldValue(fields, [
    "Dependent Relationship", "dependent relationship"
  ]);
  
  // Normalize relationship to match dropdown options exactly (Spouse or Child)
  if (dependentRelationship && typeof dependentRelationship === 'string') {
    dependentRelationship = dependentRelationship.toLowerCase();
    if (dependentRelationship.includes('spouse') || dependentRelationship.includes('wife') || dependentRelationship.includes('husband')) {
      dependentRelationship = 'Spouse';
    } else if (dependentRelationship.includes('child') || dependentRelationship.includes('son') || dependentRelationship.includes('daughter')) {
      dependentRelationship = 'Child';
    } else {
      // Default to Child if it's something else
      dependentRelationship = 'Child';
    }
  } else {
    // If no relationship is found, default to Child
    dependentRelationship = 'Child';
  }
  
  const dependentGender = getFieldValue(fields, [
    "Dependent Gender", "dependent gender"
  ]);
  
  // Convert gender to required format
  const dependentGenderMapped = dependentGender ? 
    (genderMap[dependentGender.toString().toLowerCase()] || dependentGender) : '';
  
  const dependentSSN = getFieldValue(fields, [
    "Dependent SSN", "dependent ssn"
  ]);
  
  const dependentDOBValue = getFieldValue(fields, [
    "Dependent DOB", "dependent dob"
  ]);
  
  const dependentDOB = splitDate(dependentDOBValue);
  
  // Get dependent address info - default to main applicant if not specified
  const dependentAddress = getFieldValue(fields, [
    "Dependent Address", "dependent address"
  ]) || address1;
  
  const dependentCity = getFieldValue(fields, [
    "Dependent City", "dependent city"
  ]) || city;
  
  const dependentState = getFieldValue(fields, [
    "Dependent State", "dependent state"
  ]) || state;
  
  const dependentZip = getFieldValue(fields, [
    "Dependent Zip", "dependent zip"
  ]) || zipcode;
  
  const dependentPhone = splitPhone(getFieldValue(fields, [
    "Dependent Phone", "dependent phone"
  ])) || cellPhone;
  
  const dependentEmail = getFieldValue(fields, [
    "Dependent Email", "dependent email"
  ]) || email;
  
  // Get payment info
  const cardNumber = getFieldValue(fields, [
    "Card Number", "cardNumber", "card number", "CC Number", "cc number", "credit card"
  ]);
  
  const expMonth = getFieldValue(fields, [
    "Exp. Month", "expMonth", "exp month", "cc exp month"
  ]);
  
  const expYear = getFieldValue(fields, [
    "Exp. Year", "expYear", "exp year", "cc exp year"
  ]);
  
  const cvv = getFieldValue(fields, [
    "CVV", "cvv", "security code", "Security Code", "cvc", "CVC"
  ]).toString();
  
  const billingAddress = getFieldValue(fields, [
    "Billing Address Line 1", "Billing Address", "billingAddress", "billing address"
  ]);
  
  const billingCity = getFieldValue(fields, [
    "Billing City", "billingCity", "billing city"
  ]);
  
  const billingState = getFieldValue(fields, [
    "Billing State", "billingState", "billing state"
  ]);
  
  const billingZip = getFieldValue(fields, [
    "Billing Zip", "billingZip", "billing zip", "billing zipcode"
  ]).toString().replace(/,/g, '');
  
  // Include original fields object for reference if other fields are needed
  const result = {
    // Original fields object for reference
    fields: fields,
    
    // Member info
    firstname: firstName,
    middlename: middleName,
    lastname: lastName,
    
    // Address
    address: address1,
    address2: address2,
    city: city,
    state: state,
    zipcode: zipcode,
    
    // Contact
    phone1_1: cellPhone.first,
    phone1_2: cellPhone.second,
    phone1_3: cellPhone.third,
    phone2_1: workPhone.first,
    phone2_2: workPhone.second,
    phone2_3: workPhone.third,
    email: email,
    email_confirm: email,
    
    // Attributes
    ssn: ssn,
    dobmonth: dob.month,
    dobday: dob.day,
    dobyear: dob.year,
    gender: gender,
    
    // Agent info
    source_detail: "",
    
    // Notes
    notes: "",
    
    // Beneficiary info
    ben_relationship: "Estate",
    ben_name: "Estate",
    ben_address: "",
    ben_city: "",
    ben_state: "",
    ben_zipcode: "",
    ben_phone1_1: "",
    ben_phone1_2: "",
    ben_phone1_3: "",
    ben_DOBMonth: "",
    ben_DOBDay: "",
    ben_DOBYear: "",
    
    // Dependent info (for first dependent)
    dep_firstname: dependentFirstName,
    dep_lastname: dependentLastName,
    dep_relationship: dependentRelationship,
    dep_gender: dependentGenderMapped,
    dep_ssn: dependentSSN,
    dep_DOBMonth: dependentDOB.month,
    dep_DOBDay: dependentDOB.day,
    dep_DOBYear: dependentDOB.year,
    dep_address: dependentAddress,
    dep_city: dependentCity,
    dep_state: dependentState,
    dep_zipcode: dependentZip,
    dep_phone1_1: dependentPhone.first,
    dep_phone1_2: dependentPhone.second,
    dep_phone1_3: dependentPhone.third,
    dep_email: dependentEmail,
    
    // Payment info - Credit Card
    cc_number: cardNumber,
    pay_ccexpmonth: expMonth,
    pay_ccexpyear: expYear,
    pay_cccvv2: cvv,
    pay_fname: firstName,
    pay_lname: lastName,
    pay_address: billingAddress || address1, // fallback to main address if billing not specified
    pay_city: billingCity || city,
    pay_state: billingState || state,
    pay_zipcode: billingZip || zipcode,
    
    // Other fields - hardcoded dates for convenience
    pd_20277168_dtBilling: "03/06/2025",
    pd_20277168_dtEffective: "03/07/2025",
    
    // Text/Email communication
    send_text: cellPhone.first + cellPhone.second + cellPhone.third,
    send_email: email ? "Y" : "N"
  };
  
  console.log('Mapped form data with dependent information:', result);
  return result;
}

// Fill form with given submission data
function fillFormWithSubmission(submission) {
  if (!submission) {
    console.error('Cannot fill form: No submission provided');
    return;
  }
  
  console.log('Filling form with submission data:', submission);
  
  // Map submission to form data format
  const testData = mapSubmissionToFormData(submission);
  console.log('Mapped submission to form data:', testData);
  
  try {
    // Fill non-payment fields (personal info, contact, etc.)
    fillNonPaymentFields(testData);
    
    // Handle payment fields separately (credit card, etc.)
    handlePaymentFields(testData);
    
    // Attempt to fill dependent form with first dependent data if we have dependents
    if (dependentQueue.length > 0) {
      setTimeout(() => {
        fillDependentForm(testData);
      }, 1000); // Wait a bit to ensure main form is filled before working on dependents
      
      console.log(`Queued ${dependentQueue.length} dependents for filling`);
    } else {
      console.log('No dependents found in the submission data');
    }
    
    console.log('Form filled successfully');
    return true;
  } catch (error) {
    console.error('Error filling form:', error);
    return false;
  }
}

// Fill non-payment fields with the provided data
function fillNonPaymentFields(testData) {
  // Create a list of payment-related field prefixes to exclude
  const paymentPrefixes = ['cc_', 'pay_'];
  
  // Fill text inputs and textareas
  Object.keys(testData).forEach(key => {
    // Skip payment fields for now
    if (paymentPrefixes.some(prefix => key.startsWith(prefix))) {
      return;
    }
    
    const elements = document.getElementsByName(key);
    if (elements.length > 0) {
      const element = elements[0];
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = testData[key];
        // Trigger input event to activate any validation listeners
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
      }
    }
  });
  
  // Fill select dropdowns (excluding payment fields)
  Object.keys(testData).forEach(key => {
    // Skip payment fields for now
    if (paymentPrefixes.some(prefix => key.startsWith(prefix))) {
      return;
    }
    
    const elements = document.getElementsByName(key);
    if (elements.length > 0) {
      const element = elements[0];
      if (element.tagName === 'SELECT') {
        // Log select element values for debugging
        if (key.includes('dob')) {
          console.log(`Setting select field ${key} to value: "${testData[key]}"`);
        }
        
        element.value = testData[key];
        // Trigger change event to activate any dependent fields
        const changeEvent = new Event('change', { bubbles: true });
        element.dispatchEvent(changeEvent);
        
        // Additional check for DOB fields
        if (key.includes('dob')) {
          console.log(`After setting, ${key} has value: "${element.value}"`);
          
          // If value wasn't set, try to set it using the option index
          if (element.value !== testData[key] && testData[key]) {
            // Find option with matching value
            for (let i = 0; i < element.options.length; i++) {
              if (element.options[i].value === testData[key]) {
                element.selectedIndex = i;
                element.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`Used selectedIndex to set ${key} to "${testData[key]}"`);
                break;
              }
            }
          }
        }
      }
    }
  });
  
  // Check non-payment related checkboxes
  const agreeCheckbox = document.getElementsByName('chkAgree');
  if (agreeCheckbox.length > 0) {
    agreeCheckbox[0].checked = true;
    // Trigger change event
    const changeEvent = new Event('change', { bubbles: true });
    agreeCheckbox[0].dispatchEvent(changeEvent);
  }
  
  // Trigger any change events to ensure dependent fields update
  const fieldsToTrigger = [
    'state', 'same_address', 'chkAgree',
    'phone1_1', 'phone1_2', 'phone1_3',
    'phone2_1', 'phone2_2', 'phone2_3',
    'ben_state'
  ];
  
  fieldsToTrigger.forEach(field => {
    const elements = document.getElementsByName(field);
    if (elements.length > 0) {
      const event = new Event('change', { bubbles: true });
      elements[0].dispatchEvent(event);
    }
  });
}

// Function to handle payment fields specifically
function handlePaymentFields(testData) {
  console.log('Handling payment fields...');
  
  // Intercept and block AJAX calls related to payment validation
  setupAjaxInterception();
  
  // First, select the Credit Card payment radio button if it exists
  const paymentTypes = document.getElementsByName('paymentType');
  if (paymentTypes.length > 0) {
    paymentTypes[0].checked = true;
    
    // Use a simulated mouse event instead of click() to avoid triggering unwanted events
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    paymentTypes[0].dispatchEvent(mouseEvent);
    
    // Give the form a moment to process the payment type selection
    setTimeout(() => {
      fillCreditCardFields(testData);
    }, 300);
  } else {
    // If no payment type radio found, just fill the credit card fields directly
    fillCreditCardFields(testData);
  }
}

// Function to specifically fill credit card fields with special handling
function fillCreditCardFields(testData) {
  console.log('Filling credit card fields...');
  
  // Handle "Same as Member information" checkbox
  const sameAddressCheckbox = document.getElementsByName('same_address');
  if (sameAddressCheckbox.length > 0) {
    // For testing purposes, don't check it so we can see all fields filled
    sameAddressCheckbox[0].checked = false;
  }
  
  // Create an array of operations to perform in sequence
  const operations = [
    // Set credit card number with direct DOM manipulation to avoid form AJAX
    () => {
      const ccNumberField = document.getElementsByName('cc_number');
      if (ccNumberField.length > 0) {
        console.log('Setting CC number...');
        
        // Block any AJAX handlers temporarily
        const originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function() {
          if (this._url && (this._url.includes('isMod10') || this._url.includes('forms.cfc'))) {
            console.log('Blocking AJAX call:', this._url);
            return;
          }
          originalSend.apply(this, arguments);
        };
        
        // Set the value
        ccNumberField[0].value = testData.cc_number;
        
        // Restore original XHR after brief delay
        setTimeout(() => {
          XMLHttpRequest.prototype.send = originalSend;
        }, 500);
      }
    },
    
    // Set expiration month field
    () => {
      const expMonthField = document.getElementsByName('pay_ccexpmonth');
      if (expMonthField.length > 0) {
        console.log('Setting expiration month...');
        expMonthField[0].value = testData.pay_ccexpmonth;
      }
    },
    
    // Set expiration year field
    () => {
      const expYearField = document.getElementsByName('pay_ccexpyear');
      if (expYearField.length > 0) {
        console.log('Setting expiration year...');
        expYearField[0].value = testData.pay_ccexpyear;
      }
    },
    
    // Set CVV field
    () => {
      const cvvField = document.getElementsByName('pay_cccvv2');
      if (cvvField.length > 0) {
        console.log('Setting CVV...');
        cvvField[0].value = testData.pay_cccvv2;
      }
    },
    
    // Set billing info fields
    () => {
      const billingFields = [
        { name: 'pay_fname', value: testData.pay_fname },
        { name: 'pay_lname', value: testData.pay_lname },
        { name: 'pay_address', value: testData.pay_address },
        { name: 'pay_city', value: testData.pay_city },
        { name: 'pay_state', value: testData.pay_state },
        { name: 'pay_zipcode', value: testData.pay_zipcode }
      ];
      
      billingFields.forEach(field => {
        const elements = document.getElementsByName(field.name);
        if (elements.length > 0) {
          console.log(`Setting ${field.name}...`);
          elements[0].value = field.value;
        }
      });
    }
  ];
  
  // Execute operations with small delays between them
  executeSequentially(operations, 100);
  
  // Final check after all operations to ensure values stuck
  setTimeout(() => {
    console.log('Final check of payment fields...');
    checkAndReapplyPaymentFields(testData);
  }, 1000);
}

// Function to execute operations sequentially with delays
function executeSequentially(operations, delay) {
  let index = 0;
  
  function next() {
    if (index < operations.length) {
      operations[index]();
      index++;
      setTimeout(next, delay);
    }
  }
  
  next();
}

// Function to set up interception of AJAX calls
function setupAjaxInterception() {
  // Save original open method
  const originalOpen = XMLHttpRequest.prototype.open;
  
  // Override open to track URLs
  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    return originalOpen.apply(this, arguments);
  };
}

// Function to check if payment fields need to be reapplied
function checkAndReapplyPaymentFields(testData) {
  const ccNumberField = document.getElementsByName('cc_number');
  if (ccNumberField.length > 0 && ccNumberField[0].value !== testData.cc_number) {
    console.log('Credit card number was cleared, reapplying...');
    
    // Set values directly on elements to bypass event handlers
    ccNumberField[0].value = testData.cc_number;
    
    // Apply other credit card fields again
    const fieldsToCheck = [
      { name: 'pay_ccexpmonth', value: testData.pay_ccexpmonth },
      { name: 'pay_ccexpyear', value: testData.pay_ccexpyear },
      { name: 'pay_cccvv2', value: testData.pay_cccvv2 },
      { name: 'pay_fname', value: testData.pay_fname },
      { name: 'pay_lname', value: testData.pay_lname },
      { name: 'pay_address', value: testData.pay_address },
      { name: 'pay_city', value: testData.pay_city },
      { name: 'pay_state', value: testData.pay_state },
      { name: 'pay_zipcode', value: testData.pay_zipcode }
    ];
    
    fieldsToCheck.forEach(field => {
      const elements = document.getElementsByName(field.name);
      if (elements.length > 0 && elements[0].value !== field.value) {
        console.log(`Reapplying ${field.name}...`);
        elements[0].value = field.value;
      }
    });
    
    // Add a mutation observer to keep values in place
    addMutationObserver(ccNumberField[0], testData.cc_number);
  }
}

// Function to add mutation observer to prevent field clearing
function addMutationObserver(element, desiredValue) {
  // Create a new MutationObserver
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' || 
          (mutation.type === 'characterData' && element.value !== desiredValue)) {
        console.log('Field changed by script, restoring value...');
        element.value = desiredValue;
      }
    });
  });
  
  // Configure and start the observer
  observer.observe(element, { 
    attributes: true, 
    childList: false, 
    characterData: true,
    subtree: true
  });
  
  // Also monitor value changes
  const originalValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  
  Object.defineProperty(element, 'value', {
    set: function(newValue) {
      if (newValue !== desiredValue) {
        console.log('Value setter intercepted, keeping original value');
        originalValueSetter.call(this, desiredValue);
      } else {
        originalValueSetter.call(this, newValue);
      }
    },
    get: function() {
      return desiredValue;
    }
  });
}

/**
 * Create a test submission object with sample data
 * This is used when no real submissions are available
 */
function createTestSubmission() {
  return {
    fields: {
      firstName: "John",
      lastName: "Doe",
      Gender: "male",
      DOB: "1980-01-15",
      "Cell Phone": "(555) 123-4567",
      "Work Phone": "(555) 987-6543",
      email: "test@example.com",
      SSN: "123-45-6789",
      "Address Line 1": "123 Main St",
      "Address Line 2": "Apt 4B",
      City: "Little Rock",
      State: "AR",
      Zip: "72201",
      Notes: "Test submission",
      Agent: "Test Agent"
    }
  };
}

// Function to fill in the dependent form with data from a specific dependent
function fillDependentForm(testData) {
  console.log('Attempting to fill dependent form...');
  
  if (dependentQueue.length === 0) {
    console.log('No dependents in queue, nothing to fill');
    return;
  }
  
  // Find the Save Dependent button
  const saveButtons = document.querySelectorAll('input[value="Save Dependent"]');
  if (saveButtons.length > 0) {
    const originalButton = saveButtons[0];
    const parentElement = originalButton.parentElement;
    
    // Check if we have a valid parent element
    if (!parentElement) {
      console.warn('Could not find parent element for Save Dependent button');
      return;
    }
    
    console.log(`Setting up for ${totalDependents} dependents. Currently on dependent #${currentDependentIndex + 1}`);
    
    // Don't modify the original save button text
    // Instead, add a "Load Next Dependent" button if we have more dependents
    if (totalDependents > 1 && currentDependentIndex < totalDependents - 1) {
      // Check if the Load Next button already exists
      const existingLoadButton = document.getElementById('load-next-dependent-btn');
      if (!existingLoadButton) {
        // Create a new "Load Next Dependent" button
        const loadNextButton = document.createElement('input');
        loadNextButton.type = 'button';
        loadNextButton.value = `Load Next Dependent (${currentDependentIndex + 1}/${totalDependents})`;
        loadNextButton.id = 'load-next-dependent-btn';
        loadNextButton.style.marginLeft = '10px';
        loadNextButton.setAttribute('aria-label', 'Load Next Dependent');
        
        // Add a click handler to load the next dependent
        loadNextButton.addEventListener('click', function() {
          // Increment to the next dependent
          currentDependentIndex++;
          if (currentDependentIndex < totalDependents) {
            console.log(`Loading dependent #${currentDependentIndex + 1} of ${totalDependents}`);
            fillDependentWithQueuedData();
            // Update the button text after loading the next dependent
            loadNextButton.value = `Load Next Dependent (${currentDependentIndex + 1}/${totalDependents})`;
            // Hide the button if we're at the last dependent
            if (currentDependentIndex >= totalDependents - 1) {
              loadNextButton.style.display = 'none';
              console.log('Last dependent loaded, hiding Load Next button');
            }
          }
        });
        
        // Insert the new button after the save button
        console.log('Adding Load Next Dependent button');
        parentElement.appendChild(loadNextButton);
      }
    }
  } else {
    console.warn('Save Dependent button not found');
  }
  
  // Fill the form with the current dependent's data
  fillDependentWithQueuedData();
}

// Helper function to fill the dependent form with data from the queue
function fillDependentWithQueuedData() {
  if (currentDependentIndex >= dependentQueue.length) {
    console.log('No more dependents in queue');
    return;
  }
  
  const dependent = dependentQueue[currentDependentIndex];
  console.log(`Filling dependent form with dependent #${currentDependentIndex + 1}:`, dependent);
  
  // Clear all form fields first
  const fieldsToClear = ['dep_firstname', 'dep_lastname', 'dep_relationship', 'dep_gender', 
                        'dep_DOBMonth', 'dep_DOBDay', 'dep_DOBYear', 'dep_ssn', 
                        'dep_address', 'dep_city', 'dep_state', 'dep_zipcode',
                        'dep_phone1_1', 'dep_phone1_2', 'dep_phone1_3', 'dep_email'];
  
  fieldsToClear.forEach(fieldName => {
    const elements = document.getElementsByName(fieldName);
    if (elements.length > 0) {
      const element = elements[0];
      if (element.tagName === 'SELECT') {
        element.selectedIndex = 0;
      } else {
        element.value = '';
      }
    }
  });
  
  // Map the fields
  const fieldMappings = [
    { name: 'dep_firstname', value: dependent.firstName },
    { name: 'dep_lastname', value: dependent.lastName },
    { name: 'dep_relationship', value: dependent.relationship },
    { name: 'dep_gender', value: dependent.gender },
    { name: 'dep_DOBMonth', value: dependent.dobMonth },
    { name: 'dep_DOBDay', value: dependent.dobDay },
    { name: 'dep_DOBYear', value: dependent.dobYear },
    { name: 'dep_ssn', value: dependent.ssn }
  ];
  
  // Fill each field
  fieldMappings.forEach(mapping => {
    if (mapping.value) {
      const elements = document.getElementsByName(mapping.name);
      if (elements.length > 0) {
        const element = elements[0];
        element.value = mapping.value;
        
        // Dispatch the appropriate event
        if (element.tagName === 'SELECT') {
          element.dispatchEvent(new Event('change', { bubbles: true }));
          
          // For relationship dropdown, make sure it's selected properly
          if (mapping.name === 'dep_relationship') {
            setTimeout(() => {
              for (let i = 0; i < element.options.length; i++) {
                if (element.options[i].value === mapping.value) {
                  element.selectedIndex = i;
                  element.dispatchEvent(new Event('change', { bubbles: true }));
                  console.log(`Set ${mapping.name} to "${mapping.value}" using selectedIndex`);
                  break;
                }
              }
            }, 100);
          }
        } else {
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  });
  
  // Update the "Load Next Dependent" button text
  const loadNextButton = document.getElementById('load-next-dependent-btn');
  if (loadNextButton) {
    loadNextButton.value = `Load Next Dependent (${currentDependentIndex + 1}/${totalDependents})`;
    // Hide the button if we're at the last dependent
    if (currentDependentIndex >= totalDependents - 1) {
      loadNextButton.style.display = 'none';
    }
  }
} 