export const state = {
    currentTabId: undefined as number | undefined, // Tab that initiates the download automation
    pendingTabId: undefined as number | undefined, // tab where pahe and kwik scripts are injected. This tab is later removed when the download starts  
    pendingDownloadId: undefined as number | undefined,
};