

type TabState = {
    sourceTabId: number;
    downloadId?: number;
    downloadKey : string;
    waitingForDownload: boolean;
};

export const tabsState = new Map<number, TabState>();