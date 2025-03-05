// This script runs when the page loads
console.log('Form Prefiller extension is loaded and ready!');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message);
  
  if (message.action === 'fillForm') {
    fillForm(message.dataSource);
    sendResponse({ status: 'success' });
    return true;
  }
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

// Function to map submission data to form fields
function mapSubmissionToFormData(submission) {
  const fields = submission.fields;
  
  // Helper function to split phone numbers
  function splitPhone(phone) {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    return {
      first: cleaned.substring(0, 3),
      second: cleaned.substring(3, 6),
      third: cleaned.substring(6, 10)
    };
  }
  
  // Helper function to split date (YYYY-MM-DD format)
  function splitDate(date) {
    const parts = date.split('-');
    return {
      year: parts[0],
      month: parseInt(parts[1], 10).toString(), // Remove leading zero
      day: parseInt(parts[2], 10).toString()    // Remove leading zero
    };
  }
  
  // Map the submission fields to form fields
  const cellPhone = splitPhone(fields["Cell Phone"] || "");
  const workPhone = splitPhone(fields["Work Phone"] || "");
  const dob = splitDate(fields["DOB"] || "");
  
  // Log DOB information for debugging
  console.log('DOB from submission:', fields["DOB"]);
  console.log('Parsed DOB values:', dob);
  
  // Convert gender to single character format if needed
  const genderMap = {
    "male": "M",
    "female": "F"
  };
  
  const gender = genderMap[fields["Gender"].toLowerCase()] || fields["Gender"];
  
  // Create the data object with mapped fields
  return {
    // Member info
    firstname: fields["firstName"] || "",
    middlename: "", // Not in submission data
    lastname: fields["lastName"] || "",
    
    // Address
    address: fields["Address Line 1"] || "",
    address2: fields["Address Line 2"] || "",
    city: fields["City"] || "",
    state: fields["State"] || "",
    zipcode: fields["Zip"] ? fields["Zip"].replace(/,/g, '') : "",
    
    // Contact
    phone1_1: cellPhone.first,
    phone1_2: cellPhone.second,
    phone1_3: cellPhone.third,
    phone2_1: workPhone.first,
    phone2_2: workPhone.second,
    phone2_3: workPhone.third,
    email: fields["email"] || "",
    email_confirm: fields["email"] || "",
    
    // Attributes
    ssn: fields["SSN"] || "",
    dobmonth: dob.month,
    dobday: dob.day,
    dobyear: dob.year,
    gender: gender,
    
    // Agent info
    source_detail: fields["Agent"] || "",
    
    // Notes
    notes: fields["Notes"] || "",
    
    // Beneficiary info - using Dependent 2 (spouse) data
    ben_relationship: fields["Dependent 2 Relationship"] || "",
    ben_name: fields["Dependent 2 Name"] || "",
    ben_address: fields["Address Line 1"] || "", // Assuming same address
    ben_city: fields["City"] || "",
    ben_state: fields["State"] || "",
    ben_zipcode: fields["Zip"] ? fields["Zip"].replace(/,/g, '') : "",
    ben_phone1_1: cellPhone.first,
    ben_phone1_2: cellPhone.second,
    ben_phone1_3: cellPhone.third,
    ben_DOBMonth: fields["Dependent 2 DOB"] ? splitDate(fields["Dependent 2 DOB"]).month : "",
    ben_DOBDay: fields["Dependent 2 DOB"] ? splitDate(fields["Dependent 2 DOB"]).day : "",
    ben_DOBYear: fields["Dependent 2 DOB"] ? splitDate(fields["Dependent 2 DOB"]).year : "",
    
    // Payment info - Credit Card
    cc_number: fields["Card Number"] || "",
    pay_ccexpmonth: fields["Exp. Month"] || "",
    pay_ccexpyear: fields["Exp. Year"] || "",
    pay_cccvv2: fields["CVV"] ? fields["CVV"].toString() : "",
    pay_fname: fields["firstName"] || "",
    pay_lname: fields["lastName"] || "",
    pay_address: fields["Billing Address Line 1"] || "",
    pay_city: fields["Billing City"] || "",
    pay_state: fields["Billing State"] || "",
    pay_zipcode: fields["Billing Zip"] ? fields["Billing Zip"].replace(/,/g, '') : "",
    
    // Other fields remain the same
    pd_20277168_dtBilling: "03/06/2025",
    pd_20277168_dtEffective: "03/07/2025",
    send_text: cellPhone.first + cellPhone.second + cellPhone.third,
    send_email: fields["email"] || ""
  };
}

// Function to fill the form with test or real submission data
function fillForm(dataSource = 'test') {
  console.log(`Filling form with ${dataSource} data from content script...`);
  
  let testData;
  
  if (dataSource === 'real') {
    // Load and map real submission data
    const submission = loadPreviousSubmission();
    testData = mapSubmissionToFormData(submission);
  } else {
    // Use the original test data
    testData = {
      // Member info
      firstname: "John",
      middlename: "A",
      lastname: "Doe",
      
      // Address
      address: "123 Main St",
      address2: "Apt 4B",
      city: "Little Rock",
      state: "AR", // Arkansas is pre-selected in the form
      zipcode: "72201",
      
      // Contact
      phone1_1: "555",
      phone1_2: "123",
      phone1_3: "4567",
      phone2_1: "555",
      phone2_2: "987",
      phone2_3: "6543",
      email: "test@example.com",
      email_confirm: "test@example.com",
      
      // Attributes
      ssn: "123-45-6789",
      dobmonth: "1", // January
      dobday: "15",
      dobyear: "1980",
      gender: "M",
      
      // Agent info
      source_detail: "Test Agent",
      
      // Notes
      notes: "This is a test enrollment",
      
      // Beneficiary info
      ben_relationship: "Spouse",
      ben_name: "Jane Doe",
      ben_address: "123 Main St",
      ben_city: "Little Rock",
      ben_state: "AR",
      ben_zipcode: "72201",
      ben_phone1_1: "555",
      ben_phone1_2: "123",
      ben_phone1_3: "4567",
      ben_DOBMonth: "2", // February
      ben_DOBDay: "20",
      ben_DOBYear: "1982",
      
      // Payment info - Credit Card
      cc_number: "4111111111111111", // Test Visa number
      pay_ccexpmonth: "01",
      pay_ccexpyear: "2030",
      pay_cccvv2: "123",
      pay_fname: "John",
      pay_lname: "Doe",
      pay_address: "123 Main St",
      pay_city: "Little Rock",
      pay_state: "AR",
      pay_zipcode: "72201",
      
      // Dates
      pd_20277168_dtBilling: "03/06/2025",
      pd_20277168_dtEffective: "03/07/2025",
      
      // Other
      send_text: "5551234567",
      send_email: "test@example.com"
    };
  }
  
  // First, fill all non-payment fields
  fillNonPaymentFields(testData);
  
  // Then, handle the payment fields with special care
  handlePaymentFields(testData);
  
  console.log(`Form has been filled with ${dataSource} data!`);
}

// Function to fill all non-payment related fields
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