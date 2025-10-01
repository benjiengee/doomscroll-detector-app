let youtubeTabs = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete" || !tab.url || !tab.url.startsWith("https://www.youtube.com/")) {
        return;
    }

    if (!youtubeTabs[tabId]) {
        youtubeTabs[tabId] = {};
    }

    if (tab.url.includes("/watch")) {
        console.log("Video clicked; ");

        chrome.scripting.executeScript({
            target: { tabId },
            files: ["scripts/content.js"]
        }, () => {
            if (chrome.runtime.lastError) {
            console.warn("Script injection failed:", chrome.runtime.lastError.message);
            return;
            }
            setTimeout(() => { // 2000 ms timeout to give time for YouTube DOM to catch up to url update
                chrome.tabs.sendMessage(tabId, { type: "getTitle" }, (response) => {
                    if (chrome.runtime.lastError || !response) {
                        console.warn("Failed to get title:", chrome.runtime.lastError?.message);
                        return;
                    }

                    const title = response.title || "unknown";
                    console.log('Received title: ', title, '; ');
                    const videoId = `${tabId}-${Date.now()}`; // Unique ID for response

                    // Store title and other info temporarily until user responds
                    youtubeTabs[tabId].pendingVideo = {
                        videoId,
                        title
                    };

                    // Ask user for productivity label
                    chrome.tabs.sendMessage(tabId, { type: "promptProductivity", videoId });
                    console.log('Prompted User; ');

                });
            }, 2000)
        });
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    if (youtubeTabs[tabId]) {
        delete youtubeTabs[tabId];
        console.log("YouTube tab closed, tracking removed for:", tabId);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "productivityResponse") {
    const { videoId, label } = message;
    console.log("Received User Input: ", label, "\n");

    // Find matching tab
    const tabId = sender.tab.id;
    const info = youtubeTabs[tabId]?.pendingVideo;
    if (!info || (info.videoId !== videoId)) return;

    const row = `"${info.title.replace(/"/g, '""')}",${label}\n`;
    console.log(row);

    chrome.storage.local.get({ sessions: "" }, (result) => {
      const updated = result.sessions + row;
      chrome.storage.local.set({ sessions: updated });
    });

    // Clean up
    delete youtubeTabs[tabId].pendingVideo;
  }
});