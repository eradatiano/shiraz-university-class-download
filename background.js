// Handle tasks that need to run persistently, such as listening to events or messaging

// These scripts run continuously in the background and handle events, communicate with other parts of your extension, and interact with the web pages

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed!");
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: getPageHTML,
    },
    (results) => {
      if (results && results[0].result) {
        console.log("Page URL:", results[0].result.url);
        console.log("HTML Source:", results[0].result.html);
      }
    }
  );
  console.log(document.documentElement.outerHTML);
});

const getPageHTML = function () {
  return {
    url: window.location.href,
    html: document.documentElement.outerHTML,
  };
};

// Example: Listen for messages
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.greeting === "hello") {
//     sendResponse({ farewell: "goodbye" });
//   }
// });

// https://offline.shirazu.ac.ir/14031/%3Ccode%3E.zip
