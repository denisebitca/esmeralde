/*
These functions are used to follow up on commands
that have already been started.
*/

import * as Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Group, userInfo, Crawler, SubGroup } from './Crawler';
import * as config from './config.json'

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

        const row = new Discord.MessageActionRow();
        let options : Discord.MessageSelectOptionData[] = [];

        let list = [];

        for(let i = 0; i < subGroups.length; i++){
            let newUser : userInfo = {
                id: interaction.user.id,
                group: JSON.stringify(newGroup, null, 0),
                subgroup: JSON.stringify(subGroups[i], null, 0)
            }
            options.push({
                label: subGroups[i].name,
                value: String(i)
            });
            list.push(newUser);
        }

        await fs.promises.writeFile(path.join(__dirname, interaction.user.id + ".json"), JSON.stringify(list, null, 0)+"\n");

        const menu = new Discord.MessageSelectMenu();
        menu.setCustomId("select3");
        menu.setPlaceholder("Choisis ton groupe");
        menu.setOptions(options);
        menu.setMinValues(1);
        menu.setMaxValues(1);

        row.addComponents(menu);

        await interaction.update({content: "Maintenant choisis ton groupe !", embeds: [], components: [row]});
    }
    public static async followUpActionMenu2_edt(interaction: Discord.SelectMenuInteraction){
        let choiceList : userInfo[] = JSON.parse(fs.readFileSync(path.join(__dirname, interaction.user.id + ".json"), "utf8"));
        let newUser : userInfo = choiceList[parseInt(interaction.values[0])];
        let configCopy = {
            "token": config.token,
            "CLIENTID": config.CLIENTID,
            "GUILDID": config.GUILDID,
            //@ts-ignore
            "userList": config.userList.length === 0 ? [newUser] : config.userList.concat([newUser])
        }
        await fs.promises.writeFile(path.join(__dirname, "config.json"), JSON.stringify(configCopy, null, 2));
        await fs.promises.rm(path.join(__dirname, interaction.user.id + ".json"));
        await interaction.update({content: "Ton emploi du temps a été enregistré !", embeds: [], components: []});
    }

    public static async followUpNextPage(interaction: Discord.ButtonInteraction){
        //TODO
    }
}