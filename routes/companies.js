const express = require("express");
const router = new express.Router();
const jsonschema = require("jsonschema");

const Company = require("../models/company");
const companySchema = require("../schema/companySchema.json");
const ExpressError = require("../helpers/expressError");

/** GET / - get the companies list. Querying with search, min_employess, max_employees allowed.
 * 
 * => {companies : [{handle, name, num_employees, description, logo_url}, ...]}
 * 
 **/
router.get("/", async (req, res, next) => {
    try {
        const companies = await Company.all(req.query);
        return res.json({ companies })
    } catch (err) {
        next(err);
    }
});

/** POST / - create a company
 *
 * => {company : company data}
 *
 **/

router.post("/", async (req, res, next) => {
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

module.exports = router;