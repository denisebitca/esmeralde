import cheerio, { CheerioAPI } from 'cheerio';
import https from 'https';

export interface userInfo {
    group: string;
    subgroup: string;
}

export interface Group {
    name: string;
    id: string;
}

export interface SubGroup {
    name: string;
    id: string;
}

export class Crawler{
    private DOM: CheerioAPI
    constructor(dom: CheerioAPI){
        this.DOM = dom;
    }

    public static async newCrawler(url : string) : Promise<Crawler>{
        return new Promise((resolve, reject) => {
            const req = https.get(url, (res) => {
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    let $ = cheerio.load(data);
                    resolve(new Crawler($));
                });
            });
            req.on("error", (err) => {
                reject(err);
            });
        });
    }

    public getGroups(): Group[] {
        let groups: Group[] = [];
        this.DOM("select[name='selec_groupe'] option").each((i, elem) => {
            if(this.DOM != null && this.DOM(elem).attr('value') != "TOUS"){
                groups.push({
                    name: this.DOM(elem).text(),
                    id: String(this.DOM(elem).attr('value'))
                });
            }
        });
        return groups;
    }

    public static updateDOMUrl(group: Group, sub?: SubGroup) : string{
        let url = "https://edt.iut-orsay.fr/edt_invite.php?selec_groupe=" + group.id + "&hau=1000&lar=1500";
        if(sub != undefined){
            let url = "https://edt.iut-orsay.fr/edt_invite.php?selec_groupe=" + group.id + "&groupes_multi[]=" + sub.id + "&hau=1000&lar=1500";
        }
        return url;
    }

    public updateDOM(dom: CheerioAPI) : void{
        this.DOM = dom;
    }

    public getSubGroups(): SubGroup[]{
        let subGroups: SubGroup[] = [];
        this.DOM("select[name='groupes_multi[]'] option").each((i, elem) => {
            if(this.DOM != null && this.DOM(elem).attr('value') != "TOUS"){
                subGroups.push({
                    name: this.DOM(elem).text(),
                    id: String(this.DOM(elem).attr('value'))
                });
            }
        });
        return subGroups;
    }

    public getImage(group: Group, sub: SubGroup) : string | null{
        return this.DOM("img")[0].attribs.src;
    }
}