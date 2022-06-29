/*
These functions are used to follow up on commands
that have already been started.
*/
import { DB } from './DB';
import * as Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Group, userInfo, Crawler, SubGroup } from './Crawler';
//var config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));

export class FollowupFunctions{
    public static async followUpActionMenu1_edt(interaction: Discord.SelectMenuInteraction){
        
        let groupName : string = interaction.values[0].split("///")[0];
        let groupId : string = interaction.values[0].split("///")[1];
        let newGroup : Group = {
            name: groupName,
            id: groupId
        };
        
        let newCrawler : Crawler = await Crawler.newCrawler(Crawler.updateDOMUrl(newGroup));
        let subGroups : SubGroup[] = newCrawler.getSubGroups();

        let options : Discord.MessageSelectOptionData[] = [];

        let list = [];

        for(let i = 0; i < subGroups.length; i++){
            let newUser : userInfo = {
                group: JSON.stringify(newGroup, null, 0),
                subgroup: JSON.stringify(subGroups[i], null, 0)
            }
            options.push({
                label: subGroups[i].name,
                value: String(i)
            });
            list.push(newUser);
        }

        if(options.length > 24){
            const row1 = new Discord.MessageActionRow();
            const row2 = new Discord.MessageActionRow();
            let options1 = options.slice(0, 24);
            let options2 = options.slice(24, options.length);
            const menu1 = new Discord.MessageSelectMenu();
            menu1.setCustomId("select3");
            menu1.setPlaceholder("Choisis ton groupe (1)");
            menu1.setOptions(options1);
            menu1.setMinValues(1);
            menu1.setMaxValues(1);
            row1.addComponents(menu1);
            const menu2 = new Discord.MessageSelectMenu();
            menu2.setCustomId("select4");
            menu2.setPlaceholder("Choisis ton groupe (2)");
            menu2.setOptions(options2);
            menu2.setMinValues(1);
            menu2.setMaxValues(1);
            row2.addComponents(menu2);
            fs.writeFileSync(path.join(__dirname, interaction.user.id + ".json"), JSON.stringify(list, null, 0)+"\n");
            await interaction.update({content: "Maintenant choisis ton groupe !", embeds: [], components: [row1, row2]});
        } else {
            const menu = new Discord.MessageSelectMenu();
            const row = new Discord.MessageActionRow();
            menu.setCustomId("select3");
            menu.setPlaceholder("Choisis ton groupe");
            menu.setOptions(options);
            menu.setMinValues(1);
            menu.setMaxValues(1);
            row.addComponents(menu);
            fs.writeFileSync(path.join(__dirname, interaction.user.id + ".json"), JSON.stringify(list, null, 0)+"\n");
            await interaction.update({content: "Maintenant choisis ton groupe !", embeds: [], components: [row]});
        }

    }
    public static async followUpActionMenu2_edt(interaction: Discord.SelectMenuInteraction){
        let choiceList : userInfo[] = JSON.parse(fs.readFileSync(path.join(__dirname, interaction.user.id + ".json"), "utf8"));
        let newUser : userInfo = choiceList[parseInt(interaction.values[0])];
        let newGroup : string = newUser.group;
        let newSubGroup : string = newUser.subgroup;
        fs.rmSync(path.join(__dirname, interaction.user.id + ".json"));
        if(DB.addUser(interaction.user.id, newGroup, newSubGroup)){
            await interaction.update({content: "Ton emploi du temps a été enregistré !", embeds: [], components: []});
        } else {
            await interaction.update({content: "Erreur avec la sauvegarde, contacte denise#2798 !", embeds: [], components: []});
        }
    }

    public static async followUpNextPage(interaction: Discord.ButtonInteraction){
        //TODO
    }
}
