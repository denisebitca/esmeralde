import {Crawler, Group, userInfo, SubGroup} from "../Crawler";
import cheerio, {CheerioAPI} from "cheerio";
import https from "https";
import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../index';
import fs from 'fs';
import config from '../config.json';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
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
        if(config.userList.filter((user : userInfo) => user.id === interaction.user.id).length === 0){
            config.userList.forEach((user : userInfo) => {
                if(user.id === interaction.user.id){
                   return interaction.reply(edtLink(user.subGroup.id));
                }
            });
        }

        let crawler = await Crawler.newCrawler();
        let groups : Group[] = crawler.getGroups();

        if(groups.length > 0){

            const row = new MessageActionRow();
            let options : MessageSelectOptionData[] = [];
            let options2 : MessageSelectOptionData[] = [];
            groups.forEach(group => {
                if(options.length < 25){
                    options.push({
                        label: "Groupe " + group.name,
                        value: String(group.id)
                    });
                } else {
                    options2.push({
                        label: "Groupe " + group.name,
                        value: String(group.id)
                    })
                }
            });

            const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Esmeralde')
            .setDescription('Je suis le bot EDT de l`IUT.\nPour commencer, tu dois selectionner ton groupe.\nPour cela, clique sur le bouton correspondant.');

            row.addComponents(new MessageSelectMenu().setCustomId("select").setPlaceholder("Pas de groupe selectionné").addOptions(options).setMinValues(1).setMaxValues(1));

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