// src/utils/domWait.ts
function waitForElement(selector) {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) {
      return resolve(existing);
    }
    const observer = new MutationObserver(() => {
      const ele = document.querySelector(selector);
      if (ele) {
        observer.disconnect();
        resolve(ele);
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });
}

// src/content/kwik/kwik.ts
async function init() {
  const selector = ".button.is-uppercase.is-success.is-fullwidth";
  const downloadBtn = await waitForElement(selector);
  if (!downloadBtn) return;
  downloadBtn.click();
  const response = await chrome.runtime.sendMessage({
    type: "DOWNLOAD_ANIME"
  });
}
init();
