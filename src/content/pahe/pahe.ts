import { selectKwikLink } from "./extractKwikLink";

async function init() {
    try {
        const kwikUrl = await selectKwikLink();
        
        if (!kwikUrl) {
            console.warn("[Extension] No Kwik URL detected inside scripts.");
            return;
        }

        const response = await chrome.runtime.sendMessage({
            type: "UPDATE_TAB",
            url: kwikUrl,
        });

        console.log("[Extension] Background script acknowledged update:", response);

    } catch (error) {
        console.error("[Extension] Messaging pipeline failed:", error);
    }
}


init();