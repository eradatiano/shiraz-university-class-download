// Handle tasks that need to run persistently, such as listening to events or messaging

// These scripts run continuously in the background and handle events, communicate with other parts of your extension, and interact with the web pages

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed!");
});

