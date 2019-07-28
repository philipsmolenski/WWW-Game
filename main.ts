let str = window.localStorage.getItem("ranking");

if (str === null) {
    str = '{"ranking": []}';
    window.localStorage.setItem("ranking", str);
}

const name_tab = ["Marek", "Tomek", "Krzysiek", "Janek", "Wojtek"];
const tab = JSON.parse(str);

let tab_el = document.querySelector("body > .container:first-of-type > table.table:first-of-type");
tab_el.appendChild(document.createElement("caption")).textContent = "Najlepsze wyniki";
let tr_el = tab_el.appendChild(document.createElement("tr"));
tr_el.appendChild(document.createElement("th")).textContent = "Miejsce";
tr_el.appendChild(document.createElement("th")).textContent = "Nazwa";
tr_el.appendChild(document.createElement("th")).textContent = "Wynik";

for (let i = 0; i < tab.ranking.length; i++) {
    tr_el = tab_el.appendChild(document.createElement("tr"));
    tr_el.appendChild(document.createElement("th")).textContent = (i + 1).toString();
    tr_el.appendChild(document.createElement("th")).textContent = tab.ranking[i][0];
    tr_el.appendChild(document.createElement("th")).textContent = tab.ranking[i][1].toString();
}

for (let i = tab.ranking.length; i < 10 && i < tab.ranking.length + 5; i++) {
    tr_el = tab_el.appendChild(document.createElement("tr"));
    tr_el.appendChild(document.createElement("th")).textContent = (i + 1).toString();
    tr_el.appendChild(document.createElement("th")).textContent = name_tab[i - tab.ranking.length];
    tr_el.appendChild(document.createElement("th")).textContent = "0";
}

for (let i = tab.ranking.length + 5; i < 10; i++) {
    tr_el = tab_el.appendChild(document.createElement("tr"));
    tr_el.appendChild(document.createElement("th"));
    tr_el.appendChild(document.createElement("th"));
    tr_el.appendChild(document.createElement("th"));
}

fetch("/load").then((response) => {
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
}).then((data) => {
    const table_element = document.body.appendChild(document.createElement("table"));
    table_element.appendChild(document.createElement("caption")).textContent = "Mapy:";
    let tr_element = table_element.appendChild(document.createElement("tr"));
    tr_element.appendChild(document.createElement("th")).textContent = "Numer";
    tr_element.appendChild(document.createElement("th")).textContent = "Nazwa";
    for (let i = 0; i < data.length; i++) {
        tr_element = table_element.appendChild(document.createElement("tr"));
        tr_element.appendChild(document.createElement("th")).textContent = (i + 1).toString();
        const name_el = tr_element.appendChild(document.createElement("th"));
        const link_el = name_el.appendChild(document.createElement("a"));
        link_el.textContent = data[i];
        const s = "/map/" + data[i];
        link_el.href = s;
    }

    const select = document.getElementById("mapka");
    for (const name of data) {
        select.appendChild(document.createElement("option")).textContent = name;
    }
});
