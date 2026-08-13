import { updateTab } from "./handlers/updateTab";
import { launchTab } from "./handlers/launchTab";
import { tabsState } from "./state";
import { monitorDownload } from "./services/downloadService";
import { closeTabWhenPossible } from "./services/tabService";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {

        case "LAUNCH_TAB":{
            // The message originates from the tab that initiated the automation.
            // Message Source: src\content\animepahe\downloadHandler.ts
            const sourceTabId =sender.tab?.id 
            if (sourceTabId === undefined) return true
            console.log(message.downloadKey)
            
            // Message Handler: src/content/pahe/pahe.ts
            void launchTab(message, "dist/pahe.js", sourceTabId, message.downloadKey);
            return true;
        }
        

        case "UPDATE_TAB": {
            // This message is sent from the newly opened automation tab.
            // Message Source: src\content\pahe\pahe.ts
            const automationTabId =sender.tab?.id 
            if (automationTabId === undefined) return true
            
            // Message Handler: src/content/kwik/kwik.ts
            updateTab(message, "dist/kwik.js", automationTabId)
                .then((result) => {
                    sendResponse({success : true, data : result});
                });
            return true;
        }
            
        case "DOWNLOAD_ANIME": {
            // The injected Kwik script notifies the background worker that a download is about to start.
            // Message Source: src\content\kwik\kwik.ts
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
        // console.log()
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