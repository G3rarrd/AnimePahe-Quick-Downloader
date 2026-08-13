import { updateTab } from "./handlers/updateTab";
import { launchTab } from "./handlers/launchTab";
// import { downloadAnime } from "./handlers/downloadAnime";
import { tabsState } from "./state";
import { monitorDownload } from "./services/downloadService";
import { closeTabWhenPossible } from "./services/tabService";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log(message, message.type)
    switch (message.type) {

        case "LAUNCH_TAB":{
            const sourceTabId =sender.tab?.id 
            if (sourceTabId === undefined) return true
            console.log(message.downloadKey)
            
            launchTab(message, "dist/pahe.js", sourceTabId, message.downloadKey).then(() => {});
            return true;
        }
        
        // The message type is triggered in the new tab
        case "UPDATE_TAB": {
            const automationTabId =sender.tab?.id 
            if (automationTabId === undefined) return true
            
            updateTab(message, "dist/kwik.js", automationTabId)
                .then((result) => {
                    sendResponse({success : true, data : result});
                });
            return true;
        }
            
        case "DOWNLOAD_ANIME": {
            const automationTabId =sender.tab?.id 

            if (automationTabId === undefined) return true;

            const state = tabsState.get(automationTabId)

            if (!state) return;

            state.waitingForDownload = true;

        }
    }
})

chrome.downloads.onCreated.addListener((download) => {
    for (const [tabId, state] of tabsState) {
        if (!state.waitingForDownload) {
            continue;
        }

        state.waitingForDownload = false;
        state.downloadId = download.id;

        chrome.tabs.sendMessage(state.sourceTabId, {
            type: "DOWNLOAD_ID_FOUND",
            downloadKey: state.downloadKey,
            downloadId: download.id,
        }).catch(() => {});

        monitorDownload(state.sourceTabId,download.id);

        void closeTabWhenPossible(tabId);

        break;
    }
});