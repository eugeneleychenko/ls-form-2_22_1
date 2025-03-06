// Background script for Form Prefiller extension

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Form Prefiller extension installed');
  
  // Clear any existing submission cache on install/update
  clearSubmissionsCache();
});

// Initialize submissions cache in storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['submissionsCache'], function(result) {
    if (!result.submissionsCache) {
      // Set an empty submissions cache
      chrome.storage.local.set({ submissionsCache: [] }, function() {
        console.log('Initialized empty submissions cache');
      });
    }
  });
});

// Function to clear submissions cache
function clearSubmissionsCache() {
  chrome.storage.local.remove(['submissionsCache', 'submissionsCacheTime'], function() {
    console.log('Submissions cache cleared');
  });
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request.action);
  
  if (request.action === 'cacheSubmissions') {
    // Cache submissions in local storage
    const now = new Date().getTime();
    chrome.storage.local.set(
      { 
        submissionsCache: request.submissions,
        submissionsCacheTime: now
      }, 
      () => sendResponse({ status: 'success' })
    );
    return true; // Will respond asynchronously
  } 
  else if (request.action === 'getCachedSubmissions') {
    // Get cached submissions from local storage
    chrome.storage.local.get(['submissionsCache', 'submissionsCacheTime'], (result) => {
      if (result.submissionsCache && result.submissionsCache.length > 0) {
        // Check if cache is still fresh (less than 1 hour old)
        const now = new Date().getTime();
        const cacheTime = result.submissionsCacheTime || 0;
        const cacheAge = now - cacheTime;
        const cacheIsFresh = cacheAge < 3600000; // 1 hour in milliseconds
        
        if (cacheIsFresh) {
          sendResponse({ 
            status: 'success', 
            submissions: result.submissionsCache,
            cacheAge: Math.round(cacheAge / 1000) // in seconds
          });
        } else {
          sendResponse({ 
            status: 'expired',
            message: 'Cache is expired' 
          });
        }
      } else {
        sendResponse({ 
          status: 'empty',
          message: 'No cached submissions found' 
        });
      }
    });
    return true; // Will respond asynchronously
  }
  else if (request.action === 'clearCache') {
    // Clear submissions cache
    clearSubmissionsCache();
    sendResponse({ 
      status: 'success',
      message: 'Cache cleared successfully' 
    });
    return true; // Will respond asynchronously
  }
  else if (request.action === 'fetchAirtableSubmissions') {
    console.log('Background script received fetchAirtableSubmissions request with config:', request.config);
    
    // Since we can't load external scripts in the background service worker,
    // we'll inform the content script that it needs to handle this directly
    sendResponse({
      status: 'error',
      message: 'Direct Airtable access not supported in background service worker',
      error: 'SERVICE_WORKER_LIMITATION'
    });
    
    return true; // Will respond asynchronously
  }
}); 