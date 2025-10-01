chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getTitle") {
    const title = document.querySelector('#title yt-formatted-string')?.innerText;
    sendResponse({ title });
  }
  if (message.type === "promptProductivity") {
    showProductivityPrompt(message.videoId);
  }
  
  return true;
});

function showProductivityPrompt(videoId) {
  // Prevent multiple prompts
  if (document.getElementById("productivity-prompt")) return;

  const container = document.createElement("div");
  container.id = "productivity-prompt";
  container.style.position = "fixed";
  container.style.bottom = "500px";
  container.style.right = "650px";
  container.style.backgroundColor = "white";
  container.style.border = "1px solid black";
  container.style.padding = "20px";
  container.style.zIndex = "9999";
  container.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
  container.innerText = "Is this video productive? ";

  const yesBtn = document.createElement("button");
  yesBtn.textContent = "Yes";
  yesBtn.onclick = () => {
    chrome.runtime.sendMessage({ type: "productivityResponse", videoId, label: 1 });
    container.remove();
  };

  const noBtn = document.createElement("button");
  noBtn.textContent = "No";
  noBtn.onclick = () => {
    chrome.runtime.sendMessage({ type: "productivityResponse", videoId, label: 0 });
    container.remove();
  };

  container.appendChild(yesBtn);
  container.appendChild(noBtn);
  document.body.appendChild(container);
}
