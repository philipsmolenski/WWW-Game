import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as formidable from "express-formidable";
import * as session from "express-session";
import * as fs from "fs";
// import * as csrf from "csurf";
import * as sqlite3 from "sqlite3";
import { promisify } from "util";
const SQLiteStore = require("connect-sqlite3")(session);

const app = express();
const port = 3000;
app.set("view engine", "pug");
app.use(cookieParser());
app.use(formidable());
app.use(express.static("/home/golkarolka/Desktop/www"));
app.set("trust proxy", 1);
app.use(session({
    cookie: { maxAge: 100000 },
    resave: false,
    saveUninitialized: true,
    secret: "Your secret key",
    store: new SQLiteStore,
}));

class User {
    private login: string;
    private password: string;

    constructor(login: string, password: string) {
        this.login = login;
        this.password = password;
    }
}

function createBase() {
    sqlite3.verbose();
    const db = new sqlite3.Database("baza.db");
    // db.run("DROP TABLE users");
    // db.run("DROP TABLE maps");
    db.run("CREATE TABLE maps (name varchar(255), content BLOB);");
    db.run("CREATE TABLE users (login varchar(255), password varchar(255));");
    db.close();
}

// createBase();

function cleanTable() {
    sqlite3.verbose();
    const db = new sqlite3.Database("baza.db");
    // db.run("DROP TABLE users");
    db.run("DELETE FROM maps");
    db.run("DELETE FROM users");
    db.close();
}

// cleanTable();

function addUser(login: string, password: string) {
    sqlite3.verbose();
    const db = new sqlite3.Database("baza.db");
    db.run('INSERT INTO users (login, password) VALUES ("' + login + '", "' + password + '");');
    db.close();
}

function addMap(name: string, content: string) {
    sqlite3.verbose();
    const db = new sqlite3.Database("baza.db");
    console.log(content);
    db.run("INSERT INTO maps (name, content) VALUES ( $name, $content);", {
        $content: content,
        $name: name,
    });
    db.close();
}

function printUsers() {
    sqlite3.verbose();
    const db = new sqlite3.Database("baza.db");
    db.all("SELECT login, password FROM users;", [], (err, rows) => {
        if (err) {
            throw (err);
        }
        for (const { login, password } of rows) {
            console.log(login + " " + password);
        }
        db.close();
    });
}

function printMaps() {
    sqlite3.verbose();
    const db = new sqlite3.Database("baza.db");
    db.all("SELECT name, content FROM maps;", [], (err, rows) => {
        if (err) {
            throw (err);
        }
        for (const { name, content } of rows) {
            console.log(name);
            console.log(content);
        }
        db.close();
    });
}

// printUsers();
// printMaps();

app.listen(port, () => {
    console.log("Server listening on http://localhost:" + port);
});

app.post("/verify_new", (req, res) => {
    const db = new sqlite3.Database("baza.db");
    if (!req.fields.login || !req.fields.password) {
        const s = "Nie wypełniono wszystkich danych rejestracji";
        res.redirect("/fail/?reason=" + s);
        return;
    }
    let b = false;
    const log = req.fields.login;
    const password = req.fields.password;
    db.all("SELECT login FROM users;", [], (err, rows) => {
        if (err) {
            throw (err);
        }
        for (const { login } of rows) {
            if (log === login) {
                const s = "Konto o podanym loginie już istnieje";
                db.close();
                b = true;
                res.redirect("/fail/?reason=" + s);
            }
        }
        if (!b) {
            db.close();
            addUser(log, password);
            const user = new User(log, password);
            req.session.user = user;
            res.redirect("/upload");
        }
    });
});

app.post("/verify", (req, res) => {
    // console.log('aaaa', req.fields);

    // res.status(404);
    // res.type('txt').send('Not Found');
    const db = new sqlite3.Database("baza.db");
    if (!req.fields.login || !req.fields.password) {
        const t = "Nie wypełniono wszystkich danych logowania";
        res.redirect("/fail/?reason=" + t);
        return;
    }
    let b = false;
    const log = req.fields.login;
    const pas = req.fields.password;

    db.all("SELECT login, password FROM users;", [], (err, rows) => {
        if (err) {
            throw (err);
        }
        for (const { login, password } of rows) {
            if (log === login && pas === password) {
                const user = new User(login, password);
                req.session.user = user;
                db.close();
                b = true;
                res.redirect("/upload");
            }
        }
        if (!b) {
            db.close();
            const s = "Podano nieprawidłowy login lub hasło";
            res.redirect("/fail/?reason=" + s);
        }
    });
});

app.post("/verify_file", (req, res) => {
    const name = req.fields.name;
    const path = req.files.file.path;
    fs.open(path, "r", (err, fd) => {
        if (err) {
            console.log("Nie udało się otworzyć pliku :(", err);
            return;
        }
        fs.readFile(path, function read(error, data) {
            if (error) {
                console.log("Nie udało się przeczytać pliku :(", err);
                return;
            }
            verifyGame(name, data.toString()).then((oks) => {
                let okok = true;
                if (oks) {
                    addMap(name, data.toString());
                } else {
                    okok = false;
                    const s = "Mapka o podanej nazwie już istnieje";
                    res.redirect("/fail/?reason=" + s);
                }
                fs.close(fd, () => {
                    if (okok) {
                        res.redirect("/main.html");
                    }
                });
            });
        });
    });
});

app.get("/load", (req, res) => {
    sqlite3.verbose();
    const arr = [];
    const db = new sqlite3.Database("baza.db");
    db.all("SELECT name FROM maps;", [], (err, rows) => {
        if (err) {
            throw (err);
        }
        for (const {name} of rows) {
            arr.push(name);
        }
        db.close();
        res.send(JSON.stringify(arr));
    });
});

app.get("/game", (req, res) => {
    sqlite3.verbose();
    const arr = [];
    const db = new sqlite3.Database("baza.db");
    const name = req.query.name;
    db.all("SELECT content FROM maps WHERE name = '" + name + "';", [], (err, rows) => {
        if (err) {
            throw (err);
        }
        for (const {content} of rows) {
            res.send(content);
            arr.push(name);
        }
        db.close();
    });
});

app.get("/map/:name", (req, res) => {
    const mapName = req.params.name;
    sqlite3.verbose();
    const arr = [];
    const db = new sqlite3.Database("baza.db");
    db.all("SELECT content FROM maps WHERE name = '" + mapName + "';", [], (err, rows) => {
        if (err) {
            throw (err);
        }
        for (const {content} of rows) {
            res.render("map", {game : JSON.parse(content)});
        }
        db.close();
    });
});

function verifyGame(mapName: string, contnet: string) {
    sqlite3.verbose();
    const db = new sqlite3.Database("baza.db");
    const promes = promisify(db.all.bind(db))("SELECT name FROM maps;", [])
    .then((rows) => {
        let oks = true;
        for (const { name } of rows) {
            if (name === mapName) {
                console.log(name + " name");
                console.log(mapName + " mapName");
                oks = false;
                break;
            }
        }

        db.close();
        console.log(oks);
        return oks;
    });

    return promes;
}

app.get("/upload", (req, res) => {
    if (!req.session.user) {
        res.redirect("/check");
    } else {
        res.render("upload");
    }
});

app.get("/check", (req, res) => {
    res.render("check");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/fail", (req, res) => {
    const s = req.query.reason;
    res.render("fail", { reason: s });
});

// app.get("/", function (req, res) {
//     res.send("Hello world!");
// });

// app.post("/liczba", function (req, res) {
//     const l = req.fields.liczba;
//     const k = req.fields.klucz;
//     wpiszDane(k, l);
// });

// app.get("/kupa", function (req, res) {
//     let db = new sqlite3.Database('baza.db');
//     db.all('SELECT klucz, liczba FROM liczby;', [], (err, rows) => {
//         if (err) throw (err);
//         for (let { klucz, liczba } of rows) {
//             console.log(klucz + '->' + liczba);
//         }
//         db.close();
//     });
// });
