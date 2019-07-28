var IProduct = /** @class */ (function () {
    function IProduct(ammout, buy_price, sell_price) {
        this.ammount = ammout;
        this.buy_price = buy_price;
        this.sell_price = sell_price;
    }
    return IProduct;
}());
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
var items;
var time = new ValueWithListeners(0);
var credits = new ValueWithListeners(0);
var planets;
var starships;
var len;
var svg;
function item_by_name(name) {
    for (var i = 0; i < items.length; i++) {
        if (items[i] === name) {
            return i;
        }
    }
}
function planet_by_name(name) {
    for (var i = 0; i < planets.length; i++) {
        if (planets[i].name === name) {
            return i;
        }
    }
}
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
        if (price > credits.val || ammount === 0 || this.cargo_hold_size === this.cur_cargo) {
            return;
        }
        this.localization.available_items[idx].ammount--;
        credits.val -= price;
        credits.notify_listeners();
        this.cur_cargo++;
        this.item_num[idx]++;
    };
    Starship.prototype.sell_item = function (idx) {
        if (this.item_num[idx] === 0) {
            return;
        }
        this.localization.available_items[idx].ammount++;
        credits.val += this.localization.available_items[idx].sell_price;
        credits.notify_listeners();
        this.cur_cargo--;
        this.item_num[idx]--;
    };
    Starship.prototype.travel = function (p) {
        var _this = this;
        console.log("lece");
        this.on_way = true;
        this.destination = p;
        var dist = Math.sqrt((p.x - this.x.val) * (p.x - this.x.val) + (p.y - this.y) * (p.y - this.y));
        if (dist < 1 / 10) {
            this.x.val = p.x;
            this.y = p.y;
            this.on_way = false;
            this.localization = this.destination;
            p.add_starship(this);
            this.x.notify_listeners();
            return;
        }
        this.x.val = this.x.val + (p.x - this.x.val) / (10 * dist);
        this.y = this.y + (p.y - this.y) / (10 * dist);
        this.x.notify_listeners();
        setTimeout(function () {
            _this.travel(p);
        }, 100);
    };
    return Starship;
}());
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
var gameName = window.localStorage.getItem("mapa");
var query = "/game?name=" + gameName;
fetch(query).then(function (response) {
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
}).then(function (data) {
    time.val = data.game_duration;
    credits.val = data.initial_credits;
    len = data.items.length;
    items = new Array(len);
    planets = new Array(0);
    starships = new Array(0);
    function create_planet_popup(p) {
        var overlay_element = document.body.appendChild(document.createElement("div"));
        function handler() {
            overlay_element.remove();
        }
        overlay_element.classList.add("overlay");
        overlay_element.id = p.name;
        var popup_element = overlay_element.appendChild(document.createElement("div"));
        popup_element.classList.add("popup");
        popup_element.appendChild(document.createElement("p")).textContent = "Planeta: " + p.name;
        var table_element = popup_element.appendChild(document.createElement("table"));
        table_element.appendChild(document.createElement("caption")).textContent = "Towary:";
        var tr_element = table_element.appendChild(document.createElement("tr"));
        tr_element.appendChild(document.createElement("th")).textContent = "Nazwa";
        tr_element.appendChild(document.createElement("th")).textContent = "Liczba";
        tr_element.appendChild(document.createElement("th")).textContent = "Cena kupna";
        tr_element.appendChild(document.createElement("th")).textContent = "Cena sprzedarzy";
        for (var i = 0; i < items.length; i++) {
            if (p.available_items[i] !== undefined) {
                tr_element = table_element.appendChild(document.createElement("tr"));
                tr_element.appendChild(document.createElement("th")).textContent = items[i];
                tr_element.appendChild(document.createElement("th")).textContent
                    = p.available_items[i].ammount.toString();
                tr_element.appendChild(document.createElement("th")).textContent
                    = p.available_items[i].buy_price.toString();
                tr_element.appendChild(document.createElement("th")).textContent
                    = p.available_items[i].sell_price.toString();
            }
        }
        var p_element = popup_element.appendChild(document.createElement("p"));
        p_element.classList.add("popstatki");
        p_element.textContent = "Statki";
        var starship_list_el = popup_element.appendChild(document.createElement("ul"));
        starship_list_el.classList.add("lista4");
        for (var _i = 0, _a = p.starships; _i < _a.length; _i++) {
            var starship = _a[_i];
            var starship_element = starship_list_el.appendChild(document.createElement("li"));
            var link_element = starship_element.appendChild(document.createElement("a"));
            link_element.href = "#" + starship.name;
            link_element.textContent = starship.name;
            link_element.addEventListener("click", handler);
            create_starship_popup(starship);
        }
        var close_element = popup_element.appendChild(document.createElement("a"));
        close_element.classList.add("close");
        close_element.innerHTML = "&times;";
        close_element.addEventListener("click", handler);
    }
    function create_starship_popup(s) {
        var overlay_element = document.body.appendChild(document.createElement("div"));
        function handler() {
            overlay_element.remove();
        }
        overlay_element.classList.add("overlay");
        overlay_element.id = s.name;
        var popup_element = overlay_element.appendChild(document.createElement("div"));
        var loc;
        if (s.on_way) {
            loc = "[" + s.localization.name + "->" + s.destination.name + "]";
            popup_element.classList.add("popup3");
        }
        else {
            loc = "[" + s.localization.name + "]";
            popup_element.classList.add("popup2");
        }
        popup_element.appendChild(document.createElement("h1")).textContent = "Statek: " + s.name;
        var pos_element = document.createElement("p");
        pos_element.textContent = "Położenie: " + s.x.val.toPrecision(3) + " x " + s.y.toPrecision(3) + "\n" + loc;
        popup_element.appendChild(pos_element);
        function x_pop_updater() {
            pos_element.remove();
            if (s.on_way) {
                loc = "[" + s.localization.name + "->" + s.destination.name + "]";
            }
            else {
                loc = "[" + s.localization.name + "]";
            }
            pos_element = document.createElement("p");
            pos_element.textContent = "Położenie: " + s.x.val.toPrecision(3) + " x " + s.y.toPrecision(3) + "\n" + loc;
            popup_element.appendChild(pos_element);
        }
        s.x.add_listener(x_pop_updater);
        var storage_element = popup_element.appendChild(document.createElement("p"));
        storage_element.classList.add("storage");
        storage_element.textContent = s.cur_cargo + "/" + s.cargo_hold_size;
        var table_element = popup_element.appendChild(document.createElement("table"));
        table_element.appendChild(document.createElement("caption")).textContent = "Ładunek";
        var tr_element = table_element.appendChild(document.createElement("tr"));
        tr_element.appendChild(document.createElement("th")).textContent = "Nazwa";
        tr_element.appendChild(document.createElement("th")).textContent = "Liczba";
        for (var it_1 in s.item_num) {
            if (s.item_num[it_1] > 0) {
                tr_element = table_element.appendChild(document.createElement("tr"));
                tr_element.appendChild(document.createElement("td")).textContent = items[it_1];
                tr_element.appendChild(document.createElement("td")).textContent = s.item_num[it_1].toString();
            }
        }
        if (!s.on_way) {
            table_element = popup_element.appendChild(document.createElement("table"));
            table_element.appendChild(document.createElement("caption")).textContent = "Targowisko";
            tr_element = table_element.appendChild(document.createElement("tr"));
            tr_element.appendChild(document.createElement("th")).textContent = "Nazwa";
            tr_element.appendChild(document.createElement("th")).textContent = "Dostępne";
            tr_element.appendChild(document.createElement("th")).textContent = "Cena kupna";
            tr_element.appendChild(document.createElement("th")).textContent = "Cena sprzedaży";
            tr_element.appendChild(document.createElement("th"));
            tr_element.appendChild(document.createElement("th"));
            var _loop_5 = function (i) {
                if (s.localization.available_items[i] !== undefined) {
                    tr_element = table_element.appendChild(document.createElement("tr"));
                    tr_element.appendChild(document.createElement("td")).textContent = items[i];
                    var td_element = tr_element.appendChild(document.createElement("td"));
                    td_element.classList.add((200 + i).toString());
                    td_element.textContent = s.localization.available_items[i].ammount.toString();
                    tr_element.appendChild(document.createElement("td")).textContent
                        = s.localization.available_items[i].buy_price.toString();
                    tr_element.appendChild(document.createElement("td")).textContent
                        = s.localization.available_items[i].sell_price.toString();
                    td_element = tr_element.appendChild(document.createElement("td"));
                    var buttton_element = td_element.appendChild(document.createElement("button"));
                    buttton_element.classList.add(i.toString());
                    buttton_element.textContent = "Kup";
                    buttton_element.addEventListener("click", function () {
                        s.buy_item(i);
                        handler();
                        create_starship_popup(s);
                        window.location.assign("#" + s.name);
                    });
                    td_element = tr_element.appendChild(document.createElement("td"));
                    buttton_element = td_element.appendChild(document.createElement("button"));
                    buttton_element.textContent = "Sprzedaj";
                    buttton_element.classList.add((100 + i).toString());
                    buttton_element.addEventListener("click", function () {
                        s.sell_item(i);
                        handler();
                        create_starship_popup(s);
                        window.location.assign("#" + s.name);
                    });
                }
            };
            for (var i = 0; i < items.length; i++) {
                _loop_5(i);
            }
            popup_element.appendChild(document.createElement("p")).textContent = "Wybierz planetę";
            var select_element_1 = popup_element.appendChild(document.createElement("select"));
            for (var _i = 0, planets_3 = planets; _i < planets_3.length; _i++) {
                var p = planets_3[_i];
                select_element_1.appendChild(document.createElement("option")).textContent = p.name;
            }
            var button_element = popup_element.appendChild(document.createElement("button"));
            button_element.textContent = "Podróżuj";
            button_element.addEventListener("click", function () {
                var planetName = select_element_1.options[select_element_1.selectedIndex].text;
                s.localization.remove_starship(s);
                handler();
                setTimeout(function () {
                    s.travel(planets[planet_by_name(planetName)]);
                }, 10);
            });
        }
        var close_element = popup_element.appendChild(document.createElement("a"));
        close_element.classList.add("close");
        close_element.innerHTML = "&times;";
        close_element.addEventListener("click", handler);
    }
    for (var i = 0; i < items.length; i++) {
        items[i] = data.items[i];
    }
    for (var planet_name in data.planets) {
        var products = new Array(items.length);
        for (var item_name in data.planets[planet_name].available_items) {
            var num = item_by_name(item_name);
            var ammount = data.planets[planet_name].available_items[item_name].available;
            var buy_price = data.planets[planet_name].available_items[item_name].buy_price;
            var sell_price = data.planets[planet_name].available_items[item_name].sell_price;
            products[num] = new IProduct(ammount, buy_price, sell_price);
        }
        var x = data.planets[planet_name].x;
        var y = data.planets[planet_name].y;
        planets.push(new Planet(planet_name, products, x, y));
    }
    for (var starship_name in data.starships) {
        var name_1 = starship_name;
        var cargo_hold_size = data.starships[starship_name].cargo_hold_size;
        var position = data.starships[starship_name].position;
        starships.push(new Starship(name_1, cargo_hold_size, position));
    }
    var cont = document.body.appendChild(document.createElement("div"));
    cont.classList.add("container");
    var el = cont.appendChild(document.createElement("p"));
    var nick = window.localStorage.getItem("nick");
    el.textContent = "Mój nick: " + nick;
    el.classList.add("nick");
    var time_element = cont.appendChild(document.createElement("p"));
    var time_element_updater = function () {
        time_element.textContent = "Pozostały czas:" + time.val + "s";
    };
    time_element_updater();
    time.add_listener(time_element_updater);
    var credits_element = cont.appendChild(document.createElement("p"));
    credits_element.classList.add("credits");
    var credits_element_updater = function () {
        credits_element.textContent = "Stan konta: " + credits.val;
    };
    credits_element_updater();
    credits.add_listener(credits_element_updater);
    var time_flow = function () {
        if (time.val === 0) {
            var leaderboard_string = window.localStorage.getItem("ranking");
            var leaderboard = JSON.parse(leaderboard_string);
            var result = [nick, credits.val];
            for (var i = 0; i < leaderboard.ranking.length; i++) {
                if (leaderboard.ranking[i][1] < credits.val) {
                    leaderboard.ranking.splice(i, 0, result);
                    break;
                }
            }
            if (leaderboard.ranking.length === 0
                || leaderboard.ranking[leaderboard.ranking.length - 1][1] >= credits.val) {
                leaderboard.ranking.push(result);
            }
            if (leaderboard.ranking.length === 11) {
                leaderboard.ranking.pop();
            }
            console.log(leaderboard.ranking);
            window.localStorage.setItem("ranking", JSON.stringify(leaderboard));
            window.location.assign("main.html");
            return;
        }
        time.val--;
        time.notify_listeners();
        setTimeout(time_flow, 1000);
    };
    setTimeout(time_flow, 1000);
    el = cont.appendChild(document.createElement("h1"));
    el.classList.add("planety");
    el.textContent = "Planety";
    var planet_list_element = cont.appendChild(document.createElement("ul"));
    planet_list_element.classList.add("lista1");
    var _loop_1 = function (planet) {
        var planet_element = planet_list_element.appendChild(document.createElement("li"));
        var link_element = planet_element.appendChild(document.createElement("a"));
        link_element.classList.add("link");
        link_element.href = "#" + planet.name;
        link_element.textContent = planet.name + " ";
        planet_element.appendChild(document.createTextNode(planet.x + " x " + planet.y));
        link_element.addEventListener("click", function () {
            create_planet_popup(planet);
        });
    };
    for (var _i = 0, planets_1 = planets; _i < planets_1.length; _i++) {
        var planet = planets_1[_i];
        _loop_1(planet);
    }
    el = cont.appendChild(document.createElement("h1"));
    el.classList.add("statki");
    el.textContent = "Statki";
    var starship_list_element = cont.appendChild(document.createElement("ul"));
    starship_list_element.classList.add("lista2");
    var _loop_2 = function (starship) {
        var starship_element = starship_list_element.appendChild(document.createElement("li"));
        var link_element = starship_element.appendChild(document.createElement("a"));
        link_element.classList.add("link");
        link_element.href = "#" + starship.name;
        link_element.textContent = starship.name + " ";
        link_element.addEventListener("click", function () {
            create_starship_popup(starship);
        });
        var pos;
        if (starship.on_way) {
            pos = "[" + starship.localization.name + "->" + starship.destination.name + "]";
        }
        else {
            pos = "[" + starship.localization.name + "]";
        }
        var text_element = document.createTextNode(starship.x.val.toPrecision(3).toString() + " x "
            + starship.y.toPrecision(3).toString() + " " + pos);
        starship_element.appendChild(text_element);
        var x_updater = function () {
            text_element.remove();
            if (starship.on_way) {
                pos = "[" + starship.localization.name + "->" + starship.destination.name + "]";
            }
            else {
                pos = "[" + starship.localization.name + "]";
            }
            text_element = document.createTextNode(starship.x.val.toPrecision(3).toString() + " x "
                + starship.y.toPrecision(3).toString() + " " + pos);
            starship_element.appendChild(text_element);
        };
        starship.x.add_listener(x_updater);
    };
    for (var _a = 0, starships_1 = starships; _a < starships_1.length; _a++) {
        var starship = starships_1[_a];
        _loop_2(starship);
    }
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    document.body.appendChild(svg);
    var _loop_3 = function (p) {
        var planet_cir = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        planet_cir.classList.add("circle");
        svg.appendChild(planet_cir);
        planet_cir.setAttribute("cx", (p.x * 5).toString());
        planet_cir.setAttribute("cy", (p.y * 5).toString());
        planet_cir.setAttribute("r", "5");
        planet_cir.setAttribute("fill", "red");
        planet_cir.addEventListener("click", function () {
            create_planet_popup(p);
            window.location.assign("test.html#" + p.name);
        });
    };
    for (var _b = 0, planets_2 = planets; _b < planets_2.length; _b++) {
        var p = planets_2[_b];
        _loop_3(p);
    }
    var _loop_4 = function (s) {
        var starship_cir = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        var cir_updater = function () {
            starship_cir.remove();
            starship_cir = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            starship_cir.classList.add("circle");
            starship_cir.setAttribute("cx", (s.x.val * 5).toString());
            starship_cir.setAttribute("cy", (s.y * 5).toString());
            starship_cir.setAttribute("r", "5");
            starship_cir.setAttribute("fill", "yellow");
            starship_cir.addEventListener("click", function () {
                create_starship_popup(s);
                window.location.assign("test.html#" + s.name);
            });
            if (s.on_way) {
                svg.appendChild(starship_cir);
            }
        };
        s.x.add_listener(cir_updater);
    };
    for (var _c = 0, starships_2 = starships; _c < starships_2.length; _c++) {
        var s = starships_2[_c];
        _loop_4(s);
    }
});
