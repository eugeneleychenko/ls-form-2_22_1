document.getElementById('prefillButton').addEventListener('click', async () => {
  try {
    // Get the current active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // First try sending a message to the content script
    chrome.tabs.sendMessage(tab.id, { action: 'fillForm' }, (response) => {
      // If we get a response, great!
      if (response && response.status === 'success') {
        console.log('Form filled successfully via content script!');
      } 
      // If there's an error (like content script not being loaded), fallback to executeScript
      else if (chrome.runtime.lastError) {
        console.log('Content script not available, using executeScript fallback');
        
        // Execute script directly in the page context
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: fillForm
        }).then(() => {
          console.log('Form filled successfully via executeScript!');
        }).catch(err => {
          console.error('Failed to fill form:', err);
        });
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
});

// This function will be injected into the page if needed
function fillForm() {
  // Function to fill the form with test data
  const testData = {
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
  
  // First, fill all non-payment fields
  fillNonPaymentFields(testData);
  
  // Then, handle the payment fields with special care
  handlePaymentFields(testData);
  
  return true; // Indicate success
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
        element.value = testData[key];
        // Trigger change event to activate any dependent fields
        const changeEvent = new Event('change', { bubbles: true });
        element.dispatchEvent(changeEvent);
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