import { progressContainer } from "../../components/progressContainer";
const downloadElements = new Map<string, HTMLAnchorElement>();
export function downloadLinkElementListener(element : HTMLAnchorElement) {
    const downloadKey = crypto.randomUUID();
    element.dataset.downloadKey = downloadKey;
    downloadElements.set(downloadKey, element);
    
    const listener = (e: Event) => {
        e.preventDefault();
        element?.querySelector(".progress-container")?.remove();

        chrome.runtime.sendMessage({
            type: "LAUNCH_TAB",
            url : element.href,
            downloadKey
        });


    };

    chrome.runtime.onMessage.addListener((message) => {
        if (message.type !== "DOWNLOAD_ID_FOUND" || message.downloadKey !== downloadKey) return
        const element = downloadElements.get(message.downloadKey);
            if (!element) {
                console.warn(
                    "Download element not found:",
                    message.downloadKey
                );
                return;
            }
        element.querySelector(".progress-container")?.remove();
        element.append(progressContainer(message.downloadID))
    })


    element.addEventListener("click", listener);
}

export function modifyDropupDownloadLinks() {
    /** Works on the links that start with "https://animepahe.pw/play/*" only */

    const dropdownNodes : NodeListOf<Element>= document.querySelectorAll("#pickDownload a");

    if (!dropdownNodes) return [];

    const elems : HTMLAnchorElement[] = Array.from(dropdownNodes) as HTMLAnchorElement[];

    elems.map((elem) => {
        downloadLinkElementListener(elem);        
    });

    return elems;
}
