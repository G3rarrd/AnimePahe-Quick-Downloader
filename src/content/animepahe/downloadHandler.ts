import { progressContainer } from "../../components/progressContainer";
const downloadElements = new Map<string, HTMLAnchorElement>();
export function downloadLinkElementListener(element: HTMLAnchorElement) {
    const downloadKey = crypto.randomUUID();
    
    const onDownloadIdFound = (message: any) => {
        if (message.type !== "DOWNLOAD_ID_FOUND") return

        const progressElement = downloadElements.get(message.downloadKey)

        if (!progressElement) return

        progressElement.querySelector(".progress-container")?.remove();

        progressElement.append(progressContainer(message.downloadId));
    };
    
    chrome.runtime.onMessage.addListener(onDownloadIdFound);
    
    const onClick = (e: Event) => {
        e.preventDefault()
        downloadElements.set(downloadKey, element)
        element.querySelector(".progress-container")?.remove();
        // element.append(progressContainer());
        
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
