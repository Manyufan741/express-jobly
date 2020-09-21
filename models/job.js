const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Job {
    /** get all the jobs */
    static async all(query) {
        let { search, min_salary, max_salary } = query;
        console.log(search, min_salary, max_salary);
        if (!search) {
            search = '';
        }
        if (!min_salary) {
            min_salary = 0;
        }
        if (!max_salary) {
            max_salary = 1.797693134862315E+308;
        }
        let minNum = Number(min_salary);
        let maxNum = Number(max_salary);
        if (isNaN(minNum) || isNaN(maxNum)) {
            throw new ExpressError("min/max salary must be a NUMBER!", 400);
        } else if (minNum > maxNum) {
            throw new ExpressError("min_salary shouldn't be greater than max_salary!", 400);
        } else {
            const result = await db.query(`SELECT * FROM jobs 
            WHERE title ILIKE '%${search}%' 
            AND salary >= ${min_salary} 
            AND salary <= ${max_salary} 
            ORDER BY salary`);
            return result.rows;
        }
    }

    static async get(id) {
        const result = await db.query(`SELECT * FROM jobs WHERE id=$1`, [id]);
        if (!result.rows[0]) {
            throw new ExpressError(`No such job:${id}`, 404);
        }
        let comp_handle = result.rows[0].company_handle;
        const companyInfo = await db.query(`SELECT * FROM companies WHERE handle=$1`, [comp_handle]);
        let job = result.rows[0];
        job.company = companyInfo.rows[0];
        return job;
    }

    static async create(data) {
        const result = await db.query(`INSERT INTO jobs (title, salary, equity, company_handle) VALUES ($1, $2, $3, $4) RETURNING *`, [data.title, data.salary, data.equity, data.company_handle]);
        return result.rows[0];
    }

    static async update(id, body) {
        /**  function sqlForPartialUpdate(table, items, key, id)*/
        let { query, values } = sqlForPartialUpdate("jobs", body, "id", id);
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async remove(id) {
        const result = await db.query(`DELETE FROM jobs WHERE id=$1 RETURNING id`, [id]);

        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find job ${id} to delete!`, 404);
        }
    }
}

module.exports = Job;