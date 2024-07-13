const { EventSourcePolyfill, NativeEventSource } = require("event-source-polyfill");
const EventSource = EventSourcePolyfill || NativeEventSource;
const log = require("electron-log");
const { User } = require("./user.js");
const { Session } = require("./session.js");
const { Rpc } = require("./rpc.js");
// const { getGradient } = require("./gradient.js");

let sseEvents = null;

async function SSE_Start(mainwindow) {
    let session = await new Session().get();
    const user = await new User().get();
    if (!user) return console.error("No user found");

    sseEvents = new EventSource(`https://activity.poppymusic.xyz/events`, {
        headers: {
            Authorization: session.token,
        },
    });

    sseEvents.onopen = () => {
        log.info("SSE 연결완료 (이벤트 수신 대기중)");
    };

    sseEvents.onmessage = async (stream) => {
        const parsedData = JSON.parse(stream.data);
        if (parsedData.timestamp) return log.info(`SSE ping: ${Math.floor(new Date().getTime() / 1000) - Math.floor(Number(parsedData.timestamp) / 1000)}`);
        if (!parsedData.type) return log.info("No track data received");
        log.info("SSE 이벤트 수신");

        // if (parsedData?.track?.artworkUrl) {
        //     try {
        //         const gradient = await getGradient(parsedData.track.artworkUrl);
        //         parsedData.gradient = gradient;
        //     } catch (error) {
        //         console.error("Error getting gradient:", error);
        //     }
        // }

        new Rpc().updatePresence(parsedData.type, parsedData);
        mainwindow.webContents.send("update", parsedData);
    };

    sseEvents.addEventListener("close", () => {
        console.log("Connection closed by server");
        sseEvents.close();
    });
}

async function SSE_Close() {
    if (sseEvents) {
        sseEvents.close();
        sseEvents = null;
    }
}

module.exports = { SSE_Start, SSE_Close };
