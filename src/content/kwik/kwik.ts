import { waitForElement } from "../../utils/domWait";


async function init() {
    const selector : string = ".button.is-uppercase.is-success.is-fullwidth";
    const downloadBtn = await waitForElement(selector) as HTMLButtonElement | null;
    
    if (!downloadBtn) return;
    
    const response = await chrome.runtime.sendMessage({
        type : "DOWNLOAD_ANIME"
    })

    downloadBtn.click();
}


init();