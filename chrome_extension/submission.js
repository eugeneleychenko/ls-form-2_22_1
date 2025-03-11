/**
 * Submission.js - Handles submission search and retrieval
 * 
 * This file manages the following:
 * 1. Fetching submissions from cache or generating test data
 * 2. Searching submissions by name
 * 3. Caching submissions for better performance
 */

// Cache for submissions to prevent repeated fetching
let submissionsCache = [];
let isLoadingSubmissions = false;

// Airtable configuration - copied from standalone script for direct access
const AIRTABLE_BASE_ID = 'appYMEW2CsYkdpQ7c';
const AIRTABLE_TABLE_ID = 'tblBxPxL2R5AEyZaC';
const AIRTABLE_API_KEY = 'pat3NLTELYC7eiLLT.a86da8e760db4ba6602778112fe26d8ef892de800833bde9d06633f395527025';

/**
 * Fetch submissions directly from Airtable using the REST API
 * This avoids loading external scripts and complies with Extension CSP
 * @returns {Promise<Array>} Airtable records
 */
async function fetchFromAirtable(showLogs = false) {
  try {
    if (showLogs) console.log('Fetching submissions directly from Airtable API');
    
    // Construct the Airtable API URL
    const apiUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;
    
    // Fetch the records
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    if (!data || !data.records || !Array.isArray(data.records)) {
      throw new Error('Invalid response format from Airtable');
    }
    
    if (showLogs) console.log(`Successfully fetched ${data.records.length} records from Airtable API`);
    
    // Convert to the expected format
    const records = data.records.map(record => ({
      id: record.id,
      fields: record.fields,
      _rawJson: {
        id: record.id,
        createdTime: record.createdTime,
        fields: record.fields
      }
    }));
    
    return records;
  } catch (error) {
    if (showLogs) console.error('Error fetching from Airtable API:', error);
    return null;
  }
}

/**
 * Attempt to load real submissions from the standalone submission.js
 * This checks if we're in an environment where the other script is available
 */
async function tryLoadRealSubmissions(showLogs = false) {
  if (showLogs) console.log('Attempting to load real submissions from Airtable...');
  
  // Try to fetch directly from Airtable
  try {
    const records = await fetchFromAirtable(showLogs);
    if (records && records.length > 0) {
      if (showLogs) console.log(`Successfully loaded ${records.length} real submissions from Airtable`);
      return records;
    }
  } catch (directError) {
    if (showLogs) console.error('Error loading submissions directly from Airtable:', directError);
  }
  
  // If direct fetch failed, check if the standalone script functions are available
  if (typeof window !== 'undefined') {
    // Look for the fetchLatestSubmission function from the standalone script
    const hasRealFetch = typeof window.fetchAllSubmissions === 'function' || 
                         typeof window.getAllSubmissions === 'function' || 
                         typeof window.getAllAirtableSubmissions === 'function';
    
    if (hasRealFetch) {
      try {
        if (showLogs) console.log('Found real Airtable fetch function, using it to get submissions');
        // Use the appropriate function
        const fetchFunction = window.fetchAllSubmissions || 
                             window.getAllSubmissions || 
                             window.getAllAirtableSubmissions;
        
        const realSubmissions = await fetchFunction();
        if (Array.isArray(realSubmissions) && realSubmissions.length > 0) {
          if (showLogs) console.log(`Successfully loaded ${realSubmissions.length} real submissions from Airtable`);
          return realSubmissions;
        }
      } catch (error) {
        if (showLogs) console.error('Error loading real submissions:', error);
      }
    }
  } 
  
  // Check if fetchLatestSubmission is available in the current context
  if (typeof fetchLatestSubmission === 'function') {
    try {
      console.log('Using fetchLatestSubmission from the same context');
      const latestSubmission = await fetchLatestSubmission();
      if (latestSubmission) {
        return [latestSubmission];
      }
    } catch (error) {
      console.error('Error using fetchLatestSubmission:', error);
    }
  }
  
  console.log('Could not load real submissions, will use test data');
  return null;
}

/**
 * Fetches submissions from storage or generates test data
 * In a real implementation, this would fetch from Airtable
 * @param {boolean} showLogs - Whether to show console logs, defaults to false
 */
async function fetchSubmissions(showLogs = false) {
  // If already loading, don't start another fetch
  if (isLoadingSubmissions) {
    if (showLogs) console.log('Already loading submissions, waiting...');
    return new Promise((resolve) => {
      // Check every 100ms if submissions are loaded
      const checkInterval = setInterval(() => {
        if (!isLoadingSubmissions && submissionsCache.length > 0) {
          clearInterval(checkInterval);
          resolve(submissionsCache);
        }
      }, 100);
    });
  }

  // If we already have cached submissions, return them
  if (submissionsCache.length > 0) {
    if (showLogs) console.log('Using cached submissions:', submissionsCache.length);
    return submissionsCache;
  }

  isLoadingSubmissions = true;
  if (showLogs) console.log('Starting to fetch submissions...');

  try {
    // First try to load real submissions from Airtable
    if (showLogs) console.log('Attempting to load real submissions...');
    const realSubmissions = await tryLoadRealSubmissions(showLogs);
    
    if (realSubmissions && realSubmissions.length > 0) {
      if (showLogs) console.log(`Successfully loaded ${realSubmissions.length} real submissions`);
      submissionsCache = realSubmissions;
      isLoadingSubmissions = false;
      
      // Debug output to inspect fields
      if (showLogs) {
        submissionsCache.forEach((submission, index) => {
          if (submission && submission.fields) {
            const firstName = submission.fields.firstName || submission.fields.firstname || submission.fields["First Name"] || '';
            const lastName = submission.fields.lastName || submission.fields.lastname || submission.fields["Last Name"] || '';
            console.log(`Submission ${index} name fields: ${firstName} ${lastName}`);
          }
        });
      }
      
      // Cache these for future use
      if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage(
          { action: 'cacheSubmissions', submissions: submissionsCache },
          () => { if (showLogs) console.log('Cached real submissions from Airtable'); }
        );
      }
      
      return submissionsCache;
    } else {
      if (showLogs) console.log('No real submissions loaded, checking cache...');
    }
    
    // If no real submissions, try to get submissions from local storage cache
    if (chrome && chrome.runtime) {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: 'getCachedSubmissions' },
          (response) => {
            if (response && response.status === 'success' && response.submissions) {
              submissionsCache = response.submissions;
              isLoadingSubmissions = false;
              console.log('Retrieved', submissionsCache.length, 'submissions from cache');
              
              // Debug output to inspect fields
              submissionsCache.forEach((submission, index) => {
                if (submission && submission.fields) {
                  const firstName = submission.fields.firstName || submission.fields.firstname || submission.fields["First Name"] || '';
                  const lastName = submission.fields.lastName || submission.fields.lastname || submission.fields["Last Name"] || '';
                  console.log(`Submission ${index} name fields: ${firstName} ${lastName}`);
                }
              });
              
              resolve(submissionsCache);
            } else {
              // No cached submissions, generate test data
              console.log('No cached submissions found, generating test data');
              initializeWithTestData();
              
              // Cache the generated submissions
              if (chrome && chrome.runtime) {
                chrome.runtime.sendMessage(
                  { action: 'cacheSubmissions', submissions: submissionsCache },
                  () => console.log('Cached test submissions')
                );
              }
              
              isLoadingSubmissions = false;
              resolve(submissionsCache);
            }
          }
        );
      });
    } else {
      // Chrome runtime not available, use test data
      console.log('Chrome runtime not available, using test data');
      initializeWithTestData();
      isLoadingSubmissions = false;
      return submissionsCache;
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    // If there's an error, use test data as fallback
    console.log('Error occurred, falling back to test data');
    initializeWithTestData();
    isLoadingSubmissions = false;
    return submissionsCache;
  }
}

/**
 * Search submissions by name using a more comprehensive approach
 * Similar to how findSubmissionsByName works in the Airtable integration
 */
function searchSubmissionsByName(searchQuery) {
  // Validate search query
  if (!searchQuery || typeof searchQuery !== 'string') {
    console.warn('Invalid search query:', searchQuery);
    return [];
  }

  const query = searchQuery.toLowerCase().trim();
  
  // Validate query length
  if (query.length < 2) {
    console.log('Search query too short, need at least 2 characters');
    return []; // Require at least 2 characters to search
  }

  console.log('Searching for name:', query, 'in', submissionsCache.length, 'submissions');
  
  // Check if submission cache is available
  if (!submissionsCache || submissionsCache.length === 0) {
    console.warn('Submission cache is empty when trying to search');
    return [];
  }

  // Log some debug information about available submissions
  console.log('First 3 submissions in cache for debugging:');
  submissionsCache.slice(0, 3).forEach((submission, index) => {
    if (submission && submission.fields) {
      const firstName = getFirstNameFromFields(submission.fields);
      const lastName = getLastNameFromFields(submission.fields);
      console.log(`Submission ${index}: ${firstName} ${lastName}`);
    } else {
      console.log(`Submission ${index}: Invalid or missing fields`);
    }
  });

  // Enhanced search with support for multiple name formats and partial matches
  const results = submissionsCache.filter(submission => {
    // Skip submissions without fields
    if (!submission || !submission.fields) {
      return false;
    }
    
    const fields = submission.fields;
    
    // Helper functions to get first and last names
    const firstName = getFirstNameFromFields(fields);
    const lastName = getLastNameFromFields(fields);
    
    // Convert to lowercase strings for comparison
    const firstNameLower = String(firstName).toLowerCase();
    const lastNameLower = String(lastName).toLowerCase();
    
    // Formatted name for display in logs
    const displayName = `${firstName} ${lastName}`.trim();
    console.log(`Checking: "${displayName}" against query "${query}"`);
    
    // Full name in different formats for matching
    const fullName1 = `${lastNameLower}, ${firstNameLower}`;
    const fullName2 = `${firstNameLower} ${lastNameLower}`;
    
    // Check if the query is found in any name format
    const matchesFirstName = firstNameLower.includes(query);
    const matchesLastName = lastNameLower.includes(query);
    const matchesFullName1 = fullName1.includes(query);
    const matchesFullName2 = fullName2.includes(query);
    
    // If any name format matches, return true
    const matches = matchesFirstName || matchesLastName || matchesFullName1 || matchesFullName2;
    
    // Debug log for matching results
    if (matches) {
      console.log(`✓ Match found: "${displayName}" matches query "${query}"`);
      if (matchesFirstName) console.log(`  - Matched first name: "${firstNameLower}"`);
      if (matchesLastName) console.log(`  - Matched last name: "${lastNameLower}"`);
      if (matchesFullName1) console.log(`  - Matched "Last, First": "${fullName1}"`);
      if (matchesFullName2) console.log(`  - Matched "First Last": "${fullName2}"`);
    }
    
    return matches;
  });
  
  console.log(`Search complete: found ${results.length} matches for "${query}"`);
  
  // Log details of the matches
  if (results.length > 0) {
    console.log('Search matches:');
    results.forEach((result, idx) => {
      const firstName = getFirstNameFromFields(result.fields);
      const lastName = getLastNameFromFields(result.fields);
      console.log(`Match ${idx+1}: ${firstName} ${lastName}`);
    });
  }
  
  return results;
}

// Helper function to get first name from fields with various possible names
function getFirstNameFromFields(fields) {
  return (
    fields.firstName || 
    fields.firstname || 
    fields.FirstName || 
    fields["First Name"] || 
    fields["first name"] || 
    fields["first_name"] ||
    ''
  );
}

// Helper function to get last name from fields with various possible names
function getLastNameFromFields(fields) {
  return (
    fields.lastName || 
    fields.lastname || 
    fields.LastName || 
    fields["Last Name"] || 
    fields["last name"] || 
    fields["last_name"] ||
    ''
  );
}

/**
 * Load a real previous submission
 * In a production environment, this would fetch from Airtable
 */
function loadPreviousSubmission() {
  return {
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
}

/**
 * Generate more test submissions for the autocomplete feature
 */
function loadMoreTestSubmissions() {
  return [
    {
      "id": "rec1TestSubmission",
      "createdTime": "2025-02-15T10:30:00.000Z",
      "fields": {
        "firstName": "John",
        "lastName": "Smith",
        "DOB": "1985-06-12",
        "SSN": "234-56-7890",
        "Gender": "male",
        "Address Line 1": "456 Oak Avenue",
        "City": "Springfield",
        "State": "IL",
        "Zip": "62704",
        "Cell Phone": "(555) 234-5678",
        "email": "john.smith@example.com",
        "Card Number": "4111111111111111",
        "Exp. Month": "05",
        "Exp. Year": "2026",
        "CVV": 456
      }
    },
    {
      "id": "rec2TestSubmission",
      "createdTime": "2025-02-20T14:15:00.000Z",
      "fields": {
        "firstName": "Sarah",
        "lastName": "Johnson",
        "DOB": "1992-08-23",
        "SSN": "345-67-8901",
        "Gender": "female",
        "Address Line 1": "789 Pine Street",
        "City": "Portland",
        "State": "OR",
        "Zip": "97205",
        "Cell Phone": "(555) 345-6789",
        "email": "sarah.johnson@example.com",
        "Card Number": "4111111111111111",
        "Exp. Month": "08",
        "Exp. Year": "2027",
        "CVV": 789
      }
    },
    {
      "id": "rec3TestSubmission",
      "createdTime": "2025-02-25T09:45:00.000Z",
      "fields": {
        "firstName": "Michael",
        "lastName": "Williams",
        "DOB": "1978-11-30",
        "SSN": "456-78-9012",
        "Gender": "male",
        "Address Line 1": "123 Maple Drive",
        "City": "Denver",
        "State": "CO",
        "Zip": "80202",
        "Cell Phone": "(555) 456-7890",
        "email": "michael.williams@example.com",
        "Card Number": "4111111111111111",
        "Exp. Month": "11",
        "Exp. Year": "2026",
        "CVV": 123
      }
    },
    {
      "id": "rec4TestSubmission",
      "createdTime": "2025-03-01T11:30:00.000Z",
      "fields": {
        "firstName": "Jennifer",
        "lastName": "Brown",
        "DOB": "1990-04-15",
        "SSN": "567-89-0123",
        "Gender": "female",
        "Address Line 1": "456 Birch Lane",
        "City": "Seattle",
        "State": "WA",
        "Zip": "98101",
        "Cell Phone": "(555) 567-8901",
        "email": "jennifer.brown@example.com",
        "Card Number": "4111111111111111",
        "Exp. Month": "04",
        "Exp. Year": "2028",
        "CVV": 456
      }
    },
    {
      "id": "rec5TestSubmission",
      "createdTime": "2025-03-05T16:20:00.000Z",
      "fields": {
        "firstName": "David",
        "lastName": "Jones",
        "DOB": "1982-09-08",
        "SSN": "678-90-1234",
        "Gender": "male",
        "Address Line 1": "789 Elm Court",
        "City": "Chicago",
        "State": "IL",
        "Zip": "60601",
        "Cell Phone": "(555) 678-9012",
        "email": "david.jones@example.com",
        "Card Number": "4111111111111111",
        "Exp. Month": "07",
        "Exp. Year": "2027",
        "CVV": 789
      }
    },
    // Add some submissions with different field name formats for testing
    {
      "id": "rec6TestSubmission",
      "createdTime": "2025-03-06T10:15:00.000Z",
      "fields": {
        "firstname": "Robert", // lowercase firstname
        "lastname": "Brown", // lowercase lastname
        "DOB": "1975-05-20",
        "SSN": "789-01-2345",
        "Gender": "male",
        "Address Line 1": "123 Cedar Street",
        "City": "Boston",
        "State": "MA",
        "Zip": "02108",
        "Cell Phone": "(555) 789-0123",
        "email": "robert.brown@example.com"
      }
    },
    {
      "id": "rec7TestSubmission",
      "createdTime": "2025-03-07T14:30:00.000Z",
      "fields": {
        "First Name": "Elizabeth", // spaced First Name
        "Last Name": "Taylor", // spaced Last Name
        "DOB": "1988-11-15",
        "SSN": "890-12-3456",
        "Gender": "female",
        "Address Line 1": "456 Walnut Avenue",
        "City": "San Francisco",
        "State": "CA",
        "Zip": "94102",
        "Cell Phone": "(555) 890-1234",
        "email": "elizabeth.taylor@example.com"
      }
    }
  ];
}

/**
 * Format a name for display
 */
function getFormattedName(submission) {
  const fields = submission.fields;
  if (!fields) return "Unknown";
  
  // Check all possible field name formats
  const possibleFirstNames = [
    fields.firstName,
    fields.firstname,
    fields.FirstName,
    fields["First Name"],
    fields["first name"],
    fields["first_name"]
  ];
  
  const possibleLastNames = [
    fields.lastName,
    fields.lastname,
    fields.LastName,
    fields["Last Name"],
    fields["last name"],
    fields["last_name"]
  ];
  
  // Find the first non-empty first name
  const firstName = possibleFirstNames.find(name => name) || '';
  
  // Find the first non-empty last name
  const lastName = possibleLastNames.find(name => name) || '';
  
  // Format: "Last, First"
  return `${lastName}, ${firstName}`.trim().replace(/^,\s?/, '');
}

/**
 * Initialize the cache with test data if it's empty
 */
function initializeWithTestData() {
  if (submissionsCache.length === 0) {
    // Start with the primary test submission
    const mainSubmission = loadPreviousSubmission();
    submissionsCache = [mainSubmission];
    
    // Add more test submissions
    const moreSubmissions = loadMoreTestSubmissions();
    submissionsCache = submissionsCache.concat(moreSubmissions);
    
    console.log('Initialized submission cache with', submissionsCache.length, 'test entries');
  }
}

// Listen for content script messages
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSubmissions') {
      // Show logs only when forceRefresh is true (i.e., Refresh button clicked)
      const showLogs = request.forceRefresh === true;
      fetchSubmissions(showLogs).then(submissions => {
        sendResponse({ status: 'success', submissions: submissions });
      }).catch(error => {
        if (showLogs) console.error('Error fetching submissions:', error);
        sendResponse({ status: 'error', message: error.toString() });
      });
      return true; // Required for async response
    }
    return true;
  });
}

// Export functions for use in other contexts
if (typeof window !== 'undefined') {
  // Add to window object in browser context
  window.fetchSubmissions = fetchSubmissions;
  window.searchSubmissionsByName = searchSubmissionsByName;
  window.loadPreviousSubmission = loadPreviousSubmission;
}

// No longer initialize on load - only when Refresh button is clicked 