const express = require("express");
const router = new express.Router();
const jsonschema = require("jsonschema");

const Company = require("../models/company");
const companySchema = require("../schema/companySchema.json");
const companyPatchSchema = require("../schema/companyPatchSchema.json");
const ExpressError = require("../helpers/expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");

/** GET / - get the companies list. Querying with search, min_employess, max_employees allowed.
 * 
 * => {companies : [{handle, name, num_employees, description, logo_url}, ...]}
 * 
 **/
router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const companies = await Company.all(req.query);
        return res.json({ companies })
    } catch (err) {
        next(err);
    }
});

/** GET /:handle - get a company by its handle. Also returning the jobs related to it.
 * 
 * => {company : companyData}
 * 
 **/
router.get("/:handle", ensureLoggedIn, async (req, res, next) => {
    try {
        const company = await Company.get(req.params.handle);
        return res.json({ company })
    } catch (err) {
        next(err);
    }
});

/** POST / - create a company
 *
 * => {company : companyData}
 *
 **/

router.post("/", ensureIsAdmin, async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, companySchema);
        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }
        const company = await Company.create(req.body);
        return res.status(201).json({ company });
    } catch (err) {
        next(err);
    }
});

/** PATCH /:handle - patch a company
 *
 * => {company : companyData}
 *
 **/

router.patch("/:handle", ensureIsAdmin, async (req, res, next) => {
    try {
        if (req.body.handle) {
            throw new ExpressError("Can't change handles!", 400);
        }
        let getAttempt = await Company.get(req.params.handle);
        if (!getAttempt) {
            throw new ExpressError(`Can't find company handle: ${req.params.handle}`);
        }
        const result = jsonschema.validate(req.body, companyPatchSchema);
        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }
        const company = await Company.update(req.params.handle, req.body);
        return res.json({ company });
    } catch (err) {
        next(err);
    }
});

/** DELETE /:handle - remove a company from database
 *
 * => {message: "Company deleted"}
 *
 **/

router.delete("/:handle", ensureIsAdmin, async (req, res, next) => {
    try {
        await Company.remove(req.params.handle);
        return res.json({ message: "Company deleted" });
    } catch (err) {
        next(err);
    }
});

module.exports = router;