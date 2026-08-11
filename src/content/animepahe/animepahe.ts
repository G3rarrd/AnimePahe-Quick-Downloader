import { observeEpisodeList } from "../../observers/episodeListObserver";
import { cleanExpiredCache } from "../../services/cache";
import { modifyDropupDownloadLinks } from "./downloadHandler";
import { injectButtons } from "./injectButton";

async function init() {
    await cleanExpiredCache();

    const episodeSelector : string =  ".episode-list.row";

    injectButtons(episodeSelector);

    observeEpisodeList(episodeSelector);

    modifyDropupDownloadLinks();
}

init();
