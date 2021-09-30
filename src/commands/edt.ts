import { CommandInteraction, TextChannel } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';

//dayjs
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekOfYear);

//data
import { Command } from '../index';

interface gn {
	[pName:string]: string
}
let groupeNum : gn = {
    "TP 3A1": "15824546",
    "TP 3A2": "15824547",
    "TP 3B1": "15824548",
    "TP 3B2": "15824760",
    "TP 3C1": "15824550",
    "TP 3C2": "15824759",
    "TP 3D1": "15824552",
    "TP 3D2": "15824756",
	"TP-1A": "15824504",
	"TP-1B": "15824505",
	"TP-1C": "15824506",
	"TP-1D": "15824507",
	"TP-1E": "15824508",
	"TP-1F": "15824509",
	"TP-1G": "15824510",
	"TP-1H": "15824511",
	"TP-1I": "15824807",
	"TP-1J": "15824513",
	"TP-1K": "15824514",
	"TP-1L": "15824828&groupes_multi%5B%5D=15824829",
	"TP-1M": "15824516",
	"edt-g1": "15824574",
	"edt-g2": "15824575"
}

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
			let code = groupeNum[name];
    		return "https://edt.iut-orsay.fr/vue_invite_horizontale.php?current_year=" + year + "&current_week=" + week + "&groupes_multi%5B%5D=" + code + "&lar=1920&hau=1200"
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
				if(test2 instanceof TextChannel){
					if(test2.name === "edt"){
						let test3 : TextChannel = test2;
						//get category name
						let test4 = test3.guild.channels.cache.find(u => u.id == test3.parentId);
						if(test4 != undefined){
							return interaction.reply(getEDTLink(test4.name))
						}
					} else if (test2.name === "edt-g1" || test2.name === "edt-g2") {
						let test3 : TextChannel = test2;
						//get category name
						let test4 = test3.guild.channels.cache.find(u => u.id == test3.parentId);
						if(test4 != undefined){
							if(test4.name === "ALTERNANCE"){
								return interaction.reply(getEDTLink(test2.name));
							}
						}
					}
				}
			}
		}
        return interaction.reply(`Ara ara~, je ne marche pas en dehors de mon beau salon... Essaie plutôt le salon edt de ton groupe !`);
	},
};

module.exports = obj;