function setPlaying(RPC, json) {
    if (!RPC) return;
    let identifier = `https://img.youtube.com/vi/${json.data.identifier}/mqdefault.jpg`;
    if (json.source == "spotify") identifier = "https://poppymusic.xyz/image/Poppy.jpg";

    RPC.setActivity({
        details: json.data.title < 50 ? json.data.title.substring(0, 100) + "..." : json.data.title,
        state: json.data.author < 50 ? json.data.author.substring(0, 100) + "..." : json.data.author,
        // endTimestamp: Math.floor((Date.now() + json.data.length - json.data.Position) / 1000),
        startTimestamp: json.data.PlayerCreated,
        smallImageKey: "https://poppymusic.xyz/image/Playing.png",
        smallImageText: "Playing",
        largeImageKey: identifier,
        largeImageText: "POPPY",
        buttons: [
            {
                label: "Now Playing",
                url: `https://www.youtube.com/watch?v=${json.data.identifier}`,
            },
        ],
    });
}

function setReady(RPC) {
    if (!RPC) return;
    return RPC.setActivity({
        details: "재생 대기 중",
        largeImageKey: `https://poppymusic.xyz/image/Poppy.jpg`,
        largeImageText: "POPPY",
        startTimestamp: new Date().getTime(),
        buttons: [
            {
                label: "공식사이트",
                url: `https://poppymusic.xyz/`,
            },
        ],
    });
}

function setPause(RPC, json) {
    if (!RPC) return;
    let identifier = `https://img.youtube.com/vi/${json.data.identifier}/mqdefault.jpg`;
    if (json.source == "spotify") identifier = "https://poppymusic.xyz/image/Poppy.jpg";

    RPC.setActivity({
        details: json.data.title < 50 ? json.data.title.substring(0, 100) + "..." : json.data.title,
        state: json.data.author,
        startTimestamp: json.data.PlayerCreated,
        smallImageKey: "https://poppymusic.xyz/image/Pause.png",
        smallImageText: "Pause",
        largeImageKey: identifier,
        largeImageText: "POPPY",
        buttons: [
            {
                label: "Now Playing",
                url: `https://www.youtube.com/watch?v=${json.data.identifier}`,
            },
        ],
    });
}

function setLive(RPC, json) {
    if (!RPC) return;
    let identifier = `https://img.youtube.com/vi/${json.data.identifier}/mqdefault.jpg`;
    if (json.source == "spotify") identifier = "https://poppymusic.xyz/image/Poppy.jpg";

    RPC.setActivity({
        details: json.data.title < 50 ? json.data.title.substring(0, 100) + "..." : json.data.title,
        state: json.data.author < 50 ? json.data.author.substring(0, 100) + "..." : json.data.author,
        smallImageKey: "https://poppymusic.xyz/image/Live.png",
        smallImageText: "Live",
        largeImageKey: identifier,
        largeImageText: "POPPY",
        startTimestamp: json.data.PlayerCreated,
        buttons: [
            {
                label: "LIVE",
                url: `https://www.youtube.com/watch?v=${json.data.identifier}`,
            },
        ],
    });
}

module.exports = {
    setPlaying,
    setReady,
    setPause,
    setLive,
};

// https://cdn.discordapp.com/avatars/896270994740764684/9d18c733b7efa2b2738edebab26552df.webp
