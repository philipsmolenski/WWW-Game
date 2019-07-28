type Time = number;
type Credits = number;

export class IProduct {
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

let items = ["złoto", "srebro", "brąz"];
const time = new ValueWithListeners<Time>(0);
export const credits = new ValueWithListeners<Credits>(100);
let starships: Starship[];
let len: number;

export function item_by_name(name: string) {
    for (let i = 0; i < items.length; i++) {
        if (items[i] === name) {
            return i;
        }
    }
}

export function planet_by_name(name: string) {
    for (let i = 0; i < planets.length; i++) {
        if (planets[i].name === name) {
            return i;
        }
    }
}

export class Starship {
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

        this.localization.available_items[idx].ammount--;  // zmiana
        credits.val -= price; // zmiana
        credits.notify_listeners();
        this.cur_cargo++;
        this.item_num[idx]++;
    }

    public sell_item(idx: number) {
        if (this.item_num[idx] === 0) {
            return;
        }

        this.localization.available_items[idx].ammount++; // zmiana
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
        setTimeout(() => {
            this.travel(p);
        }, 10);
    }
}

export class Planet {
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

const prod0 = new IProduct(3, 5, 2);
const prod1 = new IProduct(5, 2, 1);
const prod2 = new IProduct(1, 2, 5);

const prod = [prod0, prod1, prod2];

const pl0 = new Planet("pl0", [], 3, 5);
const pl1 = new Planet("pl1", prod, 5, 10);
const pl2 = new Planet("pl2", [], 10, 24);
const pl3 = new Planet("pl3", [], 1, 40);
const planets = [pl0, pl1, pl2, pl3];
