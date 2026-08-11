import { injectButtons } from "../content/animepahe/injectButton";

export function observeEpisodeList(episodeSelector : string) {
    /** Deals with the pagination quirks (SPA) of the website by 
     * constantly observing the episode wrapper of the site
     *  for episode dom changes **/

    const observer = new MutationObserver(() => {
        injectButtons(episodeSelector);
    })

    const wrapper = document.querySelector(".episode-list-wrapper");

    if (! wrapper) {
        return;
    }

    // Observe only this section of the site
    observer.observe(wrapper, {
        childList : true,
        subtree : true,
    })
} 