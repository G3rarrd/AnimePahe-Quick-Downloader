
import { chevronDownIcon, chevronUpIcon } from "../icons/chevrons";
import { loaderIcon } from "../icons/loader";
import { refreshIcon } from "../icons/refresh";
import { getCachedLinks, setCachedLinks } from "../services/cache";
import { fetchDownloadlinks } from "../services/fetchDownloadLinks";
import { fetchRateLimiter } from "../services/rateLimiter";
import type { CacheEntry } from "../types/storage";
import { downloadLink } from "./downloadLinks";



export function fetchDownloadOptionButtons (url : string): (HTMLDivElement | HTMLButtonElement)[] {
    let open = false;
    let loaded = false;
    const timeHr : number = 1.5;

    const button : HTMLButtonElement = document.createElement("button");
    button.classList.add("download-button");

    const dropdown : HTMLDivElement = document.createElement("div");
    dropdown.classList.add("download-dropdown");

    button.innerHTML = `<span>View Downloads ${chevronDownIcon}</span>`;
    let loadingPromise : Promise<boolean> |null = null;

    async function load() : Promise<boolean> {
        if (loaded) return true;

        if (loadingPromise) return loadingPromise;

        loadingPromise = (async () => {
            try {
                const entry : CacheEntry | undefined = await getCachedLinks(url);
                if (entry) {
                    if (entry.expires > Date.now()) {
                        // The elements were cached as strings
                        const linkTags : HTMLAnchorElement[] = entry.linkHTMLs.map(html => {
                            const div = document.createElement("div");
                            div.innerHTML = html;
                            return div.firstElementChild as HTMLAnchorElement;
                        });

                        dropdown.append(...linkTags.map(tag => downloadLink(tag)));
                        loaded = true;
                        return true;
                    }
                }
                
                button.innerHTML = `<span>Loading ${loaderIcon}</span>`;

                // So users won't bombard the servers and get their IPs banned accidentally
                if (!fetchRateLimiter.allow()) {
                    button.innerHTML = `<span>Please wait a moment ${refreshIcon}</span>`;
                    return false;
                }

                const linkTags: HTMLAnchorElement[] = await fetchDownloadlinks(url);
                
                await setCachedLinks(url, linkTags, timeHr);

                dropdown.append(...linkTags.map((linkTag) => downloadLink(linkTag)));

                loaded = true;
                return true;

            } catch (err) {
                console.error("Failed to fetch page: ", err);
                button.innerHTML = `<span>Retry ${refreshIcon}</span>`;
                return false;

            }finally {
                loadingPromise = null;
            }
        })();

        return loadingPromise;
    }

    async function toggle() {
        if (!loaded) {
            const success : boolean = await load();

            if (!success) {
                return;
            }
        }

        open = !open;

        dropdown.classList.toggle("open", open);

        button.innerHTML = open
            ? `<span>Hide Downloads ${chevronUpIcon}</span>`
            : `<span>View Downloads ${chevronDownIcon}</span>`;
    }


    button.addEventListener("click", toggle);

    return [button, dropdown];
}