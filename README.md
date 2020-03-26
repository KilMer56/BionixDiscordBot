<h1 align="center">Welcome to BionixDiscordBot 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/npm-%3E%3D6.13.7-blue.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D12.15.0-blue.svg" />
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
</p>

> Wild bot for your Discord server

## Table of Content

-   [Commands](#commands)
-   [Prerequisites](#prerequisites)
-   [Install](#install)
-   [Usage](#usage)
-   [Author](#author)

## Commands

| Command           | Arguments (bold for mandatory)                                                                                                             | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| /help             | [command: String]<br/>[option: String]                                                                                                     | Display the help section of specific command (Arguments, description, etc.)    |
| /ping             |                                                                                                                                            | Ping the bot to check if it's alive                                            |
| /channel join     |                                                                                                                                            | The bot join the currentchannel                                                |
| /channel leave    |                                                                                                                                            | The bot leave the currentchannel                                               |
| /boat start       |                                                                                                                                            | Start a Battleship Game                                                        |
| /boat place       | **[boatType: Integer]<br/>[verticalCoordinate: Integer]<br/>[horizontalCoordinate: Char]<br/>[isHorizontal: Boolean]**<br/>or **_random_** | Place a boat at a specific coordinate or randomly                              |
| /boat hit         | **[verticalCoordinate: Integer]<br/>[horizontalCoordinate: Char]**                                                                         | Hit the Bot to a specific starget                                              |
| /ytb url          | [url: String]                                                                                                                              | Load a youtube music from a video url                                          |
| /ytb skip         |                                                                                                                                            | Skip the current music and play the next one in the queue                      |
| /ytb stop         |                                                                                                                                            | Stop the current music and empty the queue                                     |
| /ytb volume       | **[volumeRatio: Float]**                                                                                                                   | Set the volume of the youtube player                                           |
| /ytb search       | **[title: String]**                                                                                                                        | Search a video from a title                                                    |
| /ytb select       | **[number: Integer]**                                                                                                                      | Select a video proposed after a title research                                 |
| /ytb pause        |                                                                                                                                            | Put the youtube player in the 'quiet' mode                                     |
| /ytb resume       |                                                                                                                                            | Resume the previous volume state                                               |
| /ytb getPlaylist  | **[playlistId: String]**                                                                                                                   | Get the list of 10 videos from a playlist Id                                   |
| /ytb loadPlaylist |                                                                                                                                            | Load the list of videos obtained from the 'getPlaylist' command into the queue |

## Prerequisites

-   npm >=6.13.7
-   node >=12.15.0

## Install

```sh
npm install
```

## Usage

```sh
npm run start
```

## ToDo

-   **Global**

    -   Refactoring
    -   Correct spelling mistakes
    -   Add more documentation
    -   Add Unit Tests
    -   Keep working on it 😃

-   **Battleship**

    -   Global Refactoring
    -   Add Player vs Player
    -   Improve UI
    -   Improve Bot

-   **YouTube**
    -   Global Refactoring
    -   Search playlist with title
    -   Improve audio quality
    -   Be able to see the queue
    -   Load playlist after a research

## Author

👤 **KilMer56**

-   LinkedIn: [@killianmer](https://linkedin.com/in/killianmer)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/KilMer56/bionix-discord-bot/issues).

## Show your support

Give a ⭐️ if this project helped you!
