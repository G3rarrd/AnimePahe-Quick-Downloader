import type { UpdateTabMessage as UpdateTabMessage } from "../../types/messages";
import { injectScript } from "../services/scriptService";

export async function updateTab(message : UpdateTabMessage, file : string, automationTabId : number) {
    const captchaTitle = "Just a moment...";

    await chrome.tabs.update(automationTabId, { url : message.url })

    // Wait for the requested page to finish loading before handling the tab.
    chrome.tabs.onUpdated.addListener(
        async function listener(updatedTabId, info) {
            if (updatedTabId !== automationTabId || info.status !== "complete"){
                return;
            }

            const tab = await chrome.tabs.get(automationTabId);
            const tabTitle = tab.title;
            
            // If Cloudflare presents a CAPTCHA, let the user solve it manually by redirecting them.
            if (tabTitle === captchaTitle) {
                await chrome.tabs.update(automationTabId, { active: true });
                return;
            }
            
            await injectScript(automationTabId, file);

            chrome.tabs.onUpdated.removeListener(listener);
        }
    )
}  