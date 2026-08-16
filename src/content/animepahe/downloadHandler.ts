import { loadingDots } from "../../components/loadingDots";
import { progressContainer } from "../../components/progressContainer";
import { fetchKwikLink } from "../../services/fetchDownloadLinks";

const downloadElements = new Map<string, HTMLAnchorElement>();

const cleanup = (element : HTMLAnchorElement) => {
    element.querySelector(".pulse-container")?.remove();
    element.querySelector(".progress-container")?.remove();
}

chrome.runtime.onMessage.addListener((message : any) => {
        // Message Source: src\background\background.ts
    if (message.type !== "DOWNLOAD_ID_FOUND") return

    const linkElement = downloadElements.get(message.downloadKey)

    if (!linkElement) return;

    cleanup(linkElement);

    linkElement.append(progressContainer(message.downloadId));

    downloadElements.delete(message.downloadKey)
})

export function downloadLinkElementListener(element: HTMLAnchorElement) {
    const downloadKey = crypto.randomUUID();

    // State flag to prevent multiple rapid clicks
    let isProcessing = false;

    const onClick = async  (e: Event) => {
        e.preventDefault();

        if (isProcessing) return;

        isProcessing = true;
        
        cleanup(element);

        element.append(loadingDots(true));
        downloadElements.set(downloadKey, element);

        try {
            const link = await fetchKwikLink(element.href);
            console.log(`URL Found: ${link}. Launching Tab`)

            // Message Handler: src\background\background.ts
            chrome.runtime.sendMessage({
                type: "LAUNCH_TAB",
                url: link,
                downloadKey,
            });

            cleanup(element);
            element.append(progressContainer());

        } catch (error) {
            console.error(`Failed to fetch link for ${element.href}`, error);
            cleanup(element);
            element.append(loadingDots(false));
            downloadElements.delete(downloadKey);
        } finally {
            isProcessing = false;
        }
    }

    element.addEventListener("click", onClick);
}

export function modifyDropupDownloadLinks() {
    /** Works on the links that start with "https://animepahe.pw/play/*" only */

    const dropdownNodes : NodeListOf<Element>= document.querySelectorAll("#pickDownload a");

    if (!dropdownNodes) return [];

    const elems : HTMLAnchorElement[] = Array.from(dropdownNodes) as HTMLAnchorElement[];

    elems.map((elem) => {downloadLinkElementListener(elem);});

    return elems;
}
