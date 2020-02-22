import * as fs from "fs";
import * as Discord from "discord.js";
import * as readline from "readline";
import { google } from "googleapis";
import DiscordUtils from "./discordUtils";
import { OAuth2Client } from "google-auth-library";

const OAuth2 = google.auth.OAuth2;

/**
 * Youtube Api called to gets youtube informations
 */
export class YoutubeApi {
    SCOPES: string[];
    TOKEN_DIR: string;
    TOKEN_PATH: string;
    result: any;

    constructor() {
        this.SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"];
        this.TOKEN_DIR =
            (process.env.HOME ||
                process.env.HOMEPATH ||
                process.env.USERPROFILE) + "/.credentials/";
        this.TOKEN_PATH = this.TOKEN_DIR + "youtube-token.json";

        this.result = null;
    }

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     *
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    authorize(credentials: any, callback: Function) {
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];

        var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

        // Check if we have previously stored a token.
        fs.readFile(this.TOKEN_PATH, (err: any, token: any) => {
            if (err) {
                this.getNewToken(oauth2Client, callback);
            } else {
                oauth2Client.credentials = JSON.parse(token);
                callback(oauth2Client);
            }
        });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     *
     * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback to call with the authorized
     *     client.
     */
    async getNewToken(oauth2Client: OAuth2Client, callback: Function) {
        var authUrl = await oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: this.SCOPES
        });

        console.log("Authorize this app by visiting this url: \n" + authUrl);

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question("Enter the code from that page here: ", (code: any) => {
            rl.close();
            oauth2Client.getToken(code, (err: any, token: any) => {
                if (err) {
                    console.log(
                        "Error while trying to retrieve access token",
                        err
                    );
                    return;
                }
                oauth2Client.credentials = token;
                this.storeToken(token);
                callback(oauth2Client);
            });
        });
    }

    /**
     * Store token to disk be used in later program executions.
     *
     * @param {Object} token The token to store to disk.
     */
    storeToken(token: Object) {
        try {
            fs.mkdirSync(this.TOKEN_DIR);
        } catch (err) {
            if (err.code != "EEXIST") {
                throw err;
            }
        }
        fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err: any) => {
            if (err) throw err;
            console.log("Token stored to " + this.TOKEN_PATH);
        });
    }

    /**
     * Look for a list of 5 videos to run in discord
     * @param {String} title
     */
    async getVideosFromTitle(message: Discord.Message, title: string) {
        // Load client secrets from a local file.
        await fs.readFile("./client_secret.json", (err: any, content: any) => {
            if (err) {
                console.log("Error loading client secret file: " + err);
                return;
            }
            // Authorize a client with the loaded credentials, then call the YouTube API.
            this.authorize(JSON.parse(content), (auth: any) => {
                var service = google.youtube("v3");

                service.search.list(
                    {
                        auth: auth,
                        part: "snippet",
                        maxResults: 5,
                        q: title,
                        type: "video"
                    },
                    (err: any, response: any) => {
                        if (err) {
                            console.log("The API returned an error: " + err);
                            return;
                        }
                        var videos = response.data.items;

                        if (videos.length == 0) {
                            console.log("No video found.");
                        } else {
                            console.log("FOUND " + videos.length + " videos !");

                            let newResults: LooseObject = {};
                            let textMessage =
                                "Select the video or ask for a different title!\n\n";

                            // stores the items into an object
                            for (let key in videos) {
                                let title = videos[key].snippet.title;

                                newResults[key] = {
                                    videoId: videos[key].id.videoId,
                                    title
                                };

                                textMessage += `${key} | ${title}\n`;
                            }

                            this.result = newResults;

                            DiscordUtils.displayText(message, textMessage);
                        }
                    }
                );
            });
        });
    }

    /**
     * Look for a list of 10 videos from a playlist
     * @param {String} playlistId
     */
    async getVideosFromPlaylist(message: Discord.Message, playlistId: string) {
        // Load client secrets from a local file.
        await fs.readFile("./client_secret.json", (err: any, content: any) => {
            if (err) {
                console.log("Error loading client secret file: " + err);
                return;
            }
            // Authorize a client with the loaded credentials, then call the YouTube API.
            this.authorize(JSON.parse(content), (auth: any) => {
                var service = google.youtube("v3");

                // gets the list
                service.playlistItems.list(
                    {
                        auth: auth,
                        part: "snippet",
                        maxResults: 10,
                        playlistId: playlistId
                    },
                    (err: any, response: any) => {
                        if (err) {
                            console.log("The API returned an error: " + err);
                            return;
                        }
                        let items = response.data.items;

                        if (items.length == 0) {
                            console.log("No video found.");
                        } else {
                            console.log("FOUND " + items.length + " items !");

                            let newResults = [];
                            let textMessage =
                                "List following list of songs has been added!\n\n";

                            // stores the items into an array
                            for (let item of items) {
                                if (
                                    item.snippet.resourceId &&
                                    item.snippet.resourceId.kind ==
                                        "youtube#video"
                                ) {
                                    let title = item.snippet.title;

                                    newResults.push({
                                        videoId:
                                            item.snippet.resourceId.videoId,
                                        title: item.snippet.title
                                    });

                                    textMessage += ` - ${title}\n`;
                                }
                            }

                            this.result = newResults;

                            DiscordUtils.displayText(message, textMessage);
                        }
                    }
                );
            });
        });
    }
}

interface LooseObject {
    [key: string]: any;
}
