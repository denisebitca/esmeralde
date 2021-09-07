import { CommandInteraction, TextChannel } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';

//dayjs
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekOfYear);

//data
import { Command } from '../index';

interface gn {
	[pName:string]: Array<number>
}
let groupeNum : gn = {
    "TP 3A1": [0,0],
    "TP 3A2": [0,1],
    "TP 3B1": [1,0],
    "TP 3B2": [1,1],
    "TP 3C1": [2,0],
    "TP 3C2": [2,1],
    "TP 3D1": [3,0],
    "TP 3D2": [3,1]
}
const groupeCode = [[15824546, 15824547], [15824548, 15824760], [15824550, 15824759], [15824552, 15824756]]

function getEDTLink(name : string | number) : string{
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
	if(name){
		if(typeof(name) === "string"){
			let pos = groupeNum[name];
    		let code = groupeCode[pos[0]][pos[1]];
    		return "https://edt.iut-orsay.fr/vue_invite_horizontale.php?current_year=" + year + "&current_week=" + week + "&selec_groupe=27785342&groupes_multi%5B%5D=" + code + "&lar=1920&hau=1200"
		} else if(typeof(name) === "number"){
			return "https://edt.iut-orsay.fr/vue_etudiant_horizontale.php?current_year=" + year + "&current_student=" + name + "&current_week=" + week + "&lar=1920&hau=1200"
		}
	}
	return "???"
}

let obj : Command = {
	data: new SlashCommandBuilder()
		.setName('edt')
		.setDescription('Trouver ton emploi du temps ou l`emploi du temps de ton groupe.')
		.addIntegerOption(option => option.setName('id-etudiant').setDescription('l`identifiant de l`étudiant')),
	async execute(interaction : CommandInteraction) {
        let user = interaction.options.getInteger('id-etudiant');
        if (user){
            return interaction.reply(getEDTLink(user));
        }
		let test = interaction.channelId;
		let test2 = await interaction.client.channels.fetch(test);
		if(test2 !== undefined){
			if(test2?.isText()){
				if(test2 instanceof TextChannel && test2.name === "edt"){
					let test3 : TextChannel = test2;
					//get category name
					let test4 = test3.guild.channels.cache.find(u => u.id == test3.parentId);
					if(test4 != undefined){
						return interaction.reply(getEDTLink(test4.name))
					}
				}
			}
		}
        return interaction.reply(`Ara ara~, je ne marche pas en dehors de mon beau salon... Essaie plutôt le salon edt de ton groupe !`);
	},
};

module.exports = obj;