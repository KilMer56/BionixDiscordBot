
// Get the utils functions
const Utils = require('../utils/discordUtils.js');

// Get the youtube downloader package
const ytdl = require('ytdl-core');

class YoutubeCommands {
    constructor(audioCommands, apiUtils) {
        this.audioCommands = audioCommands;
        this.apiUtils = apiUtils;
        this.volume = 0.3;
        this.queue = [];
        this.choices = {};
        this.dispatcher = null;
        this.stream = null;
    }

    async add(message) {
        if (this.audioCommands.inChannel) {
            const args = Utils.getArgs(message);

            if (args.length > 1 && this.audioCommands.connection != null) {
                const url = args[1];

                if (!await ytdl.validateURL(url)) {
                    Utils.displayText(message, `The url isn't correct`);
                    return;
                }

                const songInfo = await ytdl.getInfo(url);
                const song = {
                    title: songInfo.title,
                    url: songInfo.video_url,
                };

                this.queue.push(song);

                if (!this.dispatcher) {
                    this.play(message);
                }
                else {
                    Utils.displayText(message, `${song.title} added to the queue`);
                }
            }
        }
        else {
            Utils.displayText(message, `Bot not in a channel !`);
        }
    }

    play(message) {
        if (this.queue.length > 0) {
            const song = this.queue.shift();

            this.dispatcher = this.audioCommands.connection.playStream(
                ytdl(song.url, {
                    filter: 'audioonly',
                    quality: 'highestaudio'
                }))
                .on('end', () => {
                    console.log('Music ended!');
                    this.play(message);
                })
                .on('error', error => {
                    console.error(error);
                });

            this.dispatcher.setVolume(this.volume);

            Utils.displayText(message, `Now playing: ${song.title}`);
        }
        else {
            this.dispatcher = null;
        }
    }

    skip(message) {
        if (this.dispatcher) {
            Utils.displayText(message, `Music skipped`);
            this.dispatcher.end();
        }
    }

    stop(message) {
        if (this.dispatcher) {
            Utils.displayText(message, `Music stopped`);

            this.queue = [];
            this.dispatcher.end();
        }
    }

    setVolume(message) {
        if (this.dispatcher) {
            const args = Utils.getArgs(message);
            const volume = args.length == 2 ? parseFloat(args[1]) : null;

            if (volume && volume > 0 && volume <= 1) {
                this.volume = volume;
                this.dispatcher.setVolume(volume);

                Utils.displayText(message, `Setting the volume  to ${volume}`);
            }
            else {
                Utils.displayText(message, `The volume is not correct`);
            }
        }
    }

    searchVideo(message) {
        if (this.audioCommands.inChannel) {
            const title = message.content.match(/'([^']+)'/)[1];

            if (title && title.length > 3) {
                this.apiUtils.getVideosFromTitle(message, title);
            }
            else {
                Utils.displayText(message, `The title is not correct`);
            }
        }
    }

    async select(message) {
        if (this.audioCommands.inChannel) {
            const args = Utils.getArgs(message);
            const key = args.length == 2 ? args[1] : null;

            if (key) {
                const video = this.apiUtils.result[key];
                const songInfo = await ytdl.getInfo(video.videoId);
                const song = {
                    title: songInfo.title,
                    url: songInfo.video_url,
                };

                this.queue.push(song);

                if (!this.dispatcher) {
                    this.play(message);
                }
                else {
                    tils.displayText(message, `${song.title} added to the queue`);
                }
            }
            else {
                Utils.displayText(message, `The title is not correct`);
            }
        }
    }

    pause(message) {
        if (this.dispatcher) {
            this.dispatcher.setVolume(0);
            Utils.displayText(message, `Music paused`);
        }
    }

    resume(message) {
        if (this.dispatcher) {
            this.dispatcher.setVolume(this.volume);
            Utils.displayText(message, `Music resumed`);
        }
    }
}

module.exports = YoutubeCommands