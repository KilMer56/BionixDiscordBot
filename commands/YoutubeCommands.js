const ytdl = require('ytdl-core');

class YoutubeCommands {
    constructor(audioCommands) {
        this.audioCommands = audioCommands;
        this.state = {};
        this.queue = new Map();
    }

    async runYoutubeVideo(message) {
        console.log('runYoutubeVideo');
        if (this.audioCommands.inChannel) {
            const args = message.content.trim().split(' ').slice(1);

            if (args.length > 0 && this.audioCommands.connection != null) {
                const url = args.shift();

                console.log(url);

                const songInfo = await ytdl.getInfo(url);
                const song = {
                    title: songInfo.title,
                    url: songInfo.video_url,
                };

                console.log(song);

                const dispatcher = this.audioCommands.connection.playStream(ytdl(song.url))
                    .on('end', () => {
                        console.log('Music ended!');
                    })
                    .on('error', error => {
                        console.error(error);
                    });

                message.channel.send(`Now playing: ${song.tile}`);
            }
        }
        else {
            message.channel.send(`Bot not in a channel !`);
        }

        // if()
        // if (this.connection != null) {
        //     const serverQueue = queue.get(message.guild.id);
        // }
        // const args = message.content.trim().split(' ').slice(1);

        // if (args.length > 1 && this.connection != null) {
        //     const url = args[1];

        //     let infos = await ytdl.getInfo(url);
        //     let dispatcher = await this.connection.play(ytdl(url, { filter: 'audioonly' }));

        //     message.channel.send(`Now playing: ${infos.tile}`);
        // }
    }

    print() {
        //console.log("Audio Commands : \n inChannel : " + this.inChannel + "\n state : " + this.state);
    }
}

module.exports = YoutubeCommands