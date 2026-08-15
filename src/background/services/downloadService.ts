import type { DownloadProgress } from "../../types/downloadProgress";

import { tabsState } from "../state";
import { closeTabWhenPossible } from "./tabService";

export async function waitForDownload(tabId : number) {
    const listener =  async (download : chrome.downloads.DownloadItem) => {
        const state = tabsState.get(tabId)
        const downloadId = download.id
        
        if (!state) {
            console.warn("Tab was not found");
            return;
        }

        await chrome.tabs.sendMessage(state.sourceTabId, {
            type: "DOWNLOAD_ID_FOUND",
            downloadKey: state.downloadKey,
            downloadId,
        }).catch(() => {});

        monitorDownload(state.sourceTabId, downloadId)
        await closeTabWhenPossible(tabId)
        chrome.downloads.onCreated.removeListener(listener);
    }
    chrome.downloads.onCreated.addListener(listener);
}

async function sendProgress(
    sourceTabId: number,
    payload: DownloadProgress
) {
    try {
        // Message Handler: src\components\progressContainer.ts
        await chrome.tabs.sendMessage(sourceTabId, {
            type: "DOWNLOAD_PROGRESS",
            payload,
        });
    } catch (error) {
        console.error(
            `Failed to send progress to tab ${sourceTabId}:`,
            error
        );
    }
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