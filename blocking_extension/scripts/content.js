chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getTitle") {
    const title = document.querySelector('#title yt-formatted-string')?.innerText;
    sendResponse({ title });
  }
  if (message.type === "block") {
    blockVideo();
  }

  return true;
});

function blockVideo() {
  // TODO
  // Prevent multiple prompts
  if (document.getElementById("block-prompt")) return;

  const container = document.createElement("div");
  container.id = "block-prompt";
  container.style.position = "fixed";
  container.style.bottom = "500px";
  container.style.right = "650px";
  container.style.backgroundColor = "white";
  container.style.border = "1px solid black";
  container.style.padding = "20px";
  container.style.zIndex = "9999";
  container.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
  container.innerText = "BLOCK!";

  document.body.appendChild(container);
}
