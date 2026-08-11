import type { DownloadProgress } from "./downloadProgress";

export interface LaunchTabMessage {
    type: "LAUNCH_TAB";
    url: string;
}

export interface UpdateTabMessage {
    type: "UPDATE_TAB";
    url: string;
}

export interface DownloadAnimeMessage {
    type: "DOWNLOAD_ANIME";
}

export interface MonitorDownloadMessage {
    type : "DOWNLOAD_Progress";
    payload : DownloadProgress
}



export type ExtensionMessage =
    | LaunchTabMessage
    | UpdateTabMessage
    | DownloadAnimeMessage;