// src/background/services/scriptService.ts
function injectScript(tabId, file) {
  const absolutePath = file.startsWith("/") ? file : `/${file}`;
  return chrome.scripting.executeScript({
    target: { tabId },
    files: [absolutePath]
  });
}

// src/background/state.ts
var state = {
  currentTabId: void 0,
  // Tab that initiates the download automation
  pendingTabId: void 0,
  // tab where pahe and kwik scripts are injected. This tab is later removed when the download starts  
  pendingDownloadId: void 0
};

// src/background/handlers/updateTab.ts
async function updateTab(message, file) {
  const captchaTitle = "Just a moment...";
  const tabId = state.pendingTabId;
  if (!tabId) return;
  await chrome.tabs.update(tabId, { url: message.url });
  chrome.tabs.onUpdated.addListener(
    async function listener(updatedTabId, info) {
      if (updatedTabId !== tabId || info.status !== "complete") {
        return;
      }
      const tab = await chrome.tabs.get(tabId);
      const tabTitle = tab.title;
      if (tabTitle === captchaTitle) {
        await chrome.tabs.update(tabId, { active: true });
        return;
      }
      console.log("Killed");
      injectScript(tabId, file);
      chrome.tabs.onUpdated.removeListener(listener);
    }
  );
}

// src/background/services/tabService.ts
async function createAutomationTab(url) {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  const currentTab = tabs[0];
  if (!currentTab) return;
  const tabProps = {
    url,
    active: false,
    index: currentTab.index + 1
  };
  state.currentTabId = currentTab.id;
  const newTab = await chrome.tabs.create(tabProps);
  if (!newTab || !newTab.id) return newTab;
  return new Promise((resolve) => {
    const listener = (tabId, changeInfo) => {
      if (tabId === newTab.id && changeInfo.status === "loading") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve(newTab);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

// src/background/handlers/launchTab.ts
async function launchTab(message, file) {
  const tab = await createAutomationTab(message.url);
  if (!tab) return;
  state.pendingTabId = tab.id;
  if (!state.pendingTabId) return;
  await injectScript(state.pendingTabId, file);
}

// src/background/services/downloadService.ts
function createDownload(tabId) {
  return new Promise((resolve) => {
    chrome.downloads.onCreated.addListener(function listener(downloadItem) {
      resolve(downloadItem.id);
      chrome.tabs.remove(tabId);
      chrome.downloads.onCreated.removeListener(listener);
    });
  });
}
async function sendProgress(payload) {
  if (state.currentTabId) {
    chrome.tabs.sendMessage(state.currentTabId, { type: "DOWNLOAD_PROGRESS", payload });
  }
}
async function monitorDownload(downloadId, tabId) {
  const interval = setInterval(() => {
    chrome.downloads.search({ id: downloadId }, ([item]) => {
      if (!item) {
        clearInterval(interval);
        return;
      }
      const downloadState = item.state;
      const bytesReceived = item.bytesReceived;
      const totalBytes = item.totalBytes;
      const percent = totalBytes > 0 ? parseFloat((bytesReceived / totalBytes * 100).toFixed(1)) : 100;
      const payload = {
        downloadId,
        percent,
        bytesReceived,
        totalBytes,
        downloadState,
        error: item.error
      };
      sendProgress(payload);
      if (item.state === "complete" || item.state === "interrupted") {
        clearInterval(interval);
      }
    });
  }, 1e3);
}

// src/background/handlers/downloadAnime.ts
async function downloadAnime() {
  const tabId = state.pendingTabId;
  if (!tabId) {
    return;
  }
  state.pendingDownloadId = await createDownload(tabId);
  await monitorDownload(state.pendingDownloadId, tabId);
}

// src/background/background.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "LAUNCH_TAB":
      launchTab(message, "dist/pahe.js").then(() => {
      });
      return true;
    case "UPDATE_TAB":
      updateTab(message, "dist/kwik.js").then((result) => {
        sendResponse({ success: true, data: result });
      });
      return true;
    case "DOWNLOAD_ANIME":
      downloadAnime().then((result) => {
        sendResponse({ success: true, data: result });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
  }
});
