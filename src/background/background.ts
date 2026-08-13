import { updateTab } from "./handlers/updateTab";
import { launchTab } from "./handlers/launchTab";
import { downloadAnime } from "./handlers/downloadAnime";

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
            if (automationTabId === undefined) return true
            
            downloadAnime(automationTabId)
                .then((result) => {
                    sendResponse({ success: true, data: result });
                })
                .catch((error) => {
                    sendResponse({ success: false, error: error.message });
                });
            return true;
        }
    }
})