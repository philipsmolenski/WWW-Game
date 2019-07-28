"use strict";
exports.__esModule = true;
var ekran_gry_1 = require("./ekran_gry");
var chai_1 = require("chai");
require("mocha");
describe("item_name", function () {
    var items = ["złoto", "srebro", "brąz"];
    it("should equal 1 for call with srebro", function () {
        chai_1.expect(ekran_gry_1.item_by_name("srebro")).to.equal(1);
    });
});
