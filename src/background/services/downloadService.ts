import type { DownloadProgress } from "../../types/downloadProgress";

import { tabsState } from "../state";
import { sendDownloadFailureMessage, sendDownloadSuccessMessage, sendProgress } from "./messageService";
import { closeTabWhenPossible } from "./tabService";

export async function waitForDownload(tabId : number) {
    const state = tabsState.get(tabId)
    
    if (!state) {
        console.warn("Tab was not found");
        return;
    }

    // Need to know if it was prematurely closed
    const tabRemovedListener = async (closedTabId: number) => {
        await sendDownloadFailureMessage(tabId);
        chrome.tabs.onRemoved.removeListener(tabRemovedListener);
    }

    chrome.tabs.onRemoved.addListener(tabRemovedListener);

    const downloadCreationListener =  async (download : chrome.downloads.DownloadItem) => {
        const downloadId = download.id

        await sendDownloadSuccessMessage(tabId, downloadId);

        monitorDownload(state.sourceTabId, downloadId);

        chrome.tabs.onRemoved.removeListener(tabRemovedListener);

        await closeTabWhenPossible(tabId)
        
        chrome.downloads.onCreated.removeListener(downloadCreationListener);
    }
    chrome.downloads.onCreated.addListener(downloadCreationListener);
}

function monitorDownload(sourceTabId : number, downloadId : number){
    const interval = setInterval(() => {
        chrome.downloads.search({id : downloadId }, async ([item]) => {
            if (!item) {
                clearInterval(interval);
                return;
            }
            
            const downloadState : "in_progress" | "interrupted" | "complete" = item.state;
            const bytesReceived : number = item.bytesReceived;
            const totalBytes : number = item.totalBytes;
            const percent : number = totalBytes > 0
                ? parseFloat(((bytesReceived / totalBytes) *100).toFixed(1))
                : 100.0;

            const payload: DownloadProgress = {
                downloadId,
                percent,
                bytesReceived,
                totalBytes,
                downloadState,
                error: item.error,
            };
            
            await sendProgress(sourceTabId, payload);


            if (item.state === 'complete' || item.state === 'interrupted') {
                clearInterval(interval);
            }
        });
    }, 1000);
}