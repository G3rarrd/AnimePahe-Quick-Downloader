
export function parseDownloadLinks (doc : Document): HTMLAnchorElement[] {
    const downloadLinks = doc.querySelectorAll("#pickDownload a");
    return Array.from(downloadLinks).map(link => 
        link.cloneNode(true) as HTMLAnchorElement
    );
}