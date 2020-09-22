const express = require("express");
const router = new express.Router();
const jsonschema = require("jsonschema");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const userRegistrationSchema = require("../schema/userRegistrationSchema.json");
const userUpdateSchema = require("../schema/userUpdateSchema.json");
const ExpressError = require("../helpers/expressError");
const { SECRET_KEY } = require("../config");
const { ensureCorrectUser } = require("../middleware/auth");

/** POST / - create a new user
 *
 * => {token : token}
 *
 **/

router.post("/", async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, userRegistrationSchema);
        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }
        let { username, is_admin } = await User.register(req.body);
        let token = jwt.sign({ username, is_admin }, SECRET_KEY);
        return res.status(201).json({ token });
    } catch (err) {
        next(err);
    }
});

/** GET / - get basic info for all the users
     *
     * => {users: [{username, first_name, last_name, email}, ...]}
     *
     **/

router.get("/", async (req, res, next) => {
    try {
        const users = await User.all();
        return res.json({ users });
    } catch (err) {
        next(err);
    }
});

/** GET /:username - get info except password by username
     *
     * => {user: {username, first_name, last_name, email, photo_url}}
     *
     **/

router.get("/:username", async (req, res, next) => {
    try {
        const user = await User.get(req.params.username);
        return res.json({ user });
    } catch (err) {
        next(err);
    }
});

/** PATCH /:username - update user info
     *
     * => {users: {username, first_name, last_name, email, photo_url}}
     *
     **/

router.patch("/:username", ensureCorrectUser, async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, userUpdateSchema);
        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }
        const user = await User.update(req.params.username, req.body);
        return res.json({ user });
    } catch (err) {
        next(err);
    }
});

/** DELETE /:username - delete as user
     *
     * => {message:"User deleted"}
     *
     **/

router.delete("/:username", ensureCorrectUser, async (req, res, next) => {
    try {
        await User.remove(req.params.username);
        return res.json({ message: "User deleted" });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
