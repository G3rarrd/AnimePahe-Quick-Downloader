import { tabsState } from "../state";
import { sendDownloadFailureMessage } from "./messageService";

export async function createAutomationTab(url: string) : Promise<chrome.tabs.Tab | undefined> {

    const tabs: chrome.tabs.Tab[] = await chrome.tabs.query({
        active: true, // Get active tab
        currentWindow : true // on active browser window
    });

    const currentTab: chrome.tabs.Tab | undefined = tabs[0];
    
    if (!currentTab) return;
    
    const automationTabProps = {
        url,
        active : false,
        index : currentTab.index + 1
    };

    const automationTab = await chrome.tabs.create(automationTabProps);

    if (!automationTab || automationTab.id===undefined) return automationTab;


    return new Promise((resolve) => {
        // FIX: Explicitly type changeInfo as an inline object signature
        const listener = (tabId: number, changeInfo: { status?: string; url?: string }) => {
            if (tabId === automationTab.id && changeInfo.status === "loading") {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve(automationTab);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
}

export function waitForKwikTabLoad(tabId: number): Promise<void> {
    const captchaTitle = "Just a moment...";

    return new Promise((resolve, reject) => {
        const cleanup = () => {
            chrome.tabs.onUpdated.removeListener(updateListener);
            chrome.tabs.onRemoved.removeListener(removeListener);
        }

        const updateListener = async (updatedTabId: number, changeInfo: chrome.tabs.OnUpdatedInfo) => {
            if (updatedTabId !== tabId || changeInfo.status !== "complete") {
                return
            }

            try {
                const tab = await chrome.tabs.get(tabId);
                if (tab.title === captchaTitle) {
                    await chrome.tabs.update(tabId, { active: true });
                    return;
                }
                cleanup();
                resolve();

            } catch (error) {
                cleanup();
                reject(error);
            }
        };

        const removeListener = async (closedTabId: number) => {
            if (closedTabId == tabId) {
                cleanup();
                reject(new Error(`Tab ${tabId} was closed before loading completed.`));

                await sendDownloadFailureMessage(tabId);
            }
        }

        chrome.tabs.onUpdated.addListener(updateListener);
        chrome.tabs.onRemoved.addListener(removeListener);
    });
}


export async function closeTabWhenPossible(tabId: number) {
    const maxAttempts = 10;
    const retryDelay = 250;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            await chrome.tabs.remove(tabId);
            console.log(`Closed tab ${tabId}`);
            return;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            // The tab may already have been closed.
            if (message.includes("No tab with id")) return;

            console.warn(`Could not close tab ${tabId} (attempt ${attempt + 1}/${maxAttempts})`, message);

            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }

    console.error(
        `Failed to close tab ${tabId} after ${maxAttempts} attempts`
    );
}