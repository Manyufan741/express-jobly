const express = require("express");
const router = new express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

/** POST /login - login: {username, password} 
 * 
 * => {token} contains {username, is_admin}
 *
 **/
router.post("/", async (req, res, next) => {
    try {
        let { username, password } = req.body;

        if (! await User.authenticate(username, password)) {
            throw new ExpressError("Invalid username/password.", 400);
        } else {
            let { is_admin } = await User.authenticate(username, password);
            let token = jwt.sign({ username, is_admin }, SECRET_KEY);
            return res.json({ token });
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;