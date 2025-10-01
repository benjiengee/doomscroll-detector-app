async function checkTitle(title) {
    let response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: title })
    });
    let data = await response.json(); // returns a 0 or 1
    return data;
}

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
        const timeOfDay = new Date().toLocaleTimeString();

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
                        title,
                        timeOfDay
                    };

                    // Ping python server
                    checkTitle(title).then(result => {
                        console.log("Productive: ", result, '\n');
                        if (result === 0) {
                            // TODO: Add logic for time of Day
                            chrome.tabs.sendMessage(tabId, {type: "block"});
                        }
                    })
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