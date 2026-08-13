import type { DownloadProgress } from "../../types/downloadProgress";

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

export async function monitorDownload(sourceTabId : number, downloadId : number){
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
            
            sendProgress(sourceTabId, payload);


            if (item.state === 'complete' || item.state === 'interrupted') {
                clearInterval(interval);
            }
        });
    }, 1000);
}