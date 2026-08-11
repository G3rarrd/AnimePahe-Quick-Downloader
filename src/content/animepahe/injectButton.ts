import { fetchDownloadOptionButtons } from "../../components/fetchDownloadButton";

export function injectButtons(episodeSelector : string) {
    const episodeList : Element | null = document.querySelector(episodeSelector);

    if (!episodeList) return;

    const episodes = Array.from(episodeList.children);

    episodes.forEach((episode) => {
        if (episode.querySelector(".download-button")) {
            return;
        }
        const wrapper = document.createElement("div");
        wrapper.className = "episode-download-actions";
        
        const linkElement : HTMLAnchorElement | null= 
        episode.querySelector(".episode .episode-snapshot a") as HTMLAnchorElement | null;

        if (! linkElement) {
            console.warn ("Episode link cannot be found");
            return;
        }

        const url : string = linkElement.href;
        
        wrapper.append(...fetchDownloadOptionButtons(url));

        episode.appendChild(wrapper);
    });
}