"use strict";
exports.__esModule = true;
var cookieParser = require("cookie-parser");
var express = require("express");
var formidable = require("express-formidable");
var session = require("express-session");
var fs = require("fs");
// import * as csrf from "csurf";
var sqlite3 = require("sqlite3");
var util_1 = require("util");
var SQLiteStore = require("connect-sqlite3")(session);
var app = express();
var port = 3000;
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
    store: new SQLiteStore
}));
var User = /** @class */ (function () {
    function User(login, password) {
        this.login = login;
        this.password = password;
    }
    return User;
}());
function createBase() {
    sqlite3.verbose();
    var db = new sqlite3.Database("baza.db");
    // db.run("DROP TABLE users");
    // db.run("DROP TABLE maps");
    db.run("CREATE TABLE maps (name varchar(255), content BLOB);");
    db.run("CREATE TABLE users (login varchar(255), password varchar(255));");
    db.close();
}
// createBase();
function cleanTable() {
    sqlite3.verbose();
    var db = new sqlite3.Database("baza.db");
    // db.run("DROP TABLE users");
    db.run("DELETE FROM maps");
    db.run("DELETE FROM users");
    db.close();
}
// cleanTable();
function addUser(login, password) {
    sqlite3.verbose();
    var db = new sqlite3.Database("baza.db");
    db.run('INSERT INTO users (login, password) VALUES ("' + login + '", "' + password + '");');
    db.close();
}
function addMap(name, content) {
    sqlite3.verbose();
    var db = new sqlite3.Database("baza.db");
    console.log(content);
    db.run("INSERT INTO maps (name, content) VALUES ( $name, $content);", {
        $content: content,
        $name: name
    });
    db.close();
}
function printUsers() {
    sqlite3.verbose();
    var db = new sqlite3.Database("baza.db");
    db.all("SELECT login, password FROM users;", [], function (err, rows) {
        if (err) {
            throw (err);
        }
        for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
            var _a = rows_1[_i], login = _a.login, password = _a.password;
            console.log(login + " " + password);
        }
        db.close();
    });
}
function printMaps() {
    sqlite3.verbose();
    var db = new sqlite3.Database("baza.db");
    db.all("SELECT name, content FROM maps;", [], function (err, rows) {
        if (err) {
            throw (err);
        }
        for (var _i = 0, rows_2 = rows; _i < rows_2.length; _i++) {
            var _a = rows_2[_i], name_1 = _a.name, content = _a.content;
            console.log(name_1);
            console.log(content);
        }
        db.close();
    });
}
// printUsers();
// printMaps();
app.listen(port, function () {
    console.log("Server listening on http://localhost:" + port);
});
app.post("/verify_new", function (req, res) {
    var db = new sqlite3.Database("baza.db");
    if (!req.fields.login || !req.fields.password) {
        var s = "Nie wypełniono wszystkich danych rejestracji";
        res.redirect("/fail/?reason=" + s);
        return;
    }
    var b = false;
    var log = req.fields.login;
    var password = req.fields.password;
    db.all("SELECT login FROM users;", [], function (err, rows) {
        if (err) {
            throw (err);
        }
        for (var _i = 0, rows_3 = rows; _i < rows_3.length; _i++) {
            var login = rows_3[_i].login;
            if (log === login) {
                var s = "Konto o podanym loginie już istnieje";
                db.close();
                b = true;
                res.redirect("/fail/?reason=" + s);
            }
        }
        if (!b) {
            db.close();
            addUser(log, password);
            var user = new User(log, password);
            req.session.user = user;
            res.redirect("/upload");
        }
    });
});
app.post("/verify", function (req, res) {
    // console.log('aaaa', req.fields);
    // res.status(404);
    // res.type('txt').send('Not Found');
    var db = new sqlite3.Database("baza.db");
    if (!req.fields.login || !req.fields.password) {
        var t = "Nie wypełniono wszystkich danych logowania";
        res.redirect("/fail/?reason=" + t);
        return;
    }
    var b = false;
    var log = req.fields.login;
    var pas = req.fields.password;
    db.all("SELECT login, password FROM users;", [], function (err, rows) {
        if (err) {
            throw (err);
        }
        for (var _i = 0, rows_4 = rows; _i < rows_4.length; _i++) {
            var _a = rows_4[_i], login = _a.login, password = _a.password;
            if (log === login && pas === password) {
                var user = new User(login, password);
                req.session.user = user;
                db.close();
                b = true;
                res.redirect("/upload");
            }
        }
        if (!b) {
            db.close();
            var s = "Podano nieprawidłowy login lub hasło";
            res.redirect("/fail/?reason=" + s);
        }
    });
});
app.post("/verify_file", function (req, res) {
    var name = req.fields.name;
    var path = req.files.file.path;
    fs.open("plik.txt", "r", function (err, fd) {
        if (err) {
            console.log("Nie udało się otworzyć pliku :(", err);
            return;
        }
        fs.readFile(path, function read(error, data) {
            if (error) {
                console.log("Nie udało się przeczytać pliku :(", err);
                return;
            }
            verifyGame(name, data.toString()).then(function (oks) {
                var okok = true;
                if (oks) {
                    addMap(name, data.toString());
                }
                else {
                    okok = false;
                    var s = "Mapka o podanej nazwie już istnieje";
                    res.redirect("/fail/?reason=" + s);
                }
                fs.close(fd, function () {
                    if (okok) {
                        res.redirect("/main.html");
                    }
                });
            });
        });
    });
});
app.get("/load", function (req, res) {
    sqlite3.verbose();
    var arr = [];
    var db = new sqlite3.Database("baza.db");
    db.all("SELECT name FROM maps;", [], function (err, rows) {
        if (err) {
            throw (err);
        }
        for (var _i = 0, rows_5 = rows; _i < rows_5.length; _i++) {
            var name_2 = rows_5[_i].name;
            arr.push(name_2);
        }
        db.close();
        res.send(JSON.stringify(arr));
    });
});
app.get("/game", function (req, res) {
    sqlite3.verbose();
    var arr = [];
    var db = new sqlite3.Database("baza.db");
    var name = req.query.name;
    db.all("SELECT content FROM maps WHERE name = '" + name + "';", [], function (err, rows) {
        if (err) {
            throw (err);
        }
        for (var _i = 0, rows_6 = rows; _i < rows_6.length; _i++) {
            var content = rows_6[_i].content;
            res.send(content);
            arr.push(name);
        }
        db.close();
    });
});
app.get("/map/:name", function (req, res) {
    var mapName = req.params.name;
    sqlite3.verbose();
    var arr = [];
    var db = new sqlite3.Database("baza.db");
    db.all("SELECT content FROM maps WHERE name = '" + mapName + "';", [], function (err, rows) {
        if (err) {
            throw (err);
        }
        for (var _i = 0, rows_7 = rows; _i < rows_7.length; _i++) {
            var content = rows_7[_i].content;
            res.render("map", { game: JSON.parse(content) });
        }
        db.close();
    });
});
function verifyGame(mapName, contnet) {
    sqlite3.verbose();
    var db = new sqlite3.Database("baza.db");
    var promes = util_1.promisify(db.all.bind(db))("SELECT name FROM maps;", [])
        .then(function (rows) {
        var oks = true;
        for (var _i = 0, rows_8 = rows; _i < rows_8.length; _i++) {
            var name_3 = rows_8[_i].name;
            if (name_3 === mapName) {
                console.log(name_3 + " name");
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
app.get("/upload", function (req, res) {
    if (!req.session.user) {
        res.redirect("/check");
    }
    else {
        res.render("upload");
    }
});
app.get("/check", function (req, res) {
    res.render("check");
});
app.get("/register", function (req, res) {
    res.render("register");
});
app.get("/login", function (req, res) {
    res.render("login");
});
app.get("/fail", function (req, res) {
    var s = req.query.reason;
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
