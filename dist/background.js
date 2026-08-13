// src/background/services/scriptService.ts
async function injectScript(tabId, file) {
  const absolutePath = file.startsWith("/") ? file : `/${file}`;
  return chrome.scripting.executeScript({
    target: { tabId },
    files: [absolutePath]
  });
}

// src/background/handlers/updateTab.ts
async function updateTab(message, file, newTabId) {
  const captchaTitle = "Just a moment...";
  await chrome.tabs.update(newTabId, { url: message.url });
  chrome.tabs.onUpdated.addListener(
    async function listener(updatedTabId, info) {
      if (updatedTabId !== newTabId || info.status !== "complete") {
        return;
      }
      const tab = await chrome.tabs.get(newTabId);
      const tabTitle = tab.title;
      if (tabTitle === captchaTitle) {
        await chrome.tabs.update(newTabId, { active: true });
        return;
      }
      await injectScript(newTabId, file);
      chrome.tabs.onUpdated.removeListener(listener);
    }
  );
}

// src/background/state.ts
var tabsState = /* @__PURE__ */ new Map();

// src/background/services/tabService.ts
async function createAutomationTab(url) {
  const tabs = await chrome.tabs.query({
    active: true,
    // Get active tab
    currentWindow: true
    // on active browser window
  });
  const currentTab = tabs[0];
  if (!currentTab) return;
  const tabProps = {
    url,
    active: false,
    index: currentTab.index + 1
  };
  const newTab = await chrome.tabs.create(tabProps);
  if (!newTab || newTab.id === void 0) return newTab;
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
async function launchTab(message, file, sourceTabId, downloadKey) {
  const tab = await createAutomationTab(message.url);
  if (tab?.id === void 0) return;
  tabsState.set(tab.id, {
    sourceTabId,
    downloadKey
  });
  await injectScript(tab.id, file);
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
async function sendProgress(sourceTabId, payload) {
  try {
    await chrome.tabs.sendMessage(sourceTabId, {
      type: "DOWNLOAD_PROGRESS",
      payload
    });
  } catch (error) {
    console.error(
      `Failed to send progress to tab ${sourceTabId}:`,
      error
    );
  }
}
async function monitorDownload(sourceTabId, downloadId) {
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
      sendProgress(sourceTabId, payload);
      if (item.state === "complete" || item.state === "interrupted") {
        clearInterval(interval);
      }
    });
  }, 1e3);
}

// src/background/handlers/downloadAnime.ts
async function downloadAnime(newTabId) {
  const downloadId = await createDownload(newTabId);
  const state = tabsState.get(newTabId);
  if (state) {
    chrome.tabs.sendMessage(state.sourceTabId, {
      type: "DOWNLOAD_ID_FOUND",
      downloadKey: state.downloadKey,
      downloadId
    });
    state.downloadId = downloadId;
    monitorDownload(state.sourceTabId, downloadId);
  }
  return downloadId;
}

// src/background/background.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "LAUNCH_TAB": {
      const sourceTabId = sender.tab?.id;
      if (sourceTabId === void 0) return true;
      console.log(message.downloadKey);
      launchTab(message, "dist/pahe.js", sourceTabId, message.downloadKey).then(() => {
      });
      return true;
    }
    // The message type is triggered in the new tab
    case "UPDATE_TAB": {
      const automationTabId = sender.tab?.id;
      if (automationTabId === void 0) return true;
      updateTab(message, "dist/kwik.js", automationTabId).then((result) => {
        sendResponse({ success: true, data: result });
      });
      return true;
    }
    case "DOWNLOAD_ANIME": {
      const automationTabId = sender.tab?.id;
      if (automationTabId === void 0) return true;
      downloadAnime(automationTabId).then((result) => {
        sendResponse({ success: true, data: result });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }
  }
});
