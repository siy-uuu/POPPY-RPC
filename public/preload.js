const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("minimize", () => {
    ipcRenderer.send("minimize");
});

contextBridge.exposeInMainWorld("api", {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    removeListener: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    },
});