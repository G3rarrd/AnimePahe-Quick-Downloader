import { parseDownloadLinks, parsePaheLink } from "../parsers/parseDownloadLinks";

async function getHtml(url : string) : Promise<Document> {
        const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`${response.status}`);
    }

    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc
}

export async function fetchDownloadlinks(url : string) : Promise<HTMLAnchorElement[]> {
    const html = await getHtml(url)
    return parseDownloadLinks(html);
}

export async function fetchKwikLink(url :string) : Promise<string>{
    const html = await getHtml(url);
    return parsePaheLink(html);
}