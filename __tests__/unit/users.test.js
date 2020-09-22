process.env.NODE_ENV = "test";
const request = require("supertest");
const jwt = require("jsonwebtoken");

const db = require("../../db");
const app = require("../../app");
const User = require("../../models/user");

describe("Test users routes", function () {
    beforeEach(async function () {
        // await db.query("DELETE FROM jobs");
        await db.query("DELETE FROM users");
        let u = await User.register({
            username: "BOOOJ",
            password: "test",
            first_name: "Bojack",
            last_name: "Horseman",
            email: "bj@gmail.com",
            is_admin: true
        });
    });

    test("GET /users", async function () {
        let response = await request(app).get("/users");
        expect(response.statusCode).toEqual(200);
        expect(response.body.users[0].username).toEqual("BOOOJ");
        expect(response.body.users[0].first_name).toEqual("Bojack");
        expect(response.body.users[0].last_name).toEqual("Horseman");
        expect(response.body.users[0].email).toEqual("bj@gmail.com");
    });

    test("GET /users/:username", async function () {
        let response = await request(app).get("/users/BOOOJ");
        expect(response.statusCode).toEqual(200);
        expect(response.body.user.username).toEqual("BOOOJ");
        expect(response.body.user.first_name).toEqual("Bojack");
        expect(response.body.user.last_name).toEqual("Horseman");
        expect(response.body.user.email).toEqual("bj@gmail.com");
    });

    test("Failing GET /users/:username", async function () {
        let response = await request(app).get("/users/bobo");
        expect(response.statusCode).toEqual(404);
    });

    test("POST /users", async function () {
        let response = await request(app).post("/users").send({
            username: "testguy",
            password: "testpw",
            first_name: "test",
            last_name: "guy",
            email: "test@abc.com",
            photo_url: "dadada",
            is_admin: false
        });
        let token = response.body.token;
        expect(response.statusCode).toEqual(201);
        expect(jwt.decode(token)).toEqual({
            username: "testguy",
            is_admin: false,
            iat: expect.any(Number)
        });
    });

    test("Failing POST /users", async function () {
        let response = await request(app).post("/users").send({
            username: "AAPL",
        });
        expect(response.statusCode).toEqual(400);
    });

    test("PATCH /users/:username", async function () {
        let response = await request(app).patch("/users/BOOOJ").send({ first_name: "BO", last_name: "Jack" });
        expect(response.statusCode).toEqual(200);
        expect(response.body.user.first_name).toEqual("BO");
        expect(response.body.user.last_name).toEqual("Jack");
    });

    test("Failing PATCH /users/:username with wrong update datatype", async function () {
        let response = await request(app).patch("/users/BOOOJ").send({ first_name: 109 });
        expect(response.statusCode).toEqual(400);
    });

    test("DELETE /users/:username", async function () {
        let response = await request(app).delete("/users/BOOOJ");
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual("User deleted");
    });

    test("Failing DELETE /users/:username", async function () {
        let response = await request(app).delete("/users/BO");
        expect(response.statusCode).toEqual(404);
    });
});

afterAll(async function () {
    await db.end();
});