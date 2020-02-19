import { AudioController } from "./AudioController";
import { YoutubeApi } from "../utils/youtubeApi";
import DiscordUtils from '../utils/discordUtils';
import * as Discord from "discord.js";

// Get the utils functions
const Utils = require('../utils/discordUtils.js');

// Get the youtube downloader package
const ytdl = require('ytdl-core');

/**
 * Youtube class that handles all the different commands
 */
export class YoutubeController {
    audioController: AudioController;
    youtubeApi: YoutubeApi
    volume: number;
    queue: Object[];
    choices: Object;
    dispatcher: any;
    stream: any;

    constructor(audioController: AudioController, youtubeApi: YoutubeApi) {
        this.audioController = audioController;
        this.youtubeApi = youtubeApi;
        this.volume = 0.3;
        this.queue = [];
        this.choices = {};
        this.dispatcher = null;
        this.stream = null;
    }

    /**
     * Add a youtube video from an url
     * @param {Message} message 
     */
    async add(message: Discord.Message) {
        if (this.audioController.inChannel) {
            const args = DiscordUtils.getArgs(message);

            if (args.length > 1 && this.audioController.connection != null) {
                const url = args[1];

                // check if the url is valid 
                if (!await ytdl.validateURL(url)) {
                    DiscordUtils.displayText(message, `The url isn't correct`);
                    return;
                }

                // gets the informations and stores them
                const songInfo = await ytdl.getInfo(url);
                const song = {
                    title: songInfo.title,
                    url: songInfo.video_url,
                };

                // add to the queue
                this.queue.push(song);

                if (!this.dispatcher) {
                    this.play(message);
                }
                else {
                    DiscordUtils.displayText(message, `${song.title} added to the queue`);
                }
            }
        }
        else {
            DiscordUtils.displayText(message, `Bot not in a channel !`);
        }
    }

    /**
     * Play method that load the queue and start the next song
     * @param {Message} message 
     */
    play(message: Discord.Message) {
        if (this.queue.length > 0) {
            const song: any = this.queue.shift();

            // start the song
            this.dispatcher = this.audioController.connection.playStream(
                ytdl(song.url, {
                    filter: 'audioonly',
                    quality: 'highestaudio'
                }))
                .on('end', () => {
                    console.log('Music ended!');
                    this.play(message);
                })
                .on('error', (error: any) => {
                    console.error(error);
                });

            // adjust the volume
            this.dispatcher.setVolume(this.volume);

            DiscordUtils.displayText(message, `Now playing: ${song.title}`);
        }
        else {
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

            this.queue = [];
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
            this.dispatcher.setVolume(this.volume);
            DiscordUtils.displayText(message, `Music resumed`);
        }
    }

    /**
     * Sets the volume of the song and stores it
     * @param {Message} message 
     */
    setVolume(message: Discord.Message) {
        if (this.dispatcher) {
            // get the volume value
            const args = DiscordUtils.getArgs(message);
            const volume = args.length == 2 ? parseFloat(args[1]) : null;

            // check if it's between 0 and 1
            if (volume && volume > 0 && volume <= 1) {
                this.volume = volume;
                this.dispatcher.setVolume(volume);

                DiscordUtils.displayText(message, `Setting the volume  to ${volume}`);
            }
            else {
                DiscordUtils.displayText(message, `The volume is not correct`);
            }
        }
    }

    /**
     * Calls the Youtube Api to find a video from a title
     * @param {Message} message 
     */
    searchVideo(message: Discord.Message) {
        if (this.audioController.inChannel) {
            const title = message.content.match(/'([^']+)'/)[1];

            if (title && title.length > 3) {
                this.youtubeApi.getVideosFromTitle(message, title);
            }
            else {
                DiscordUtils.displayText(message, `The title is not correct`);
            }
        }
    }

    /**
     * Gets a list of song from a playlist id by calling the Youtube Api 
     * @param {Message} message 
     */
    getPlaylist(message: Discord.Message) {
        if (this.audioController.inChannel) {
            const playlistId = message.content.match(/'([^']+)'/)[1];

            if (playlistId && playlistId.length > 3) {
                this.youtubeApi.getVideosFromPlaylist(message, playlistId);
            }
            else {
                DiscordUtils.displayText(message, `The playlistId is not correct`);
            }
        }
    }

    /**
     * Loads the playlist by findind the urls and putting the informations into the queue
     * @param {Message} message 
     */
    async loadPlaylist(message: Discord.Message) {
        if (this.audioController.inChannel) {
            const results = this.youtubeApi.result;

            if (results && results.length > 0) {
                for (let video of results) {
                    // gets the youtube url from the video id
                    const songInfo = await ytdl.getInfo(video.videoId);
                    const song = {
                        title: songInfo.title,
                        url: songInfo.video_url,
                    };

                    this.queue.push(song);
                }

                DiscordUtils.displayText(message, `Playlist added to the queue`);

                // if nothing is currently played, starts a new song
                if (!this.dispatcher) this.play(message);
            }
            else {
                DiscordUtils.displayText(message, `No playlist loaded`);
            }
        }
    }

    /**
     * Selects a song from a list loaded previously by the Youtube APi
     * Then finds the url and adds the video to queue
     * @param {Message} message 
     */
    async select(message: Discord.Message) {
        if (this.audioController.inChannel) {
            const args = DiscordUtils.getArgs(message);
            const key = args.length == 2 ? args[1] : null;

            if (key) {
                // gets the selected video and it's url
                const video = this.youtubeApi.result[key];
                const songInfo = await ytdl.getInfo(video.videoId);
                const song = {
                    title: songInfo.title,
                    url: songInfo.video_url,
                };

                // adds it to the que
                this.queue.push(song);

                // if nothing is currently played, starts a new song
                if (!this.dispatcher) {
                    this.play(message);
                }
                else {
                    DiscordUtils.displayText(message, `${song.title} added to the queue`);
                }
            }
            else {
                DiscordUtils.displayText(message, `The title is not correct`);
            }
        }
    }
}

module.exports = YoutubeController