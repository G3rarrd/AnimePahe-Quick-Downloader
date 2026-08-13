

type TabState = {
    sourceTabId: number;
    downloadId?: number;
    downloadKey : string;
};

export const tabsState = new Map<number, TabState>();