import {Crawler, Group, SubGroup} from "../Crawler";
import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../index';
import fs from 'fs';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import path from "path";
dayjs.extend(weekOfYear);

function edtLink(subGroupId?: SubGroup["id"]) : string{
    let now = dayjs()
    let week = now.week()-1;
    let year = now.year();
    if(now.day() === 6){
        if(week === 52){
            week = 0;
            year += 1;
        } else {
            week += 1;
        }
    }
    return "https://edt.iut-orsay.fr/vue_invite_horizontale.php?current_year=" + year + "&current_week=" + week + "&groupes_multi%5B%5D=" + subGroupId + "&lar=1920&hau=1200";
}



let obj : Command = {
	data: new SlashCommandBuilder()
		.setName('edt')
		.setDescription('Trouver ton emploi du temps ou l`emploi du temps de ton groupe.')
		.addIntegerOption(option => option.setName('id-etudiant').setDescription('l`identifiant de l`étudiant')),
	async execute(interaction : CommandInteraction) {

        var config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json"), {encoding: "utf-8"}));

        //@ts-ignore
        let presenceCheck = config.userList.filter(user => user.id === interaction.user.id);
        if(presenceCheck.length === 1){
            //@ts-ignore
            return interaction.reply(edtLink(JSON.parse(presenceCheck[0].subgroup).id));

        }

        let crawler = await Crawler.newCrawler("https://edt.iut-orsay.fr/edt_invite.php");
        let groups : Group[] = crawler.getGroups();

        if(groups.length > 0){

            const row = new MessageActionRow();
            let options : MessageSelectOptionData[] = [];
            let options2 : MessageSelectOptionData[] = [];
            groups.forEach(group => {
                if(options.length < 25){
                    options.push({
                        label: "Groupe " + group.name,
                        value: String(group.name+"///"+group.id)
                    });
                } else {
                    options2.push({
                        label: "Groupe " + group.name,
                        value: String(group.name+"///"+group.id)
                    })
                }
            });

            const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Esmeralde')
            .setDescription('Je suis le bot EDT de l`IUT.\nPour commencer, tu dois selectionner ton groupe.\nPour cela, clique sur le bouton correspondant.');

            row.addComponents(new MessageSelectMenu().setCustomId("select").setPlaceholder("Pas de groupe selectionné dans la page 1").addOptions(options).setMinValues(1).setMaxValues(1));

            if(options2.length > 0){
                const row2 = new MessageActionRow();
                row2.addComponents(new MessageSelectMenu().setCustomId("select2").setPlaceholder("Pas de groupe selectionné").addOptions(options2));
                return interaction.reply({ content: 'Saluuuut uwu', ephemeral: true, embeds: [embed], components: [row, row2] });
            }
            
            return interaction.reply({ content: 'Saluuuut uwu', ephemeral: true, embeds: [embed], components: [row] });
        } else {
            return interaction.reply('Ouin, il y a un problème ! Contacte Denise !');
        }
	},
};

module.exports = obj;