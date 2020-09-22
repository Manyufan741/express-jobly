const express = require("express");
const router = new express.Router();
const jsonschema = require("jsonschema");

const Job = require("../models/job");
const jobPostSchema = require("../schema/jobPostSchema.json");
const jobPatchSchema = require("../schema/jobPatchSchema.json");
const ExpressError = require("../helpers/expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");

/** GET / - get the jobs list. Querying with search, min_salary, max_salary allowed.
 * 
 * => {jobs : [{handle, name, num_employees, description, logo_url}, ...]}
 * 
 **/
router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const jobs = await Job.all(req.query);
        return res.json({ jobs })
    } catch (err) {
        next(err);
    }
});

/** GET /:id - get a job by its id. Also returning the company related to it.
 * 
 * => {job : jobData}
 * 
 **/
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job })
    } catch (err) {
        next(err);
    }
});

/** POST / - create a job
 *
 * => {job : jobData}
 *
 **/

router.post("/", ensureIsAdmin, async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, jobPostSchema);
        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        next(err);
    }
});

/** PATCH /:id - patch a job
 *
 * => {job : jobData}
 *
 **/

router.patch("/:id", ensureIsAdmin, async (req, res, next) => {
    try {
        if (req.body.id) {
            throw new ExpressError("Can't change id!", 400);
        }
        let getAttempt = await Job.get(req.params.id);
        if (!getAttempt) {
            throw new ExpressError(`Can't find jobs with id: ${req.params.id}`);
        }
        const result = jsonschema.validate(req.body, jobPatchSchema);
        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }
        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        next(err);
    }
});

/** DELETE /:id - remove a job from database
 *
 * => {message: "Job deleted"}
 *
 **/

router.delete("/:id", ensureIsAdmin, async (req, res, next) => {
    try {
        await Job.remove(req.params.id);
        return res.json({ message: "Job deleted" });
    } catch (err) {
        next(err);
    }
});

module.exports = router;