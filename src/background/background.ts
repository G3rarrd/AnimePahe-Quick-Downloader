import { launchTab } from "./handlers/launchTab";
import { tabsState } from "./state";
import {  waitForDownload } from "./services/downloadService";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {

        case "LAUNCH_TAB":{
            // The message originates from the tab that initiated the automation.
            // Message Source: src\content\animepahe\downloadHandler.ts
            const sourceTabId = sender.tab?.id 

            if (sourceTabId === undefined) return true

            // Message Handler: src/content/pahe/pahe.ts
            void launchTab(message, "dist/kwik.js", sourceTabId, message.downloadKey);
            return true;
        }
        
        case "DOWNLOAD_ANIME": {
            // The injected Kwik script notifies the background worker that a download is about to start.
            // Message Source: src\content\kwik\kwik.ts
            const automationTabId = sender.tab?.id 

            if (automationTabId === undefined) return true;

            const state = tabsState.get(automationTabId)

            if (!state) return;

            state.waitingForDownload = true;

            void waitForDownload(automationTabId);
        }
    }
})
