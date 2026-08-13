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

export function waitForTabLoad(tabId: number): Promise<void> {
    return new Promise((resolve) => {
        const listener = (
            updatedTabId: number,
            changeInfo: chrome.tabs.OnUpdatedInfo
        ) => {
            if (
                updatedTabId === tabId &&
                changeInfo.status === "complete"
            ) {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
            }
        };

        chrome.tabs.onUpdated.addListener(listener);
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
            if (message.includes("No tab with id")) {
                return;
            }

            console.warn(
                `Could not close tab ${tabId} (attempt ${attempt + 1}/${maxAttempts})`,
                message
            );

            await new Promise((resolve) =>
                setTimeout(resolve, retryDelay)
            );
        }
    }

    console.error(
        `Failed to close tab ${tabId} after ${maxAttempts} attempts`
    );
}