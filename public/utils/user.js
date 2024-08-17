const axios = require("axios");
const { Session } = require("./session.js");
let user = null;

class User {
    async refresh() {
        let session = await new Session().get();
        if (!session) {
            return;
        }

        const req = await axios
            .get("https://discord.com/api/users/@me", {
                headers: {
                    authorization: `${session.data.token_type} ${session.data.access_token}`,
                },
            })
            .catch((e) => {
                return;
            });

        if (req?.status !== 200) {
            return;
        }

        return req.data;
    }

    async get() {
        if (!user) {
            const refreshUser = await this.refresh();
            user = refreshUser;
            return refreshUser;
        }

        return user;
    }

    delete() {
        user = null;
        return;
    }
}

module.exports = { User };
