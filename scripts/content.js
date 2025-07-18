chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getTitle") {
    const title = document.querySelector('#title yt-formatted-string')?.innerText;
    sendResponse({ title });
  }
  return true; // keeps message channel open for async
});
