import { updateTab } from "./handlers/updateTab";
import { launchTab } from "./handlers/launchTab";
import { downloadAnime } from "./handlers/downloadAnime";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case "LAUNCH_TAB":
            launchTab(message, "dist/pahe.js").then(() => {});
            return true;

        case "UPDATE_TAB":
            updateTab(message, "dist/kwik.js")
                .then((result) => {
                    sendResponse({success : true, data : result});
                });
            return true;
            
        case "DOWNLOAD_ANIME":
            downloadAnime()
                .then((result) => {
                    sendResponse({ success: true, data: result });
                })
                .catch((error) => {
                    sendResponse({ success: false, error: error.message });
                });
            return true;
    }
})