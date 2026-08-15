import type { LaunchTabMessage } from "../../types/messages";
import { injectScript } from "../services/scriptService";
import { tabsState} from "../state";
import { createAutomationTab,waitForKwikTabLoad } from "../services/tabService";

export async function launchTab(
    message: LaunchTabMessage,
    file: string,
    sourceTabId: number,
    downloadKey : string
) {
    const automationTab = await createAutomationTab(message.url);

    if (automationTab?.id === undefined) return;

    tabsState.set(automationTab.id, {
        sourceTabId,
        downloadKey,
        waitingForDownload : true
    });
    
    // Ensures the kwik site is open.
    // Possibilities of a user captcha to solve
    await waitForKwikTabLoad(automationTab.id);

    await injectScript(automationTab.id, file);
}

