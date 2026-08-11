import type { DownloadProgress } from "../../types/downloadProgress";
import { state } from "../state";


export function createDownload(tabId : number) : Promise<number> {
    // close the tab when the download has started and return the download id for use
    return new Promise((resolve) => {
        chrome.downloads.onCreated.addListener(function listener(downloadItem) {
            resolve(downloadItem.id);
            chrome.tabs.remove(tabId);
            chrome.downloads.onCreated.removeListener(listener);
        });    
    });
}

async function sendProgress(payload: object) {
    if (state.currentTabId) {
        chrome.tabs.sendMessage(state.currentTabId, { type: 'DOWNLOAD_PROGRESS', payload });
    }
}

export async function monitorDownload(downloadId : number){
    const interval = setInterval(() => {
        chrome.downloads.search({id : downloadId }, ([item]) => {
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
            
            sendProgress(payload);


            if (item.state === 'complete' || item.state === 'interrupted') {
                clearInterval(interval);
            }
        });
    }, 1000);
}