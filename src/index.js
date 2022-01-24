import Crawler from "./Crawler";
import cheerio from "cheerio";
import https from "https";

https.get("https://edt.iut-orsay.fr/edt_invite.php", (res) => {
    let data = "";
    res.on("data", (chunk) => {
        data += chunk;
    });
    res.on("end", () => {
        const $ = cheerio.load(data);
        const crawler = new Crawler($);
        let myGroups = crawler.getGroups();
        for(let group of myGroups){
            https.get(crawler.updateDOMUrl(group), (res2) => {
                let data2 = "";
                res2.on("data", (chunk) => {
                    data2 += chunk;
                });
                res2.on("end", () => {
                    const $2 = cheerio.load(data2);
                    crawler.updateDOM($2);
                    console.log("\n");
                    console.log("Groupe : " + group.name);
                    console.log("\n");
                    let subGroups = crawler.getSubGroups(group);
                    for(let subGroup of subGroups){
                        console.log(subGroup.name);
                    }
                });
            });
        }
    });
})