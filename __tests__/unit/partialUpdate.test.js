const sqlForPartialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
    function () {
      let { query, values } = sqlForPartialUpdate("table", { first: "first", _second: "second", third: "third" }, "username", 123);
      //expecting query = `UPDATE table SET first=$1, third=$2 WHERE username=$3 RETURNING *`
      //expecting values = ["first", "third", 123]
      expect(query).toEqual(`UPDATE table SET first=$1, third=$2 WHERE username=$3 RETURNING *`);
      expect(values).toEqual(["first", "third", 123]);
    });
});
