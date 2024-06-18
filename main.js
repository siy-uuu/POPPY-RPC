const DiscordRPC = require("discord-rpc");
const RPC = new DiscordRPC.Client({ transport: "ipc" });
const { io } = require("socket.io-client");
const clientId = "1152188384220033055";
const { setPlaying, setReady, setPause, setLive } = require("./function.js");
const { app, Menu, Tray } = require("electron");
let NowPlaying = new Map();
let status = "Ready";

let socket;

function ConnectWS() {
    socket = io("https://activity.poppymusic.xyz/", {
        reconnectionDelayMax: 10000,
        reconnection: true,
        autoConnect: true,
        auth: {
            token: "",
        },
        query: {
            UserId: RPC.user.id,
        },
    }).connect();

    socket.on("connect", () => {
        setInterval(() => {
            if (socket.active) socket.emit("ping");
        }, 30000);
    });

    socket.on("Update", (data) => {
        const json = JSON.parse(data);
        if (json.type == status && status == "Ready") return NowPlaying.clear();
        const Data = NowPlaying.get(json.data?.PlayerCreated);
        if (Data && json.data?.title == Data.data?.title && json.data?.PlayerCreated == Data.data?.PlayerCreated && json.type == Data.tyoe) return;
        NowPlaying.clear();
        status = json.type;
        if (json.type == "Ready") return setReady(RPC);
        NowPlaying.set(json.data.PlayerCreated, json);
        if (json.type == "Playing") return setPlaying(RPC, json);
        if (json.type == "Pause") return setPause(RPC, json);
        if (json.type == "Live") return setLive(RPC, json);
    });
}

app.on("ready", () => {
    let tray = new Tray(`${__dirname}/img/icon.jpg`);
    const myMenu = Menu.buildFromTemplate([
        { label: "       POPPY BOT       ", type: "normal", enabled: false },
        { type: "separator" },
        {
            label: "       RPC On",
            type: "normal",
            click: () => {
                if (socket.active) return;
                setReady(RPC);
                ConnectWS();
            },
        },
        {
            label: "       RPC Off",
            type: "normal",
            click: () => {
                if (!socket.active) return;
                RPC.clearActivity();
                socket.close();
            },
        },
        { type: "separator" },
        {
            label: "       Quit",
            type: "normal",
            click: () => {
                process.exit();
            },
        },
    ]);
    tray.setToolTip("POPPY BOT");
    tray.setContextMenu(myMenu);
});

RPC.login({ clientId: clientId });

DiscordRPC.register(clientId);

RPC.on("ready", async () => {
    setReady(RPC);
    ConnectWS();
});

process.on("uncaughtException", (err) => {
    console.error(err);
});
