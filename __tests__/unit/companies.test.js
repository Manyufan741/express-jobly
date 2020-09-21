process.env.NODE_ENV = "test";
const request = require("supertest");

const db = require("../../db");
const app = require("../../app");
const Company = require("../../models/company");
const Job = require("../../models/job");

describe("Test companies routes", function () {
    beforeEach(async function () {
        // await db.query("DELETE FROM jobs");
        await db.query("DELETE FROM companies");
        let u = await Company.create({
            handle: "TSLA",
            name: "Tesla",
            num_employees: 7777,
            description: "World Number 1",
            logo_url: "http"
        });
        await Job.create({
            title: "Application Engineer",
            salary: 123,
            equity: 0.1,
            company_handle: "TSLA"
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

    test("GET /companies/:handle", async function () {
        let response = await request(app).get("/companies/TSLA");
        expect(response.statusCode).toEqual(200);
        expect(response.body.company.handle).toEqual("TSLA");
        expect(response.body.company.name).toEqual("Tesla");
        expect(response.body.company.jobs[0].title).toEqual("Application Engineer");
        expect(response.body.company.jobs[0].salary).toEqual(123);
    });

    test("Failing GET /companies/:handle", async function () {
        let response = await request(app).get("/companies/TS");
        expect(response.statusCode).toEqual(404);
    });

    test("POST /companies", async function () {
        let response = await request(app).post("/companies").send({
            handle: "AAPL",
            name: "Apple"
        });
        expect(response.statusCode).toEqual(201);
        expect(response.body.company.handle).toEqual("AAPL");
        expect(response.body.company.name).toEqual("Apple");
    });

    test("Failing POST /companies", async function () {
        let response = await request(app).post("/companies").send({
            handle: "AAPL",
        });
        expect(response.statusCode).toEqual(400);
    });

    test("PATCH /companies/:handle", async function () {
        let response = await request(app).patch("/companies/TSLA").send({ name: "Tesla Inc.", logo_url: "Tesla logo" });
        expect(response.statusCode).toEqual(200);
        expect(response.body.company.name).toEqual("Tesla Inc.");
        expect(response.body.company.logo_url).toEqual("Tesla logo");
    });

    test("Failing PATCH /companies/:handle with attempt to change handle", async function () {
        let response = await request(app).patch("/companies/TSLA").send({ handle: "TES" });
        expect(response.statusCode).toEqual(400);
    });

    test("Failing PATCH /companies/:handle with wrong update datatype", async function () {
        let response = await request(app).patch("/companies/TSLA").send({ description: 12 });
        expect(response.statusCode).toEqual(400);
    });

    test("DELETE /companies/:handle", async function () {
        let response = await request(app).delete("/companies/TSLA");
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual("Company deleted");
    });

    test("Failing DELETE /companies/:handle", async function () {
        let response = await request(app).delete("/companies/TSL");
        expect(response.statusCode).toEqual(404);
    });
});

afterAll(async function () {
    await db.end();
});
