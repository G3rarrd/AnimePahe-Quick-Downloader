import { createDownload, monitorDownload } from "../services/downloadService";
import { state } from "../state";

export async function downloadAnime() {
    const tabId = state.pendingTabId;
    
    if (! tabId) {
        return;
    }
    
    state.pendingDownloadId = await createDownload(tabId);
    await monitorDownload(state.pendingDownloadId);
}