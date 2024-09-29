const { ipcRenderer } = require("electron");
const log = require("electron-log");

const { Client } = require("@xhayper/discord-rpc");
const { ActivityType } = require("discord-api-types/v10");
const client = new Client({
    clientId: "1152188384220033055",
    transport: {
        type: "ipc",
    },
});

let { Session } = require("./session.js");
let { User } = require("./user.js");

let presenceStatus = true;

class Rpc {
    async start() {
        let session = await new Session().get();
        if (!session) throw new Error("No Token");

        try {
            client.login({
                refreshToken: session.data.refresh_token,
                prompt: "none", // Only prompt once
            });
        } catch (error) {
            log.error(`RPC 연결실패: ${error.message}`);
            if (error.message === "Token does not match current user") {
                throw new Error(error.message);
            }
        }

        client.on("ready", async () => {
            log.info(`RPC 연결완료 ${client.user.username} (${client.user.id})`);
            let user = await new User().get();
            if (user.id !== client.user.id) {
                return ipcRenderer.send("login");
            }

            client.state = "ready";
            this.updatePresence("Ready", {});
        });

        client.on("disconnected", () => {
            log.info(`RPC 연결해제`);
        });
    }

    get() {
        return client;
    }

    Presence() {
        if (presenceStatus) {
            presenceStatus = false;
            client.user.clearActivity();
        } else {
            presenceStatus = true;
            this.updatePresence("Ready");
        }
    }

    destroy() {
        client.destroy();
    }

    updatePresence(type, data) {
        if (presenceStatus === false) return;
        switch (type) {
            case "Ready":
                client.user.setActivity({
                    details: "재생 대기 중",
                    largeImageKey: `https://poppymusic.xyz/static/images/Poppy.jpg`,
                    startTimestamp: new Date().getTime(),
                    buttons: [
                        {
                            label: "공식사이트",
                            url: `https://poppymusic.xyz/`,
                        },
                    ],
                });

                break;

            case "Playing":
                data.track.uri = encodeURI(data.track.uri);
                // if (data.track.uri.includes("https://music.apple.com/kr/album/")) {
                //     const parameter = data.track.uri.replace("https://music.apple.com/kr/album/", "");
                //     data.track.uri = `https://music.apple.com/kr/album/${encodeURIComponent(parameter)}`;
                // }

                client.user.setActivity({
                    type: ActivityType.Listening,
                    details: data.track.title < 50 ? data.track.title.substring(0, 100) + "..." : data.track.title,
                    state: data.track.author < 50 ? data.track.author.substring(0, 100) + "..." : data.track.author,
                    endTimestamp: Math.floor((Date.now() + data.track.length - data.track.position) / 1000),
                    // startTimestamp: new Date().getTime(),
                    startTimestamp: new Date().getTime() - data.track.position,
                    smallImageKey: "https://poppymusic.xyz/static/images/Playing.png",
                    smallImageText: "Playing",
                    largeImageKey: data.track.artworkUrl || `https://poppymusic.xyz/static/images/Poppy.jpg`,
                    buttons: [
                        {
                            label: "🐱 뽀삐 초대하기 🐱",
                            url: `https://discord.com/oauth2/authorize?client_id=896270994740764684&permissions=281357446256&redirect_uri=https://poppymusic.xyz/thanks&response_type=code&scope=bot%20applications.commands%20identify`,
                        },
                        {
                            label: "음악 들어보기",
                            url: `${data.track.uri}`,
                        },
                    ],
                });

                break;

            case "Pause":
                if (presenceStatus === true) client.user.clearActivity();
                // client.user.setActivity({
                //     type: ActivityType.Listening,
                //     details: data.track.title < 50 ? data.track.title.substring(0, 100) + "..." : data.track.title,
                //     state: data.track.author,
                //     // startTimestamp: new Date().getTime(),
                //     smallImageKey: "https://poppymusic.xyz/static/images/Pause.png",
                //     smallImageText: "Pause",
                //     largeImageKey: data.track.artworkUrl || `https://poppymusic.xyz/static/images/Poppy.jpg`,
                //     buttons: [
                //         {
                //             label: "🐱 뽀삐 초대하기 🐱",
                //             url: `https://discord.com/oauth2/authorize?client_id=896270994740764684&permissions=281357446256&redirect_uri=https://poppymusic.xyz/thanks&response_type=code&scope=bot%20applications.commands%20identify`,
                //         },
                //         {
                //             label: "음악 들어보기",
                //             url: `${data.track.uri}`,
                //         },
                //     ],
                // });

                break;

            case "Live":
                client.user.setActivity({
                    type: ActivityType.Listening,
                    details: data.track.title < 50 ? data.track.title.substring(0, 100) + "..." : data.track.title,
                    state: data.track.author < 50 ? data.track.author.substring(0, 100) + "..." : data.track.author,
                    smallImageKey: "https://poppymusic.xyz/static/images/Live.png",
                    smallImageText: "Live",
                    largeImageKey: data.track.artworkUrl || `https://poppymusic.xyz/static/images/Poppy.jpg`,
                    startTimestamp: new Date().getTime() - data.track.position,
                    // startTimestamp: new Date().getTime(),
                    buttons: [
                        {
                            label: "🐱 뽀삐 초대하기 🐱",
                            url: `https://discord.com/oauth2/authorize?client_id=896270994740764684&permissions=281357446256&redirect_uri=https://poppymusic.xyz/thanks&response_type=code&scope=bot%20applications.commands%20identify`,
                        },
                        {
                            label: "LIVE",
                            url: `${data.track.uri}`,
                        },
                    ],
                });

                break;

            default:
                console.warn("Unknown update type:", type);
        }
    }
}

module.exports = { Rpc };
