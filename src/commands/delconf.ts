import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../index';
import fs from 'fs';
import path from "path";

let obj : Command = {
	data: new SlashCommandBuilder()
		.setName('delconf')
		.setDescription('Supprime la configuration de ton emploi du temps.'),
	async execute(interaction : CommandInteraction) {
        let config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json"), {encoding: "utf-8"}));
        //@ts-ignore
        if(config.userList.filter(user => user.id === interaction.user.id).length === 1){
            //@ts-ignore
            config.userList = config.userList.filter(user => user.id !== interaction.user.id);
            await fs.promises.writeFile(path.join(__dirname, "../config.json"), JSON.stringify(config, null, 2));
            return interaction.reply({content:"Tu as bien supprimé ton emploi du temps.", ephemeral: true});
        } else {
            return interaction.reply({content: "Tu n'es pas dans la liste des utilisateurs qui ont configuré leur emploi du temps.", ephemeral: true});
        }
	},
};

module.exports = obj;