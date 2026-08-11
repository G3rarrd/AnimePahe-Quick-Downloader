import type { LaunchTabMessage } from "../../types/messages";
import { injectScript } from "../services/scriptService";
import { state } from "../state";
import { createAutomationTab } from "../services/tabService";

export async function launchTab(message : LaunchTabMessage, file : string) {
    const tab = await createAutomationTab(message.url);

    if (!tab) return

    state.pendingTabId = tab.id;

    if (!state.pendingTabId) return;

    await injectScript(state.pendingTabId, file);
}