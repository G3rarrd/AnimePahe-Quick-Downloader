import type { LaunchTabMessage } from "../../types/messages";
import { injectScript } from "../services/scriptService";
import { tabsState} from "../state";
import { createAutomationTab } from "../services/tabService";

export async function launchTab(
    message: LaunchTabMessage,
    file: string,
    sourceTabId: number,
    downloadKey : string
) {
    const tab = await createAutomationTab(message.url);

    if (tab?.id === undefined) return;

    tabsState.set(tab.id, {
        sourceTabId: sourceTabId,
        downloadKey
    });

    await injectScript(tab.id, file);
}