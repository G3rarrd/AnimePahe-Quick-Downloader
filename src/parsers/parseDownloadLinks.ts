
export function parseDownloadLinks (doc : Document): HTMLAnchorElement[] {
    const downloadLinks = doc.querySelectorAll("#pickDownload a");
    return Array.from(downloadLinks).map(link => 
        link.cloneNode(true) as HTMLAnchorElement
    );
}

export function parsePaheLink (doc : Document) : string {
    const regex = /https:\/\/kwik\.cx\/[^'")\s]+/;
    const scripts = doc.querySelectorAll("script")
    for (const script of scripts) {
        const match = regex.exec(script.textContent);
        if (match) {
            return match[0]
        }
    }
    return ""
}