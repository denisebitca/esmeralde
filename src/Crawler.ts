import { CheerioAPI } from 'cheerio';
interface Group {
    name: string;
    id: number;
}

interface SubGroup {
    name: string;
    id: number;
}

class Crawler{
    private DOM: CheerioAPI
    constructor(dom: CheerioAPI){
        this.DOM = dom;
    }

    public getGroups(): Group[] {
        let groups: Group[] = [];
        this.DOM("select[name='selec_groupe'] option").each((i, elem) => {
            if(this.DOM != null && this.DOM(elem).attr('value') != "TOUS"){
                groups.push({
                    name: this.DOM(elem).text(),
                    id: Number(this.DOM(elem).attr('value'))
                });
            }
        });
        return groups;
    }

    public updateDOMUrl(group: Group, sub?: SubGroup) : string{
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
                    id: Number(this.DOM(elem).attr('value'))
                });
            }
        });
        return subGroups;
    }

    public getImage(group: Group, sub: SubGroup) : string | null{
        return this.DOM("img")[0].attribs.src;
    }
}

export default Crawler;