import type { DownloadProgress } from "../../types/downloadProgress";
import { tabsState } from "../state";

/**
 * Notifies the original content script that the download fetch failed.
 * 
 * @param tabId - The ID of the temporary background tab that failed.
 */
export async function sendDownloadFailureMessage(tabId: number) {
    const state = tabsState.get(tabId);

    if (!state) return;
    
    // commented out because i might need them if errors are encountered in future iterations
    // try {
        // Sends message to content/animepahe/downloadHandler.ts
    await chrome.tabs.sendMessage(state.sourceTabId, {
        type: "FAILED_TO_FETCH_DOWNLOAD",
        downloadKey: state.downloadKey
    }).catch(() => {});
    // } catch (error) {
    //     // This catches the error if the user closed the source tab 
    //     // before we could send the message back to it.
    //     console.warn(`Could not send failure message. Tab ${state.sourceTabId} might be closed.`, error);
    // }
}

/**
 * Notifies the original content script that the download ID was found.
 * 
 * @param tabId - The ID of the temporary background tab.
 * @param downloadId - The browser's official ID for the started download.
 */
export async function sendDownloadSuccessMessage(tabId: number, downloadId: number) {
    const state = tabsState.get(tabId);

    if (!state) return;

    // Sends message to content/animepahe/downloadHandler.ts
    await chrome.tabs.sendMessage(state.sourceTabId, {
        type: "DOWNLOAD_ID_FOUND",
        downloadKey: state.downloadKey,
        downloadId,
    }).catch(() => {});
}

/**
 * Notifies the main animepahe tab the download progress every time it is called 
 * 
 * @param sourceTabId - The ID of the main animephae tab
 * @param payload - The download information
 */
export async function sendProgress(sourceTabId: number, payload: DownloadProgress) {
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