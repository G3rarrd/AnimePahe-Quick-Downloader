import { state } from "../state";

export async function createAutomationTab(url: string) : Promise<chrome.tabs.Tab | undefined> {

    const tabs: chrome.tabs.Tab[] = await chrome.tabs.query({
        active: true, // Get active tab
        currentWindow : true // on active browser window
    });

    const currentTab: chrome.tabs.Tab | undefined = tabs[0];
    
    if (!currentTab) return;
    
    const tabProps = {
        url,
        active : false,
        index : currentTab.index + 1
    };

    state.currentTabId = currentTab.id;

    const newTab = await chrome.tabs.create(tabProps);

    if (!newTab || newTab.id===undefined) return newTab;


    return new Promise((resolve) => {
        // FIX: Explicitly type changeInfo as an inline object signature
        const listener = (tabId: number, changeInfo: { status?: string; url?: string }) => {
            if (tabId === newTab.id && changeInfo.status === "loading") {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve(newTab);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
}

