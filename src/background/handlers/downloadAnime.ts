import { createDownload, monitorDownload } from "../services/downloadService";
import {  tabsState } from "../state";

export async function downloadAnime(newTabId : number ) {
    
    const downloadId = await createDownload(newTabId);

    const state = tabsState.get(newTabId)
    
    if (state){
        chrome.tabs.sendMessage(state.sourceTabId, {
            type: "DOWNLOAD_ID_FOUND",
            downloadKey : state.downloadKey,
            downloadId : downloadId
        })
        state.downloadId = downloadId
        monitorDownload(state.sourceTabId, downloadId);
    }


    

    return downloadId
}