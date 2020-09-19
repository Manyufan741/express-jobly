const db = require("../db");
const ExpressError = require("../helpers/expressError");

class Company {
    /** get all the companies */
    static async all(query) {
        let { search, min_employees, max_employees } = query;
        console.log(search, min_employees, max_employees);
        if (!search) {
            search = '';
        }
        if (!min_employees) {
            min_employees = 0;
        }
        if (!max_employees) {
            max_employees = 1.797693134862315E+308;
        }
        let minNum = Number(min_employees);
        let maxNum = Number(max_employees);
        if (isNaN(minNum) || isNaN(maxNum)) {
            throw new ExpressError("min/max exployees must be a NUMBER!", 400);
        } else if (minNum > maxNum) {
            throw new ExpressError("min_employees shouldn't be greater than max_employees!", 400);
        } else {
            const result = await db.query(`SELECT * FROM companies 
            WHERE name ILIKE '%${search}%' 
            AND num_employees >= ${min_employees} 
            AND num_employees <= ${max_employees} 
            ORDER BY handle`);
            return result.rows;
        }
    }

    static async create(data) {
        const result = await db.query(`INSERT INTO companies VALUES ($1, $2, $3, $4, $5) RETURNING *`, [data.handle, data.name, data.num_employees, data.description, data.logo_url]);
        return result.rows[0];
    }
}

module.exports = Company;