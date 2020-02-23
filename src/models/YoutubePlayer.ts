import * as ytdl from "ytdl-core";
import { YoutubeSong } from "./YoutubeSong";

export class YoutubePlayer {
    volume: number;
    queue: YoutubeSong[];
    choices: Object;
    stream: any;

    constructor() {
        this.volume = 0.3;
        this.queue = [];
        this.choices = {};
        this.stream = null;
    }

    async addMusicUrl(url: string): Promise<Boolean> {
        // check if the url is valid
        if (!(await ytdl.validateURL(url))) {
            return false;
        }

        // gets the informations and stores them
        const songInfo = await ytdl.getInfo(url);
        const song: YoutubeSong = new YoutubeSong(
            songInfo.title,
            songInfo.video_url,
            null
        );

        // add to the queue
        this.queue.push(song);
        return true;
    }

    getNextSong(): YoutubeSong {
        if (this.queue.length > 0) {
            return this.queue.shift();
        }

        return null;
    }

    cleanQueue() {
        this.queue = [];
    }

    setVolume(volume: number): boolean {
        if (volume && volume > 0 && volume <= 1) {
            this.volume = volume;
            return true;
        }

        return false;
    }

    async putSongListToQueue(songList: YoutubeSong[]) {
        for (let song of songList) {
            // gets the youtube url from the video id
            const songInfo = await ytdl.getInfo(song.videoId);
            song.url = songInfo.video_url;

            this.queue.push(song);
        }
    }

    async addSongToQueue(song: YoutubeSong) {
        this.queue.push(song);
    }

    async loadSongInfosAndAddToQueue(song: YoutubeSong) {
        const songInfo = await ytdl.getInfo(song.videoId);
        song.url = songInfo.video_url;

        this.queue.push(song);
    }
}
