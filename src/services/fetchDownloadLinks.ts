import { parseDownloadLinks } from "../parsers/parseDownloadLinks";

export async function fetchDownloadlinks(url : string) : Promise<HTMLAnchorElement[]> {
    
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`${response.status}`);
    }

    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    return parseDownloadLinks(doc);
}