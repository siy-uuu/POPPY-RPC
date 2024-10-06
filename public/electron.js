require("dotenv").config();

const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, shell } = require("electron");
const log = require("electron-log");
const url = require("url");
const path = require("path");

const { Oauth } = require("./utils/oauth.js");
const { Session } = require("./utils/session.js");
const { User } = require("./utils/user.js");
const { Rpc } = require("./utils/rpc.js");
const { SSE_Start, SSE_Close } = require("./utils/sse.js");

let oauth = new Oauth();
let RPC = new Rpc();
let user = new User();
let session = new Session();

let mainwindow;
let loginwindow;

const mainPage = process.env?.NODE_ENV === "development" ? "http://localhost:3000" : url.format({ pathname: path.join(__dirname, "../build/index.html"), protocol: "file:", slashes: true, hash: "/" });
const loginPage =
    process.env?.NODE_ENV === "development" ? "http://localhost:3000/#/login" : url.format({ pathname: path.join(__dirname, "../build/index.html"), protocol: "file:", slashes: true, hash: "/login" });

const mainwindow_Start = async () => {
    mainwindow = new BrowserWindow({
        width: 450,
        height: 700,
        show: false,
        frame: false,
        resizable: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname, "./image/icon.jpg"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    mainwindow.setMenu(null); // ctrl + W

    if (!(await session.get())) {
        mainwindow.loadURL(loginPage);
        mainwindow.show();
        return;
    }

    let userData = await user.get();

    if (!userData) {
        mainwindow.loadURL(loginPage);
        mainwindow.show();
        return;
    }

    mainwindow.loadURL(mainPage);

    mainwindow.webContents.once("did-finish-load", async () => {
        await mainwindow.webContents.send("user", userData);
        await mainwindow.show();
        await RPC.start().then(() => SSE_Start(mainwindow));
    });
};

const loginwindow_Start = async () => {
    loginwindow = new BrowserWindow({
        width: 850,
        height: 850,
        resizable: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname, "./image/icon.jpg"),
    });

    loginwindow.setAlwaysOnTop(true);
    loginwindow.loadURL(await oauth.getURL());
};

const tray_Start = async () => {
    let tray = new Tray(path.join(__dirname, "./image/icon.jpg"));
    const myMenu = Menu.buildFromTemplate([
        { label: " POPPY MUSIC       ", icon: nativeImage.createFromPath(path.join(__dirname, "./image/icon.jpg")).resize({ width: 14 }), type: "normal", enabled: false },
        { type: "separator" },
        {
            label: "  Quit",
            type: "normal",
            click: () => {
                process.exit();
            },
        },
    ]);
    tray.setToolTip("POPPY BOT");
    tray.setContextMenu(myMenu);
};

if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient("poppymusic", process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient("poppymusic");
}

ipcMain.on("login", async () => {
    loginwindow_Start();
});

ipcMain.on("logout", async () => {
    RPC.destroy();
    SSE_Close();
    user.delete();
    await mainwindow.loadURL(loginPage);
    session.delete();
});

ipcMain.on("minimize", () => {
    mainwindow.minimize();
});

ipcMain.on("rpc", () => {
    RPC.Presence();
});

ipcMain.on("open_browser", (event, link) => {
    shell.openExternal(link);
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        const protocol = commandLine.find((arg) => arg.startsWith("poppymusic://"));
        if (protocol) {
            const { host, pathname, searchParams } = new URL(protocol);
            if (pathname === "/") {
                if (mainwindow) {
                    if (mainwindow.isMinimized()) mainwindow.restore();
                    mainwindow.focus();
                }
            } else if (host === "oauth" && pathname === "/callback") {
                let code = searchParams.get("code");
                if (!code) {
                    loginwindow.destroy();
                    return;
                }
                log.info("코드 발급 성공");
                oauth
                    .getToken(code)
                    .then(async () => {
                        loginwindow.destroy();
                        let userData = await user.get();
                        await mainwindow.loadURL(mainPage).then(async () => {
                            await mainwindow.webContents.send("user", userData);
                            await RPC.start().then(() => SSE_Start(mainwindow));
                        });

                        log.info("oauth2 코드 인증 성공");
                    })
                    .catch(() => {
                        loginwindow.destroy();
                    });
            }
        }
    });
}

app.whenReady().then(() => {
    mainwindow_Start();
    tray_Start();
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

module.exports = { mainwindow };
