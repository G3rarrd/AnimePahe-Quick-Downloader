export async function injectScript(tabId : number, file : string) : Promise<chrome.scripting.InjectionResult<unknown>[]> {
    const absolutePath = file.startsWith('/') ? file : `/${file}`;
    return chrome.scripting.executeScript({
        target: {tabId},
        files : [absolutePath],
    })
}