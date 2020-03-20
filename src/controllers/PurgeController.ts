import { Message, DiscordAPIError } from 'discord.js';
import DiscordUtils from '../utils/DiscordUtils';

export class PurgeController {
    private purgeSize: number;

    constructor() {}

    runCommand(message: Message, args: string[]) {
        
        const hasPermission = message.member.roles.find(r => r.hasPermission("MANAGE_MESSAGES"))
        
        if(!hasPermission) {
            DiscordUtils.displayText(message, "You don't have the required permission to do this");
            return;
        }
        if(!!args[0]){
            if(!Number(args[0])) {
                DiscordUtils.displayText(message, `You didn't give me a proper number (${args[0]})`);
                return;
            }
            this.purgeSize = +args[0];
            this.purge(message);
        }
        else{
            const filter = m => message.author.id === m.author.id;
            //Keep a reference to the extra message, to delete it before the purge
            const a = <Promise<Message>>message.channel.send(`How many message should be deleted`);
            message.channel.awaitMessages(filter, {time: 30000, maxMatches: 1, errors: ['time']})
            .then(messages => {
                if(messages.first().content === "cancel") {
                    a.then(r => r.edit("Cancelled command"));
                    messages.first().delete();
                    return;
                }
                if(Number(messages.first().content)) {
                    messages.first().delete();
                    a.then(r=>r.delete())
                    this.purgeSize = +messages.first().content;
                    this.purge(message);
                    return;
                }
                else;
            
            })
            .catch(console.log);
        }

    }

    purge(message: Message) {
        message.channel.bulkDelete(this.purgeSize)
        .then((m)=>{
            DiscordUtils.displayText(message, `Deleted **${m.size}** messages`)
        })
        .catch((e: DiscordAPIError) => {
            //This are common errors for bulkDelete. A more generic handling for generic DiscordAPI error can be made later on
            if(e.code === 50034) {
                DiscordUtils.displayText(message, "Some messages were too old to delete (older than **2 weeks**). Try deleting less at a time")
            }
            if(e.code === 50035) {
                DiscordUtils.displayText(message, "Can't delete more than **100** messages at once")
            }
        })
    }
}
