const { Session } = require("./session.js");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

class Oauth {
    constructor() {
        this.codeVerifier = null;
    }

    async generateCodeVerifier() {
        const codeVerifier = crypto.randomBytes(32).toString("hex");
        this.codeVerifier = codeVerifier;
        return codeVerifier;
    }

    async generateCodeChallenge(codeVerifier) {
        const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
        return codeChallenge;
    }

    async getURL() {
        const codeVerifier = await this.generateCodeVerifier();
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);

        const state = uuidv4();
        const params = new URLSearchParams();
        params.append("client_id", "1152188384220033055");
        params.append("redirect_uri", "poppymusic://oauth/callback");
        params.append("scope", "identify");
        params.append("response_type", "code");
        params.append("state", state);
        params.append("code_challenge", codeChallenge);
        params.append("code_challenge_method", "S256");

        const url = `https://discord.com/oauth2/authorize?${params.toString()}`;
        return url;
    }

    async getToken(code) {
        const data = await fetch(`https://activity.poppymusic.xyz/token?code=${code}&codeVerifier=${this.codeVerifier}`, {
            method: "POST",
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error("Error Fetching Token");
                }
                return response.json();
            })
            .catch((error) => {
                throw new Error(error);
            });

        if (!data || !data.data.access_token) {
            throw new Error("No Token");
        }

        new Session().set(data);

        return data;
    }
}

module.exports = {
    Oauth,
};
