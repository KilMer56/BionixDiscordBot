export class YoutubeSong {
    url: string;
    title: string;
    videoId: string;

    constructor(url: string, title: string, videoId: string) {
        this.url = url;
        this.title = title;
        this.videoId = videoId;
    }
}
