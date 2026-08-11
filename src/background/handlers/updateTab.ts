import type { UpdateTabMessage as UpdateTabMessage } from "../../types/messages";
import { injectScript } from "../services/scriptService";
import { state } from "../state";

export async function updateTab(message : UpdateTabMessage, file : string) {
    const captchaTitle = "Just a moment...";
    const tabId = state.pendingTabId;
    if (! tabId) return;

    await chrome.tabs.update(tabId, { url : message.url })

    chrome.tabs.onUpdated.addListener(
        async function listener(updatedTabId, info) {
            if (updatedTabId !== tabId || info.status !== "complete"){
                return;
            }

            const tab = await chrome.tabs.get(tabId);
            const tabTitle = tab.title;
            
            // User must solve captcha to proceed when needed so I direct them to it
            // no further redirections will be made after solving the captcha
            if (tabTitle === captchaTitle) {
                await chrome.tabs.update(tabId, { active: true });
                return;
            }
            
            injectScript(tabId, file);

            chrome.tabs.onUpdated.removeListener(listener);
        }
    )
}  