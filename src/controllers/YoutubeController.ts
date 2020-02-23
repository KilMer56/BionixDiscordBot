import * as Discord from "discord.js";
import { ChannelController } from "./ChannelController";
import { YoutubeApi } from "../utils/YoutubeApi";
import DiscordUtils from "../utils/DiscordUtils";
import { YoutubePlayer } from "../models/YoutubePlayer";
import { YoutubeSong } from "../models/YoutubeSong";
import { Readable } from "stream";

import ytdl from "ytdl-core";

export class YoutubeController {
    channelController: ChannelController;
    youtubeApi: YoutubeApi;
    youtubePlayer: YoutubePlayer;
    dispatcher: any;

    constructor(channelController: ChannelController) {
        this.channelController = channelController;
        this.youtubeApi = new YoutubeApi();
        this.youtubePlayer = new YoutubePlayer();
        this.dispatcher = null;
    }

    async runCommand(message: Discord.Message, args: string[]) {
        if (!message.guild) {
            DiscordUtils.displayText(message, "No channel guild available !");
            return;
        } else if (!this.channelController.session.connection) {
            DiscordUtils.displayText(message, "No current connection");
            return;
        } else {
            try {
                switch (args[0]) {
                    case "url":
                        this.loadUrl(message, args);
                        break;
                    case "skip":
                        this.skip(message);
                        break;
                    case "stop":
                        this.stop(message);
                        break;
                    case "volume":
                        this.setVolume(message, args);
                        break;
                    case "search":
                        this.searchVideo(message);
                        break;
                    case "select":
                        this.select(message, args);
                        break;
                    case "pause":
                        this.pause(message);
                        break;
                    case "resume":
                        this.resume(message);
                        break;
                    case "getPlaylist":
                        this.getPlaylist(message);
                        break;
                    case "loadPlaylist":
                        this.loadPlaylist(message);
                        break;
                    default:
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    /**
     * Load the youtube informations from an url
     * @param {Message} message
     * @param {string[]} args
     */
    async loadUrl(message: Discord.Message, args: string[]) {
        if (
            args.length > 1 &&
            this.channelController.session &&
            this.channelController.session.connection != null
        ) {
            const url = args[1];

            if (!(await ytdl.validateURL(url))) {
                DiscordUtils.displayText(message, "The song couldn't be added");
            }

            // gets the informations and stores them
            const songInfo = await ytdl.getInfo(url);
            const song: YoutubeSong = new YoutubeSong(
                songInfo.video_url,
                songInfo.title,
                null
            );

            await this.youtubePlayer.addSongToQueue(song);

            if (this.dispatcher) {
                DiscordUtils.displayText(message, "Song added to the queue");
            } else {
                this.play(message);
            }
        } else {
            DiscordUtils.displayText(message, "You need to put an url !");
        }
    }

    /**
     * Play method that load the queue and start the next song
     * @param {Message} message
     */
    async play(message: Discord.Message) {
        const song: YoutubeSong = this.youtubePlayer.getNextSong();

        if (song) {
            const stream: Readable = ytdl(song.url, {
                filter: "audioonly",
                quality: "highestaudio"
            });

            // starts the song
            this.dispatcher = this.channelController.session.connection
                .playStream(stream)
                .on("end", async () => {
                    await this.delay(3000);

                    console.log("Music ended!");
                    this.play(message);
                })
                .on("warn", (error: any) => {
                    console.error(error);
                })
                .on("error", (error: any) => {
                    console.error(error);
                });

            // adjust the volume
            this.dispatcher.setVolume(this.youtubePlayer.volume);

            DiscordUtils.displayText(message, `Now playing: ${song.title}`);
        } else {
            this.dispatcher = null;
        }
    }

    /**
     * Skip the current song
     * @param {Message} message
     */
    skip(message: Discord.Message) {
        if (this.dispatcher) {
            DiscordUtils.displayText(message, `Music skipped`);
            this.dispatcher.end();
        }
    }

    /**
     * Clean the queue and stop the dispatcher
     * @param {Message} message
     */
    stop(message: Discord.Message) {
        if (this.dispatcher) {
            DiscordUtils.displayText(message, `Music stopped`);

            this.youtubePlayer.cleanQueue();
            this.dispatcher.end();
        }
    }

    /**
     * Put on 'pause' by reducing the volume to 0
     * @param {Message} message
     */
    pause(message: Discord.Message) {
        if (this.dispatcher) {
            this.dispatcher.setVolume(0);
            DiscordUtils.displayText(message, `Music paused`);
        }
    }

    /**
     * Resume the song by putting the volume to it's original value
     * @param {Message} message
     */
    resume(message: Discord.Message) {
        if (this.dispatcher) {
            this.dispatcher.setVolume(this.youtubePlayer.volume);
            DiscordUtils.displayText(message, `Music resumed`);
        }
    }

    /**
     * Sets the volume of the song and stores it
     * @param {Message} message
     */
    setVolume(message: Discord.Message, args: string[]) {
        if (this.dispatcher) {
            // get the volume value
            const volume: number =
                args.length == 2 ? parseFloat(args[1]) : null;

            const volumeChanged = this.youtubePlayer.setVolume(volume);

            if (volumeChanged) {
                this.dispatcher.setVolume(volume);

                DiscordUtils.displayText(
                    message,
                    `Setting the volume  to ${volume}`
                );
            } else {
                DiscordUtils.displayText(message, `The volume is not correct`);
            }
        }
    }

    /**
     * Calls the Youtube Api to find a video from a title
     * @param {Message} message
     */
    searchVideo(message: Discord.Message) {
        if (this.channelController.session.inChannel) {
            const contentArray = message.content.match(/'([^']+)'/);

            if (contentArray != null && contentArray.length > 0) {
                const title = contentArray[1];

                if (title && title.length > 3) {
                    this.youtubeApi.getVideosFromTitle(message, title);
                } else {
                    DiscordUtils.displayText(
                        message,
                        `The title is not correct`
                    );
                }
            } else {
                DiscordUtils.displayText(
                    message,
                    "You need to respect the following structure : 'title'"
                );
            }
        }
    }

    /**
     * Gets a list of song from a playlist id by calling the Youtube Api
     * @param {Message} message
     */
    getPlaylist(message: Discord.Message) {
        if (this.channelController.session.inChannel) {
            const contentArray = message.content.match(/'([^']+)'/);

            if (contentArray != null && contentArray.length > 0) {
                const playlistId = message.content.match(/'([^']+)'/)[1];

                if (playlistId && playlistId.length > 3) {
                    this.youtubeApi.getVideosFromPlaylist(message, playlistId);
                } else {
                    DiscordUtils.displayText(
                        message,
                        `The playlistId is not correct`
                    );
                }
            } else {
                DiscordUtils.displayText(
                    message,
                    "You need to respect the following structure : 'playlistId'"
                );
            }
        }
    }

    /**
     * Loads the playlist by findind the urls and putting the informations into the queue
     * @param {Message} message
     */
    async loadPlaylist(message: Discord.Message) {
        if (this.channelController.session.inChannel) {
            const results = this.youtubeApi.result;

            if (results && results.length > 0) {
                await this.youtubePlayer.putSongListToQueue(results);

                DiscordUtils.displayText(
                    message,
                    `Playlist added to the queue`
                );

                // if nothing is currently played, starts a new song
                if (!this.dispatcher) this.play(message);
            } else {
                DiscordUtils.displayText(message, `No playlist loaded`);
            }
        }
    }

    /**
     * Selects a song from a list loaded previously by the Youtube APi
     * Then finds the url and adds the video to queue
     * @param {Message} message
     */
    async select(message: Discord.Message, args: string[]) {
        if (this.channelController.session.inChannel) {
            const key: number = args.length == 2 ? parseInt(args[1]) : null;

            if (key != null) {
                // gets the selected video and it's url
                const song: YoutubeSong = this.youtubeApi.result[key];
                await this.youtubePlayer.loadSongInfosAndAddToQueue(song);

                // if nothing is currently played, starts a new song
                if (!this.dispatcher) {
                    this.play(message);
                } else {
                    DiscordUtils.displayText(
                        message,
                        `${song.title} added to the queue`
                    );
                }
            } else {
                DiscordUtils.displayText(message, `The title is not correct`);
            }
        }
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
