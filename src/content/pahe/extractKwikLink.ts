import { waitForElements } from "../../utils/domWait";

export async function selectKwikLink() {
    const scripts: NodeListOf<HTMLScriptElement> =
    await waitForElements("script") as NodeListOf<HTMLScriptElement> ;

    const regex = /https:\/\/kwik\.cx\/[^'")\s]+/;

    for (const script of scripts) {
        const match = regex.exec(script.textContent);
        if (match) {
            return match[0]
        }
    }

    return null;
}
