import { progressContainer } from "../../components/progressContainer";

export function downloadLinkElementListener(element : HTMLAnchorElement) {
    const listener = (e: Event) => {
        e.preventDefault();

        element?.querySelector(".progress-container")?.remove();
        element.append(progressContainer());

        chrome.runtime.sendMessage({
            type: "LAUNCH_TAB",
            url: element.href,
        });
    };

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
