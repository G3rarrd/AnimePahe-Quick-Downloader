import { waitForElement } from "../../utils/domWait";


async function init() {
    const selector : string = ".button.is-uppercase.is-success.is-fullwidth";
    const downloadBtn = await waitForElement(selector) as HTMLButtonElement | null;
    
    if (!downloadBtn) return;
    
    downloadBtn.click();

    const response = await chrome.runtime.sendMessage({
        type : "DOWNLOAD_ANIME"
    })
}


init();