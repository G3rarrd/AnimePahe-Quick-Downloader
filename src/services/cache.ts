import type { CacheEntry } from "../types/storage";

// Retrieve data from local storage
export async function getCachedLinks(url: string): Promise<CacheEntry | undefined> {
    const result = await chrome.storage.local.get(url);
    return result[url] as CacheEntry | undefined;
}

// Store to local storage for limited persistent storage
export async function setCachedLinks(
    url : string, linkTags : HTMLAnchorElement[], expireTime : number) : Promise<void>{
    
        const linkElems : string[] = linkTags.map(tag => tag.outerHTML);

        await chrome.storage.local.set({[url] : {
                        linkHTMLs : linkElems,
                        expires: Date.now() + 1000 * 60 * 60 * expireTime 
                    }})
}

// Frees up storage on every load if link has expired
export async function cleanExpiredCache () : Promise<void>{
    const items = await chrome.storage.local.get(null);
    const expiredKeys: string[] = [];

    for (const [key, value] of Object.entries(items)) {
        const entry = value as CacheEntry;

        if (entry && 
            typeof entry === "object" && 
            typeof entry.expires === "number" && 
            entry.expires <= Date.now()) {
                expiredKeys.push(key);
        }
    }

    if (expiredKeys.length > 0) {
        await chrome.storage.local.remove(expiredKeys);
    }
}