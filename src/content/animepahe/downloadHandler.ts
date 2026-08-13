import { progressContainer } from "../../components/progressContainer";
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
    
    const onClick = (e: Event) => {
        e.preventDefault()
        downloadElements.set(downloadKey, element)
        element.querySelector(".progress-container")?.remove();
        // element.append(progressContainer());
        
        // Message Handler: src\background\background.ts
        chrome.runtime.sendMessage({
            type: "LAUNCH_TAB",
            url: element.href,
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
