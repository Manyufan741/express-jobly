const bcrypt = require("bcrypt");
const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class User {
    static async register(reqBody) {
        let { username, password, first_name, last_name, email, photo_url, is_admin } = reqBody;

        if (!photo_url) {
            photo_url = '';
        }
        let hashedPW = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        const result = await db.query(`INSERT INTO users VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING username, is_admin`, [username, hashedPW, first_name, last_name, email, photo_url, is_admin]);

        return result.rows[0];
    }

    static async authenticate(username, password) {
        const result = await db.query(`SELECT * FROM users WHERE username=$1`, [username]);
        const user = result.rows[0];
        if (user && await bcrypt.compare(password, user.password)) {
            let authUser = { username: user.username, is_admin: user.is_admin };
            return authUser;
        }
        return false;
    }

    static async all() {
        const result = await db.query(`SELECT username, first_name, last_name, email FROM users ORDER BY username`);
        return result.rows;
    }

    static async get(username) {
        const result = await db.query(`SELECT username, first_name, last_name, email, photo_url FROM users WHERE username=$1`, [username]);
        if (!result.rows[0]) {
            throw new ExpressError(`No such user: ${username}`, 404);
        }
        return result.rows[0]
    }

    static async update(username, reqBody) {
        if (reqBody.password) {
            let hashedPW = await bcrypt.hash(reqBody.password, BCRYPT_WORK_FACTOR);
            reqBody.password = hashedPW;
        }
        let { query, values } = sqlForPartialUpdate("users", reqBody, "username", username);
        const result = await db.query(query, values);
        delete result.rows[0].password;
        return result.rows[0];
    }

    static async remove(username) {
        const result = await db.query(`DELETE FROM users WHERE username=$1 RETURNING username`, [username]);

        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find user ${username} to delete!`, 404);
        }
    }

}

module.exports = User;