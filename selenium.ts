import { expect } from "chai";
import { driver } from "mocha-webdriver";
import { Builder, Capabilities } from "selenium-webdriver";

describe("nickname test", () => {
    it("should have nick Jan Woreczko", async function() {
        this.timeout(20000);
        await driver.get("file:///home/golkarolka/Desktop/www/main.html");
        await driver.find("a[class='button']").doClick();
        await driver.find("input[type=text]").sendKeys("Jan Woreczko");
        await driver.find("button").doClick();
        expect(await driver.find("p[class='nick']").getText()).to.equal("Mój nick: Jan Woreczko");
    });
});

describe("buy", () => {
    it("game screen test", async function() {
        this.timeout(20000);
        await driver.get("file:///home/golkarolka/Desktop/www/test.html");
        await driver.find("a[href='#Enterprise']").doClick();
        for (let i = 0; i < 10000000;) {i++; } // czekamy aż popup się otworzy
        expect(await driver.find("p[class='storage']").getText()).to.equal("0/46");
        expect(await driver.find("td[class='204']").getText()).to.equal("11");
        await driver.find("button[class='4']").doClick();
        expect(await driver.find("p[class='storage']").getText()).to.equal("1/46");
        expect(await driver.find("td[class='204']").getText()).to.equal("10");
        for (let i = 0; i < 20; i++) {
            await driver.find("button[class='4']").doClick();
        }
        expect(await driver.find("p[class='storage']").getText()).to.equal("11/46"); // bo jest 11 dostępnych towarów
        expect(await driver.find("td[class='204']").getText()).to.equal("0");
        for (let i = 0; i < 6; i++) {
            await driver.find("button[class='104']").doClick();
        }
        expect(await driver.find("p[class='storage']").getText()).to.equal("5/46"); // bo jest 11 dostępnych towarów
        expect(await driver.find("td[class='204']").getText()).to.equal("6");
        for (let i = 0; i < 15; i++) {
            await driver.find("button[class='104']").doClick();
        }
        expect(await driver.find("p[class='storage']").getText()).to.equal("0/46"); // bo jest 11 dostępnych towarów
        expect(await driver.find("td[class='204']").getText()).to.equal("11");
        await driver.find("a[class='close']").doClick();
        expect(await driver.find("p[class='credits']").getText()).to.equal("Stan konta: 1940");
    });
});
