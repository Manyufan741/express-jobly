process.env.NODE_ENV = "test";
const request = require("supertest");

const db = require("../../db");
const app = require("../../app");
const Company = require("../../models/company");
const Job = require("../../models/job");

beforeAll(async function () {
    await Company.create({
        handle: "AAPL",
        name: "Apple"
    });
    await request(app).post("/users").send({
        username: "testguy",
        password: "test",
        first_name: "test",
        last_name: "guy",
        email: "test@gg.com",
        is_admin: true
    });
});

describe("Test jobs routes", function () {
    beforeEach(async function () {
        await db.query("DELETE FROM jobs");
        let u = await Job.create({
            title: "Application Engineer",
            salary: 98765.43,
            equity: 0.03,
            company_handle: "AAPL"
        });
    });

    test("GET /jobs/", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let response = await request(app).get("/jobs").send({ _token: token });
        expect(response.statusCode).toEqual(200);
        expect(response.body.jobs[0].title).toEqual("Application Engineer");
        expect(response.body.jobs[0].salary).toEqual(98765.43);
        expect(response.body.jobs[0].equity).toEqual(0.03);
        expect(response.body.jobs[0].company_handle).toEqual("AAPL");
    });

    test("GET /jobs?search=engin", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let response = await request(app).get("/jobs?search=engin").send({ _token: token });
        expect(response.statusCode).toEqual(200);
        expect(response.body.jobs[0].title).toEqual("Application Engineer");
        expect(response.body.jobs[0].salary).toEqual(98765.43);
        expect(response.body.jobs[0].equity).toEqual(0.03);
        expect(response.body.jobs[0].company_handle).toEqual("AAPL");
    });

    test("GET /jobs?search=nonono", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let response = await request(app).get("/jobs?search=nono").send({ _token: token });
        expect(response.statusCode).toEqual(200);
        expect(response.body.jobs).toEqual([]);
    });

    test("GET /jobs?min_salary=100&&max_salary=40", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let response = await request(app).get("/jobs?min_salary=100&&max_salary=40").send({ _token: token });
        expect(response.statusCode).toEqual(400);
    });

    test("GET /jobs/:id", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let theJob = await Job.all({});
        let id = theJob[0].id;
        let response = await request(app).get(`/jobs/${id}`).send({ _token: token });
        expect(response.statusCode).toEqual(200);
        expect(response.body.job.title).toEqual("Application Engineer");
        expect(response.body.job.company.name).toEqual("Apple");
    });

    test("Failing GET /jobs/:id", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let response = await request(app).get("/jobs/100").send({ _token: token });
        expect(response.statusCode).toEqual(404);
    });

    test("POST /jobs", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let response = await request(app).post("/jobs").send({
            title: "Software Engineer",
            salary: 180000,
            equity: 0.3,
            company_handle: "AAPL",
            _token: token
        });
        expect(response.statusCode).toEqual(201);
        expect(response.body.job.title).toEqual("Software Engineer");
        expect(response.body.job.salary).toEqual(180000);
        expect(response.body.job.equity).toEqual(0.3);
        expect(response.body.job.company_handle).toEqual("AAPL");
    });

    test("Failing POST /jobs", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let response = await request(app).post("/jobs").send({
            title: "Software Engineer",
            _token: token
        });
        expect(response.statusCode).toEqual(400);
    });

    test("PATCH /jobs/:id", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let theJob = await Job.all({});
        let id = theJob[0].id;
        let response = await request(app).patch(`/jobs/${id}`).send({ title: "Hardware Developer", salary: 150000.23, _token: token });
        expect(response.statusCode).toEqual(200);
        expect(response.body.job.title).toEqual("Hardware Developer");
        expect(response.body.job.salary).toEqual(150000.23);
    });

    test("Failing PATCH /jobs/:id with attempt to change id", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let theJob = await Job.all({});
        let id = theJob[0].id;
        let response = await request(app).patch(`/jobs/${id}`).send({ id: 1, _token: token });
        expect(response.statusCode).toEqual(400);
    });

    test("Failing PATCH /jobs/:id with wrong update datatype", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let theJob = await Job.all({});
        let id = theJob[0].id;
        let response = await request(app).patch(`/jobs/${id}`).send({ salary: "text", _token: token });
        expect(response.statusCode).toEqual(400);
    });

    test("DELETE /jobs/:id", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let theJob = await Job.all({});
        let id = theJob[0].id;
        let response = await request(app).delete(`/jobs/${id}`).send({ _token: token });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual("Job deleted");
    });

    test("Failing DELETE /jobs/:id", async function () {
        let loginRes = await request(app).post("/login").send({ username: "testguy", password: "test" });
        let token = loginRes.body.token;
        let response = await request(app).delete("/jobs/100").send({ _token: token });
        expect(response.statusCode).toEqual(404);
    });
});

afterAll(async function () {
    await db.query(`DELETE FROM companies`);
    await db.end();
});
