const { ipcRenderer } = require("electron");
const log = require("electron-log");

const DiscordRPC = require("discord-rpc");
const RPC = new DiscordRPC.Client({ transport: "ipc" });

const clientId = "1152188384220033055";
DiscordRPC.register(clientId);

let { Session } = require("./session.js");
let { User } = require("./user.js");

let presenceStatus = true;

class Rpc {
    async start() {
        let session = await new Session().get();

        if (!session) throw new Error("No Token");

        try {
            RPC.login({
                clientId: clientId,
                accessToken: session.data.access_token,
                scopes: ["identify"],
            });
        } catch (error) {
            log.error(`RPC 연결실패: ${error.message}`);
            if (error.message === "Token does not match current user") {
                throw new Error(error.message);
            }
        }

        RPC.on("ready", async () => {
            log.info(`RPC 연결완료 ${RPC.user.username} (${RPC.user.id})`);
            let user = await new User().get();
            if (user.id !== RPC.user.id) {
                return ipcRenderer.send("login");
            }

            RPC.state = "ready";
            this.updatePresence("Ready", {});
        });

        RPC.on("disconnected", () => {
            log.info(`RPC 연결해제`);
        });
    }

    get() {
        return RPC;
    }

    Presence() {
        if (presenceStatus) {
            presenceStatus = false;
            RPC.clearActivity();
        } else {
            presenceStatus = true;
            this.updatePresence("Ready");
        }
    }

    destroy() {
        RPC.destroy();
    }

    updatePresence(type, data) {
        if (presenceStatus === false) return;
        switch (type) {
            case "Ready":
                RPC.setActivity({
                    details: "재생 대기 중",
                    largeImageKey: `https://poppymusic.xyz/image/Poppy.jpg`,
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
                RPC.setActivity({
                    details: data.track.title < 50 ? data.track.title.substring(0, 100) + "..." : data.track.title,
                    state: data.track.author < 50 ? data.track.author.substring(0, 100) + "..." : data.track.author,
                    // endTimestamp: Math.floor((Date.now() + data.track.data.length - data.track.data.position) / 1000),
                    // startTimestamp: new Date().getTime(),
                    startTimestamp: new Date().getTime() - data.track.position,
                    smallImageKey: "https://poppymusic.xyz/image/Playing.png",
                    smallImageText: "Playing",
                    largeImageKey: data.track.artworkUrl || `https://poppymusic.xyz/image/Poppy.jpg`,
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
                RPC.setActivity({
                    details: data.track.title < 50 ? data.track.title.substring(0, 100) + "..." : data.track.title,
                    state: data.track.author,
                    // startTimestamp: new Date().getTime(),
                    smallImageKey: "https://poppymusic.xyz/image/Pause.png",
                    smallImageText: "Pause",
                    largeImageKey: data.track.artworkUrl || `https://poppymusic.xyz/image/Poppy.jpg`,
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

            case "Live":
                RPC.setActivity({
                    details: data.track.title < 50 ? data.track.title.substring(0, 100) + "..." : data.track.title,
                    state: data.track.author < 50 ? data.track.author.substring(0, 100) + "..." : data.track.author,
                    smallImageKey: "https://poppymusic.xyz/image/Live.png",
                    smallImageText: "Live",
                    largeImageKey: data.track.artworkUrl || `https://poppymusic.xyz/image/Poppy.jpg`,
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
