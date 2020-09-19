process.env.NODE_ENV = "test";
const request = require("supertest");

const db = require("../../db");
const app = require("../../app");
const Company = require("../../models/company");

describe("Test companies routes", function () {
    beforeEach(async function () {
        await db.query("DELETE FROM companies");
        let u = await Company.create({
            handle: "TSLA",
            name: "Tesla",
            num_employees: 7777,
            description: "World Number 1",
            logo_url: "http"
        });
    });

    test("GET /companies/", async function () {
        let response = await request(app).get("/companies");
        expect(response.statusCode).toEqual(200);
        expect(response.body.companies[0].handle).toEqual("TSLA");
        expect(response.body.companies[0].name).toEqual("Tesla");
        expect(response.body.companies[0].num_employees).toEqual(7777);
        expect(response.body.companies[0].description).toEqual("World Number 1");
        expect(response.body.companies[0].logo_url).toEqual("http");
    });

    test("GET /companies?search=es", async function () {
        let response = await request(app).get("/companies?search=es");
        expect(response.statusCode).toEqual(200);
        expect(response.body.companies[0].handle).toEqual("TSLA");
        expect(response.body.companies[0].name).toEqual("Tesla");
        expect(response.body.companies[0].num_employees).toEqual(7777);
        expect(response.body.companies[0].description).toEqual("World Number 1");
        expect(response.body.companies[0].logo_url).toEqual("http");
    });

    test("GET /companies?search=pp", async function () {
        let response = await request(app).get("/companies?search=pp");
        expect(response.statusCode).toEqual(200);
        expect(response.body.companies).toEqual([]);
    });

    test("GET /companies?min_employees=100&&max_employees=40", async function () {
        let response = await request(app).get("/companies?min_employees=100&&max_employees=40");
        expect(response.statusCode).toEqual(400);
    });

});

afterAll(async function () {
    await db.end();
});
