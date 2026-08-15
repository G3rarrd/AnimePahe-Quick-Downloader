import { progressContainer } from "../../components/progressContainer";
import { fetchKwikLink } from "../../services/fetchDownloadLinks";

const downloadElements = new Map<string, HTMLAnchorElement>();

export function downloadLinkElementListener(element: HTMLAnchorElement) {
    const downloadKey = crypto.randomUUID();
    
    const onDownloadIdFound = (message: any) => {
        // Message Source: src\background\background.ts
        if (message.type !== "DOWNLOAD_ID_FOUND") return

        const progressRingElement = downloadElements.get(message.downloadKey)

        if (!progressRingElement) return

        progressRingElement.querySelector(".progress-container")?.remove();

        progressRingElement.append(progressContainer(message.downloadId));
    };
    
    chrome.runtime.onMessage.addListener(onDownloadIdFound);
    
    const onClick = async  (e: Event) => {
        e.preventDefault()
        downloadElements.set(downloadKey, element)

        console.log(`Fetching ${element.href}...`)
        const link = await fetchKwikLink(element.href)
        console.log(`URL Found: ${link}. Launching Tab`)

        // Message Handler: src\background\background.ts
        chrome.runtime.sendMessage({
            type: "LAUNCH_TAB",
            url: link,
            downloadKey,
        });
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
