import {Crawler, Group, SubGroup} from "../Crawler";
import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../index';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import DB from "../DB";
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
		.setDescription('Trouver ton emploi du temps ou l`emploi du temps de ton groupe.'),
	async execute(interaction : CommandInteraction) {

        let user = DB.getUser(interaction.user.id);
        if(user !== undefined){
            let group : Group = JSON.parse(user.filiere);
            let subGroup : SubGroup = JSON.parse(user.groupe);
            return interaction.reply({content: "Emploi du temps de la filière " + group.name + ", groupe " + subGroup.name + " : \n" + edtLink(subGroup.id)});
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
            .setTitle('Configuration de l\'emploi du temps')
            .setDescription('Je suis le bot EDT de l`IUT.\nPour commencer, tu dois selectionner ta filière.\nPour cela, clique sur le premier menu, et si tu ne trouves pas ta filière, clique sur le deuxième menu.');

            row.addComponents(new MessageSelectMenu().setCustomId("select").setPlaceholder("Choisis ta filière (1)").addOptions(options).setMinValues(1).setMaxValues(1));

            if(options2.length > 0){
                const row2 = new MessageActionRow();
                row2.addComponents(new MessageSelectMenu().setCustomId("select2").setPlaceholder("Choisis ta filière (2)").addOptions(options2));
                return interaction.reply({ content: 'Salut !', ephemeral: true, embeds: [embed], components: [row, row2] });
            }
            
            return interaction.reply({ content: 'Salut !', ephemeral: true, embeds: [embed], components: [row] });
        } else {
            return interaction.reply({ content: 'Oups ! Il y a un problème ! Contacte denise#2798 !', ephemeral: true });
        }
	},
};

module.exports = obj;