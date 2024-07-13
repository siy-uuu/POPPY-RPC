class Session {
    constructor() {
        this.session = null;
    }

    set(data) {
        this.session = data;

        const filePath = path.join(app.getPath('userData'), 'data.json');
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}), { encoding: "utf8" });
        }

        const encodedData = Buffer.from(JSON.stringify(data)).toString("base64");
        fs.writeFileSync(filePath, JSON.stringify({ token: encodedData }), { encoding: "utf8" });
    }

    get() {
        if (!this.session) {
            this.session = this.load();
        }
        return this.session;
    }

    load() {
        const filePath = path.join(app.getPath('userData'), 'data.json');
        if (!fs.existsSync(filePath)) {
            return null;
        }

        const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
        if (!fileContent) {
            return null;
        }

        const { token } = JSON.parse(fileContent);
        if (!token) {
            return null;
        }

        const decodedData = Buffer.from(token, "base64").toString("utf8");
        const data = JSON.parse(decodedData);
        return data;
    }

    delete() {
        const filePath = path.join(app.getPath('userData'), 'data.json');
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}), { encoding: "utf8" });
            return;
        }

        fs.writeFileSync(filePath, JSON.stringify({}), { encoding: "utf8" });
    }
}

const { app } = require('electron');
const fs = require('fs');
const path = require('path');


module.exports = { Session };
