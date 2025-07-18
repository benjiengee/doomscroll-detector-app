let youtubeTabs = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete" || !tab.url || !tab.url.startsWith("https://www.youtube.com/")) {
        return;
    }

    if (!youtubeTabs[tabId]) {
        youtubeTabs[tabId] = { start: Date.now(), clicksSinceLastSearch: 0 };
        console.log("New YouTube tab tracked:", tabId);
    }

    if (tab.url.includes("/watch")) {
        console.log("Navigated to a watch page");
        youtubeTabs[tabId].clicksSinceLastSearch += 1;
        console.log("Videos since last search:", youtubeTabs[tabId].clicksSinceLastSearch);
        const timeOfDay = new Date().toLocaleTimeString();

        chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["scripts/content.js"]
        }, () => {
        if (chrome.runtime.lastError) {
            console.warn("Script injection failed:", chrome.runtime.lastError.message);
            return;
        }

        chrome.tabs.sendMessage(tabId, { type: "getTitle" }, (response) => {
            if (chrome.runtime.lastError) {
            console.warn("Failed to get title:", chrome.runtime.lastError.message);
            return;
            }

            let title = response?.title || "unknown";
            const timeOfDay = new Date().toLocaleTimeString();
            const row = `${timeOfDay},"${title.replace(/"/g, '""')}",${youtubeTabs[tabId].clicksSinceLastSearch}\n`;

            chrome.storage.local.get({ sessions: "" }, (result) => {
            const updated = result.sessions + row;
            chrome.storage.local.set({ sessions: updated });
            });
        });
        });
    }

    if (tab.url.includes("/results")) {
        console.log("Navigated to a search results page");
        youtubeTabs[tabId].clicksSinceLastSearch = 0;
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    if (youtubeTabs[tabId]) {
        delete youtubeTabs[tabId];
        console.log("YouTube tab closed, tracking removed for:", tabId);
    }
});