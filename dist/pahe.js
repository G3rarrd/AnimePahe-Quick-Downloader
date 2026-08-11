// src/utils/domWait.ts
function waitForElements(selector) {
  return new Promise((resolve) => {
    const scriptsExisting = document.querySelectorAll(selector);
    if (scriptsExisting.length > 0) {
      return resolve(scriptsExisting);
    }
    const observer = new MutationObserver(() => {
      const scripts = document.querySelectorAll(selector);
      if (scripts.length > 0) {
        observer.disconnect();
        resolve(scripts);
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });
}

// src/content/pahe/extractKwikLink.ts
async function selectKwikLink() {
  const scripts = await waitForElements("script");
  const regex = /https:\/\/kwik\.cx\/[^'")\s]+/;
  for (const script of scripts) {
    const match = regex.exec(script.textContent);
    if (match) {
      return match[0];
    }
  }
  return null;
}

// src/content/pahe/pahe.ts
async function init() {
  try {
    const kwikUrl = await selectKwikLink();
    if (!kwikUrl) {
      console.warn("[Extension] No Kwik URL detected inside scripts.");
      return;
    }
    const response = await chrome.runtime.sendMessage({
      type: "UPDATE_TAB",
      url: kwikUrl
    });
    console.log("[Extension] Background script acknowledged update:", response);
  } catch (error) {
    console.error("[Extension] Messaging pipeline failed:", error);
  }
}
init();
