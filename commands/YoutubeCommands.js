
// Get the utils functions
const Utils = require('../utils/discordUtils.js');

// Get the youtube downloader package
const ytdl = require('ytdl-core');

class YoutubeCommands {
    constructor(audioCommands) {
        this.audioCommands = audioCommands;
        this.state = {};
        this.queue = [];
        this.dispatcher = null;
    }

    async add(message) {
        if (this.audioCommands.inChannel) {
            const args = Utils.getArgs(message);

            if (args.length > 1 && this.audioCommands.connection != null) {
                const url = args[1];

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
                    tils.displayText(message, `${song.title} added to the queue`);
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

            this.dispatcher = this.audioCommands.connection.playStream(ytdl(song.url, { filter: 'audioonly' }))
                .on('end', () => {
                    console.log('Music ended!');
                    this.play(message);
                })
                .on('error', error => {
                    console.error(error);
                });

            this.dispatcher.setVolume(0.5);

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
                this.dispatcher.setVolume(volume);

                Utils.displayText(message, `Setting the volume  to ${volume}`);
            }
            else {
                Utils.displayText(message, `The volume is not correct`);
            }
        }
    }

    print() {
        //console.log("Audio Commands : \n inChannel : " + this.inChannel + "\n state : " + this.state);
    }
}

module.exports = YoutubeCommands