import { expect } from "chai";
import "mocha";
import {credits} from "./logic";
import {item_by_name} from "./logic";
import {IProduct} from "./logic";
import {Planet} from "./logic";
import {planet_by_name} from "./logic";
import {Starship} from "./logic";

describe ("item_name", () => {
    it("should equal 1 for call with srebro", () => {
        expect(item_by_name("srebro")).to.equal(1);
    });
});

describe ("planet_name", () => {
    it("should equal 2 for call with pl2", () => {
        expect(planet_by_name("pl2")).to.equal(2);
    });
    it("should equal 0 for call with pl0", () => {
        expect(planet_by_name("pl0")).to.equal(0);
    });
});

const s = new Starship("kocur", 10, "pl1");
describe ("Starship", () => {
    it("should be localized on its planet, x", () => {
        expect(s.x.val).to.equal(5);
    });
    it("should be localized on its planet, y", () => {
        expect(s.y).to.equal(10);
    });
    it("should have name kocur", () => {
        expect(s.name).to.equal("kocur");
    });
});

describe ("buy_item", () => {
    s.buy_item(2);
    it("should have 1 product", () => {
        expect(s.cur_cargo).to.equal(1);
    });
    it("should have paid 2 credits", () => {
        expect(credits.val).to.equal(98);
    });
    it("should have 1 idx = 2 product", () => {
        expect(s.item_num[2]).to.equal(1);
    });
    it("should have 0 idx = 1 products", () => {
        expect(s.item_num[1]).to.equal(0);
    });
});

const prod0 = new IProduct(3, 5, 2);
const prod1 = new IProduct(5, 2, 1);
const prod2 = new IProduct(1, 2, 5);

const prod = [prod0, prod1, prod2];

const p = new Planet("Mars", prod, 4, 2);

describe ("Planet", () => {
    it("should have good coordinates, x", () => {
        expect(p.x).to.equal(4);
    });
    it("should have good coordinates, y", () => {
        expect(p.y).to.equal(2);
    });
    it("should have 5 pieces of item 1", () => {
        expect(p.available_items[1].ammount).to.equal(5);
    });
    it("item with idx = 2 should have sell price equal to 5", () => {
        expect(p.available_items[2].sell_price).to.equal(5);
    });
});

describe ("add_starship", () => {
    p.add_starship(s);
    it("should have 1 starship", () => {
        expect(p.starships.length).to.equal(1);
    });
    it("first starship should be s", () => {
        expect(p.starships[0]).to.equal(s);
    });
});
