var str = window.localStorage.getItem("ranking");
if (str === null) {
    str = '{"ranking": []}';
    window.localStorage.setItem("ranking", str);
}
var name_tab = ["Marek", "Tomek", "Krzysiek", "Janek", "Wojtek"];
var tab = JSON.parse(str);
var tab_el = document.querySelector("body > .container:first-of-type > table.table:first-of-type");
tab_el.appendChild(document.createElement("caption")).textContent = "Najlepsze wyniki";
var tr_el = tab_el.appendChild(document.createElement("tr"));
tr_el.appendChild(document.createElement("th")).textContent = "Miejsce";
tr_el.appendChild(document.createElement("th")).textContent = "Nazwa";
tr_el.appendChild(document.createElement("th")).textContent = "Wynik";
for (var i = 0; i < tab.ranking.length; i++) {
    tr_el = tab_el.appendChild(document.createElement("tr"));
    tr_el.appendChild(document.createElement("th")).textContent = (i + 1).toString();
    tr_el.appendChild(document.createElement("th")).textContent = tab.ranking[i][0];
    tr_el.appendChild(document.createElement("th")).textContent = tab.ranking[i][1].toString();
}
for (var i = tab.ranking.length; i < 10 && i < tab.ranking.length + 5; i++) {
    tr_el = tab_el.appendChild(document.createElement("tr"));
    tr_el.appendChild(document.createElement("th")).textContent = (i + 1).toString();
    tr_el.appendChild(document.createElement("th")).textContent = name_tab[i - tab.ranking.length];
    tr_el.appendChild(document.createElement("th")).textContent = "0";
}
for (var i = tab.ranking.length + 5; i < 10; i++) {
    tr_el = tab_el.appendChild(document.createElement("tr"));
    tr_el.appendChild(document.createElement("th"));
    tr_el.appendChild(document.createElement("th"));
    tr_el.appendChild(document.createElement("th"));
}
fetch("/load").then(function (response) {
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
}).then(function (data) {
    var table_element = document.body.appendChild(document.createElement("table"));
    table_element.appendChild(document.createElement("caption")).textContent = "Mapy:";
    var tr_element = table_element.appendChild(document.createElement("tr"));
    tr_element.appendChild(document.createElement("th")).textContent = "Numer";
    tr_element.appendChild(document.createElement("th")).textContent = "Nazwa";
    for (var i = 0; i < data.length; i++) {
        tr_element = table_element.appendChild(document.createElement("tr"));
        tr_element.appendChild(document.createElement("th")).textContent = (i + 1).toString();
        var name_el = tr_element.appendChild(document.createElement("th"));
        var link_el = name_el.appendChild(document.createElement("a"));
        link_el.textContent = data[i];
        var s = "/map/" + data[i];
        link_el.href = s;
    }
    var select = document.getElementById("mapka");
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var name_1 = data_1[_i];
        select.appendChild(document.createElement("option")).textContent = name_1;
    }
});
