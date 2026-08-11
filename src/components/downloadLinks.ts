import { downloadLinkElementListener } from "../content/animepahe/downloadHandler";

export function downloadLink(linkTag : HTMLAnchorElement) : HTMLAnchorElement{

    linkTag.className = "download-link";
    
    downloadLinkElementListener(linkTag);

    return linkTag;
}