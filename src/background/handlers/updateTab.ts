import type { UpdateTabMessage as UpdateTabMessage } from "../../types/messages";
import { injectScript } from "../services/scriptService";

export async function updateTab(message : UpdateTabMessage, file : string, newTabId : number) {
    const captchaTitle = "Just a moment...";

    await chrome.tabs.update(newTabId, { url : message.url })

    chrome.tabs.onUpdated.addListener(
        async function listener(updatedTabId, info) {
            if (updatedTabId !== newTabId || info.status !== "complete"){
                return;
            }

            const tab = await chrome.tabs.get(newTabId);
            const tabTitle = tab.title;
            
            // User must solve captcha to proceed when needed so I direct them to it
            // no further redirections will be made after solving the captcha
            if (tabTitle === captchaTitle) {
                await chrome.tabs.update(newTabId, { active: true });
                return;
            }
            
            await injectScript(newTabId, file);

            chrome.tabs.onUpdated.removeListener(listener);
        }
    )
}  