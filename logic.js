"use strict";
exports.__esModule = true;
var IProduct = /** @class */ (function () {
    function IProduct(ammout, buy_price, sell_price) {
        this.ammount = ammout;
        this.buy_price = buy_price;
        this.sell_price = sell_price;
    }
    return IProduct;
}());
exports.IProduct = IProduct;
var ValueWithListeners = /** @class */ (function () {
    function ValueWithListeners(val) {
        this.val = val;
        this.listeners = [];
    }
    ValueWithListeners.prototype.add_listener = function (listener) {
        this.listeners.push(listener);
    };
    ValueWithListeners.prototype.notify_listeners = function () {
        for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
            var listener = _a[_i];
            listener();
        }
    };
    ValueWithListeners.prototype.remove_listener = function (listener) {
        var idx = this.listeners.indexOf(listener);
        if (idx === -1) {
            return;
        }
        this.listeners.splice(idx, 1);
    };
    return ValueWithListeners;
}());
var items = ["złoto", "srebro", "brąz"];
var time = new ValueWithListeners(0);
exports.credits = new ValueWithListeners(100);
var starships;
var len;
function item_by_name(name) {
    for (var i = 0; i < items.length; i++) {
        if (items[i] === name) {
            return i;
        }
    }
}
exports.item_by_name = item_by_name;
function planet_by_name(name) {
    for (var i = 0; i < planets.length; i++) {
        if (planets[i].name === name) {
            return i;
        }
    }
}
exports.planet_by_name = planet_by_name;
var Starship = /** @class */ (function () {
    function Starship(name, cargo_hold_size, planet_name) {
        this.name = name;
        this.cargo_hold_size = cargo_hold_size;
        this.cur_cargo = 0;
        var p = planets[planet_by_name(planet_name)];
        this.localization = p;
        this.x = new ValueWithListeners(p.x);
        this.y = p.y;
        this.item_num = new Array(items.length);
        for (var i = 0; i < items.length; i++) {
            this.item_num[i] = 0;
        }
        this.on_way = false;
        p.add_starship(this);
    }
    Starship.prototype.buy_item = function (idx) {
        var ammount = this.localization.available_items[idx].ammount;
        var price = this.localization.available_items[idx].buy_price;
        if (price > exports.credits.val || ammount === 0 || this.cargo_hold_size === this.cur_cargo) {
            return;
        }
        this.localization.available_items[idx].ammount--; // zmiana
        exports.credits.val -= price; // zmiana
        exports.credits.notify_listeners();
        this.cur_cargo++;
        this.item_num[idx]++;
    };
    Starship.prototype.sell_item = function (idx) {
        if (this.item_num[idx] === 0) {
            return;
        }
        this.localization.available_items[idx].ammount++; // zmiana
        exports.credits.val += this.localization.available_items[idx].sell_price;
        exports.credits.notify_listeners();
        this.cur_cargo--;
        this.item_num[idx]--;
    };
    Starship.prototype.travel = function (p) {
        var _this = this;
        console.log("lece");
        this.on_way = true;
        this.destination = p;
        var dist = Math.sqrt((p.x - this.x.val) * (p.x - this.x.val) + (p.y - this.y) * (p.y - this.y));
        if (dist < 1 / 100) {
            this.x.val = p.x;
            this.y = p.y;
            this.on_way = false;
            this.localization = this.destination;
            p.add_starship(this);
            this.x.notify_listeners();
            return;
        }
        this.x.val = this.x.val + (p.x - this.x.val) / (100 * dist);
        this.y = this.y + (p.y - this.y) / (100 * dist);
        this.x.notify_listeners();
        setTimeout(function () {
            _this.travel(p);
        }, 10);
    };
    return Starship;
}());
exports.Starship = Starship;
var Planet = /** @class */ (function () {
    function Planet(name, available_items, x, y) {
        this.name = name;
        this.available_items = available_items;
        this.x = x;
        this.y = y;
        this.starships = new Array(0);
    }
    Planet.prototype.add_starship = function (starship) {
        this.starships.push(starship);
    };
    Planet.prototype.remove_starship = function (starship) {
        var pos;
        var last = this.starships.length - 1;
        for (var i = 0; i < this.starships.length; i++) {
            if (this.starships[i].name === starship.name) {
                pos = i;
            }
        }
        this.starships[pos] = this.starships[last];
        this.starships.pop();
    };
    return Planet;
}());
exports.Planet = Planet;
var prod0 = new IProduct(3, 5, 2);
var prod1 = new IProduct(5, 2, 1);
var prod2 = new IProduct(1, 2, 5);
var prod = [prod0, prod1, prod2];
var pl0 = new Planet("pl0", [], 3, 5);
var pl1 = new Planet("pl1", prod, 5, 10);
var pl2 = new Planet("pl2", [], 10, 24);
var pl3 = new Planet("pl3", [], 1, 40);
var planets = [pl0, pl1, pl2, pl3];
