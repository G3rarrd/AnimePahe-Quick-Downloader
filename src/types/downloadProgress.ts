export interface DownloadProgress {
    downloadId: number;
    percent: number;
    bytesReceived: number;
    totalBytes: number;
    downloadState: string;
   error: string | undefined;
}