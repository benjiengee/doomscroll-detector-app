document.getElementById("download").addEventListener("click", () => {
  chrome.storage.local.get("sessions", (data) => {
    const blob = new Blob(["timeOfDay,videoTitle,clicksSinceLastSearch\n" + data.sessions], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "youtube_watch_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
});
