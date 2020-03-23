import * as Discord from "discord.js";
import DiscordUtils from "../utils/DiscordUtils";
import * as commands from "../../commands.json";

export class HelpController {
    runCommand(message: Discord.Message, args: string[]) {
        let textMessage = "";

        if (args.length == 2) {
            textMessage = this.getOptionArguments(args[0], args[1]);
        } else {
            textMessage = this.getListCommands();
        }

        DiscordUtils.displayText(message, textMessage);
        return;
    }

    getListCommands(): string {
        let message = "ℹ️ List of available commands :\n\n";

        for (let commandName in commands) {
            if (commandName != "default") {
                let command = commands[commandName];
                message += "**/" + commandName + "** - " + command.desc + "\n";

                if (command.options.length) {
                    message += "\tOptions :\n";

                    for (let option of command.options) {
                        message +=
                            "\t\t***" +
                            option.name +
                            "*** - " +
                            option.desc +
                            "\n";
                    }
                }

                message += "\n";
            }
        }

        return message;
    }

    getOptionArguments(command: string, option: string): string {
        let message = "";

        if (commands[command] && commands[command].options.length) {
            for (let opt of commands[command].options) {
                if (opt.name == option && opt.args.length) {
                    message +=
                        "ℹ️ Arguments available for '/" +
                        command +
                        " " +
                        option +
                        "' : \n\n";

                    for (let arg of opt.args) {
                        message +=
                            "\t**" +
                            arg.name +
                            "** [" +
                            arg.type +
                            "] - *" +
                            arg.desc +
                            "*\n";
                    }
                }
            }
        }

        if (!message) {
            message =
                "ℹ️ No Arguments available for '/" +
                command +
                " " +
                option +
                "' !\n";
        }

        return message;
    }
}
