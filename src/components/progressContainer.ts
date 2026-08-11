import { checkIcon } from "../icons/check";
import { cancelIcon } from "../icons/cancel";
import type { DownloadProgress } from "../types/downloadProgress";
import { progressRing } from "./progressRing";

export function progressContainer() : HTMLSpanElement {
    const container : HTMLSpanElement = document.createElement("span");
    container.classList.add("progress-container");

    const {svg, setProgress} = progressRing();
    container.appendChild(svg);
    function onMessage(message: any) {
        if (message.type !== 'DOWNLOAD_PROGRESS') return;

        const { percent, downloadState, error }: DownloadProgress = message.payload;

        setProgress(percent);

        if (downloadState === 'complete') {
            container.innerHTML = checkIcon
            chrome.runtime.onMessage.removeListener(onMessage);
        }

        if (downloadState === 'interrupted') {
            container.innerHTML = cancelIcon;
            chrome.runtime.onMessage.removeListener(onMessage);
        }
    }

    chrome.runtime.onMessage.addListener(onMessage);

    return container
}