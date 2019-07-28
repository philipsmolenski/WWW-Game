type Time = number;
type Credits = number;

class IProduct {
    public ammount: number;
    public buy_price: number;
    public sell_price: number;
    constructor(ammout: number, buy_price: number, sell_price: number) {
        this.ammount = ammout;
        this.buy_price = buy_price;
        this.sell_price = sell_price;
    }
}

class ValueWithListeners<T> {
    public val: T;
    private listeners: Array<() => void>;
    constructor(val: T) {
        this.val = val;
        this.listeners = [];
    }
    public add_listener(listener: () => void) {
        this.listeners.push(listener);
    }

    public notify_listeners() {
        for (const listener of this.listeners) {
            listener();
        }
    }

    public remove_listener(listener: () => void) {
        const idx = this.listeners.indexOf(listener);
        if (idx === -1) {
            return;
        }
        this.listeners.splice(idx, 1);
    }
}

let items: string[];
const time = new ValueWithListeners<Time>(0);
const credits = new ValueWithListeners<Credits>(0);
let planets: Planet[];
let starships: Starship[];
let len: number;
let svg;

function item_by_name(name: string) {
    for (let i = 0; i < items.length; i++) {
        if (items[i] === name) {
            return i;
        }
    }
}

function planet_by_name(name: string) {
    for (let i = 0; i < planets.length; i++) {
        if (planets[i].name === name) {
            return i;
        }
    }
}

class Starship {
    public name: string;
    public cargo_hold_size: number;
    public cur_cargo;
    public x: ValueWithListeners<number>;
    public y: number;
    public item_num: number[];
    public localization: Planet;
    public on_way: boolean;
    public destination?: Planet;
    constructor(name: string, cargo_hold_size: number, planet_name: string) {
        this.name = name;
        this.cargo_hold_size = cargo_hold_size;
        this.cur_cargo = 0;
        const p: Planet = planets[planet_by_name(planet_name)];
        this.localization = p;
        this.x = new ValueWithListeners(p.x);
        this.y = p.y;
        this.item_num = new Array(items.length);
        for (let i = 0; i < items.length; i++) {
            this.item_num[i] = 0;
        }
        this.on_way = false;
        p.add_starship(this);
    }

    public buy_item(idx: number) {
        const ammount = this.localization.available_items[idx].ammount;
        const price = this.localization.available_items[idx].buy_price;

        if (price > credits.val || ammount === 0 || this.cargo_hold_size === this.cur_cargo) {
            return;
        }

        this.localization.available_items[idx].ammount--;
        credits.val -= price;
        credits.notify_listeners();
        this.cur_cargo++;
        this.item_num[idx]++;
    }

    public sell_item(idx: number) {
        if (this.item_num[idx] === 0) {
            return;
        }

        this.localization.available_items[idx].ammount++;
        credits.val += this.localization.available_items[idx].sell_price;
        credits.notify_listeners();
        this.cur_cargo--;
        this.item_num[idx]--;
    }

    public travel(p: Planet) {
        console.log("lece");
        this.on_way = true;
        this.destination = p;
        const dist = Math.sqrt((p.x - this.x.val) * (p.x - this.x.val) + (p.y - this.y) * (p.y - this.y));
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
        setTimeout(() => {
            this.travel(p);
        }, 100);
    }
}

class Planet {
    public name: string;
    public available_items: IProduct[];
    public x: number;
    public y: number;
    public starships: Starship[];
    constructor(name: string, available_items: IProduct[], x: number, y: number) {
        this.name = name;
        this.available_items = available_items;
        this.x = x;
        this.y = y;
        this.starships = new Array(0);
    }

    public add_starship(starship: Starship) {
        this.starships.push(starship);
    }

    public remove_starship(starship: Starship) {
        let pos: number;
        const last: number = this.starships.length - 1;
        for (let i = 0; i < this.starships.length; i++) {
            if (this.starships[i].name === starship.name) {
                pos = i;
            }
        }
        this.starships[pos] = this.starships[last];
        this.starships.pop();
    }
}

const gameName = window.localStorage.getItem("mapa");
const query = "/game?name=" + gameName;

fetch(query).then((response) => {
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
}).then((data) => {
    time.val = data.game_duration;
    credits.val = data.initial_credits;
    len = data.items.length;
    items = new Array(len);
    planets = new Array(0);
    starships = new Array(0);

    function create_planet_popup(p: Planet) {
        const overlay_element = document.body.appendChild(document.createElement("div"));
        function handler() {
            overlay_element.remove();
        }
        overlay_element.classList.add("overlay");
        overlay_element.id = p.name;
        const popup_element = overlay_element.appendChild(document.createElement("div"));
        popup_element.classList.add("popup");
        popup_element.appendChild(document.createElement("p")).textContent = "Planeta: " + p.name;
        const table_element = popup_element.appendChild(document.createElement("table"));
        table_element.appendChild(document.createElement("caption")).textContent = "Towary:";
        let tr_element = table_element.appendChild(document.createElement("tr"));
        tr_element.appendChild(document.createElement("th")).textContent = "Nazwa";
        tr_element.appendChild(document.createElement("th")).textContent = "Liczba";
        tr_element.appendChild(document.createElement("th")).textContent = "Cena kupna";
        tr_element.appendChild(document.createElement("th")).textContent = "Cena sprzedarzy";
        for (let i = 0; i < items.length; i++) {
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
        const p_element = popup_element.appendChild(document.createElement("p"));
        p_element.classList.add("popstatki");
        p_element.textContent = "Statki";
        const starship_list_el = popup_element.appendChild(document.createElement("ul"));
        starship_list_el.classList.add("lista4");
        for (const starship of p.starships) {
            const starship_element = starship_list_el.appendChild(document.createElement("li"));
            const link_element = starship_element.appendChild(document.createElement("a"));
            link_element.href = "#" + starship.name;
            link_element.textContent = starship.name;
            link_element.addEventListener("click", handler);
            create_starship_popup(starship);
        }
        const close_element = popup_element.appendChild(document.createElement("a"));
        close_element.classList.add("close");
        close_element.innerHTML = "&times;";
        close_element.addEventListener("click", handler);
    }

    function create_starship_popup(s: Starship) {
        const overlay_element = document.body.appendChild(document.createElement("div"));
        function handler() {
            overlay_element.remove();
        }
        overlay_element.classList.add("overlay");
        overlay_element.id = s.name;
        const popup_element = overlay_element.appendChild(document.createElement("div"));
        let loc: string;
        if (s.on_way) {
            loc = "[" + s.localization.name + "->" + s.destination.name + "]";
            popup_element.classList.add("popup3");
        } else {
            loc = "[" + s.localization.name + "]";
            popup_element.classList.add("popup2");
        }
        popup_element.appendChild(document.createElement("h1")).textContent = "Statek: " + s.name;
        let pos_element = document.createElement("p");
        pos_element.textContent = "Położenie: " + s.x.val.toPrecision(3) + " x " + s.y.toPrecision(3) + "\n" + loc;
        popup_element.appendChild(pos_element);

        function x_pop_updater() {
            pos_element.remove();
            if (s.on_way) {
                loc = "[" + s.localization.name + "->" + s.destination.name + "]";
            } else {
                loc = "[" + s.localization.name + "]";
            }
            pos_element = document.createElement("p");
            pos_element.textContent = "Położenie: " + s.x.val.toPrecision(3) + " x " + s.y.toPrecision(3) + "\n" + loc;
            popup_element.appendChild(pos_element);
        }
        s.x.add_listener(x_pop_updater);

        const storage_element = popup_element.appendChild(document.createElement("p"));
        storage_element.classList.add("storage");
        storage_element.textContent = s.cur_cargo + "/" + s.cargo_hold_size;

        let table_element = popup_element.appendChild(document.createElement("table"));
        table_element.appendChild(document.createElement("caption")).textContent = "Ładunek";

        let tr_element = table_element.appendChild(document.createElement("tr"));
        tr_element.appendChild(document.createElement("th")).textContent = "Nazwa";
        tr_element.appendChild(document.createElement("th")).textContent = "Liczba";
        for (const it in s.item_num) {
            if (s.item_num[it] > 0) {
                tr_element = table_element.appendChild(document.createElement("tr"));
                tr_element.appendChild(document.createElement("td")).textContent = items[it];
                tr_element.appendChild(document.createElement("td")).textContent = s.item_num[it].toString();
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

            for (let i = 0; i < items.length; i++) {
                if (s.localization.available_items[i] !== undefined) {
                    tr_element = table_element.appendChild(document.createElement("tr"));
                    tr_element.appendChild(document.createElement("td")).textContent = items[i];
                    let td_element = tr_element.appendChild(document.createElement("td"));
                    td_element.classList.add((200 + i).toString());
                    td_element.textContent = s.localization.available_items[i].ammount.toString();
                    tr_element.appendChild(document.createElement("td")).textContent
                        = s.localization.available_items[i].buy_price.toString();
                    tr_element.appendChild(document.createElement("td")).textContent
                        = s.localization.available_items[i].sell_price.toString();

                    td_element = tr_element.appendChild(document.createElement("td"));
                    let buttton_element = td_element.appendChild(document.createElement("button"));
                    buttton_element.classList.add(i.toString());
                    buttton_element.textContent = "Kup";
                    buttton_element.addEventListener("click", () => {
                        s.buy_item(i);
                        handler();
                        create_starship_popup(s);
                        window.location.assign("#" + s.name);
                    });

                    td_element = tr_element.appendChild(document.createElement("td"));
                    buttton_element = td_element.appendChild(document.createElement("button"));
                    buttton_element.textContent = "Sprzedaj";
                    buttton_element.classList.add((100 + i).toString());
                    buttton_element.addEventListener("click", () => {
                        s.sell_item(i);
                        handler();
                        create_starship_popup(s);
                        window.location.assign("#" + s.name);
                    });
                }
            }

            popup_element.appendChild(document.createElement("p")).textContent = "Wybierz planetę";
            const select_element = popup_element.appendChild(document.createElement("select"));
            for (const p of planets) {
                select_element.appendChild(document.createElement("option")).textContent = p.name;
            }

            const button_element = popup_element.appendChild(document.createElement("button"));
            button_element.textContent = "Podróżuj";
            button_element.addEventListener("click", () => {
                const planetName = select_element.options[select_element.selectedIndex].text;
                s.localization.remove_starship(s);
                handler();
                setTimeout(() => {
                    s.travel(planets[planet_by_name(planetName)]);
                }, 10);
            });
        }

        const close_element = popup_element.appendChild(document.createElement("a"));
        close_element.classList.add("close");
        close_element.innerHTML = "&times;";
        close_element.addEventListener("click", handler);
    }

    for (let i = 0; i < items.length; i++) {
        items[i] = data.items[i];
    }

    for (const planet_name in data.planets) {
        const products: IProduct[] = new Array(items.length);
        for (const item_name in data.planets[planet_name].available_items) {
            const num: number = item_by_name(item_name);
            const ammount: number = data.planets[planet_name].available_items[item_name].available;
            const buy_price: number = data.planets[planet_name].available_items[item_name].buy_price;
            const sell_price: number = data.planets[planet_name].available_items[item_name].sell_price;
            products[num] = new IProduct(ammount, buy_price, sell_price);
        }
        const x: number = data.planets[planet_name].x;
        const y: number = data.planets[planet_name].y;
        planets.push(new Planet(planet_name, products, x, y));
    }

    for (const starship_name in data.starships) {
        const name: string = starship_name;
        const cargo_hold_size = data.starships[starship_name].cargo_hold_size;
        const position = data.starships[starship_name].position;
        starships.push(new Starship(name, cargo_hold_size, position));
    }

    const cont = document.body.appendChild(document.createElement("div"));
    cont.classList.add("container");

    let el = cont.appendChild(document.createElement("p"));
    const nick = window.localStorage.getItem("nick");
    el.textContent = "Mój nick: " + nick;
    el.classList.add("nick");

    const time_element = cont.appendChild(document.createElement("p"));
    const time_element_updater = () => {
        time_element.textContent = "Pozostały czas:" + time.val + "s";
    };

    time_element_updater();
    time.add_listener(time_element_updater);

    const credits_element = cont.appendChild(document.createElement("p"));
    credits_element.classList.add("credits");
    const credits_element_updater = () => {
        credits_element.textContent = "Stan konta: " + credits.val;
    };
    credits_element_updater();
    credits.add_listener(credits_element_updater);

    const time_flow = () => {
        if (time.val === 0) {
            const leaderboard_string = window.localStorage.getItem("ranking");
            const leaderboard = JSON.parse(leaderboard_string);
            const result = [nick, credits.val];
            for (let i = 0; i < leaderboard.ranking.length; i++) {
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

    const planet_list_element = cont.appendChild(document.createElement("ul"));
    planet_list_element.classList.add("lista1");

    for (const planet of planets) {
        const planet_element = planet_list_element.appendChild(document.createElement("li"));
        const link_element = planet_element.appendChild(document.createElement("a"));
        link_element.classList.add("link");
        link_element.href = "#" + planet.name;
        link_element.textContent = planet.name + " ";
        planet_element.appendChild(document.createTextNode(planet.x + " x " + planet.y));

        link_element.addEventListener("click", () => {
            create_planet_popup(planet);
        });
    }

    el = cont.appendChild(document.createElement("h1"));
    el.classList.add("statki");
    el.textContent = "Statki";

    const starship_list_element = cont.appendChild(document.createElement("ul"));
    starship_list_element.classList.add("lista2");

    for (const starship of starships) {
        const starship_element = starship_list_element.appendChild(document.createElement("li"));
        const link_element = starship_element.appendChild(document.createElement("a"));
        link_element.classList.add("link");
        link_element.href = "#" + starship.name;
        link_element.textContent = starship.name + " ";
        link_element.addEventListener("click", () => {
            create_starship_popup(starship);
        });
        let pos: string;
        if (starship.on_way) {
            pos = "[" + starship.localization.name + "->" + starship.destination.name + "]";
        } else {
            pos = "[" + starship.localization.name + "]";
        }
        let text_element = document.createTextNode(starship.x.val.toPrecision(3).toString() + " x "
            + starship.y.toPrecision(3).toString() + " " + pos);
        starship_element.appendChild(text_element);

        const x_updater = () => {
            text_element.remove();
            if (starship.on_way) {
                pos = "[" + starship.localization.name + "->" + starship.destination.name + "]";
            } else {
                pos = "[" + starship.localization.name + "]";
            }
            text_element = document.createTextNode(starship.x.val.toPrecision(3).toString() + " x "
                + starship.y.toPrecision(3).toString() + " " + pos);
            starship_element.appendChild(text_element);
        };
        starship.x.add_listener(x_updater);
    }

    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    document.body.appendChild(svg);

    for (const p of planets) {
        const planet_cir = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        planet_cir.classList.add("circle");
        svg.appendChild(planet_cir);
        planet_cir.setAttribute("cx", (p.x * 5).toString());
        planet_cir.setAttribute("cy", (p.y * 5).toString());
        planet_cir.setAttribute("r", "5");
        planet_cir.setAttribute("fill", "red");
        planet_cir.addEventListener("click", () => {
            create_planet_popup(p);
            window.location.assign("test.html#" + p.name);
        });
    }

    for (const s of starships) {
        let starship_cir = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const cir_updater = () => {
            starship_cir.remove();
            starship_cir = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            starship_cir.classList.add("circle");
            starship_cir.setAttribute("cx", (s.x.val * 5).toString());
            starship_cir.setAttribute("cy", (s.y * 5).toString());
            starship_cir.setAttribute("r", "5");
            starship_cir.setAttribute("fill", "yellow");
            starship_cir.addEventListener("click", () => {
                create_starship_popup(s);
                window.location.assign("test.html#" + s.name);
            });

            if (s.on_way) {
                svg.appendChild(starship_cir);
            }
        };
        s.x.add_listener(cir_updater);
    }

});
