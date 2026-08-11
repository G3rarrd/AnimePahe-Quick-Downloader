export function injectScript(tabId : number, file : string) {
    const absolutePath = file.startsWith('/') ? file : `/${file}`;
    return chrome.scripting.executeScript({
        target: {tabId},
        files : [absolutePath],
    })
}