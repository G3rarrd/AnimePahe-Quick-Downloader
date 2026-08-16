export type TabState = {
    sourceTabId: number;
    downloadId?: number;
    downloadKey : string;
    waitingForDownload: boolean;
};