// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Form Prefiller Extension installed!');
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'logSuccess') {
    console.log('Form was successfully filled with test data!');
    sendResponse({status: 'acknowledged'});
  }
  return true; // Keep the message channel open for async response
}); 