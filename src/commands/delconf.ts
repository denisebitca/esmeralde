import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../index';
import fs from 'fs';
import path from "path";
import DB from "../DB";

let obj : Command = {
	data: new SlashCommandBuilder()
		.setName('delconf')
		.setDescription('Supprime la configuration de ton emploi du temps.'),
	async execute(interaction : CommandInteraction) {
        if(DB.checkIfUserExists(interaction.user.id)){
            if(DB.removeUser(interaction.user.id)){
                return interaction.reply({content:"Tu as bien supprimé ton emploi du temps.", ephemeral: true});
            } else {
                return interaction.reply({content:"Erreur avec la suppréssion de tes données ! Contacte denise#2798.", ephemeral: true});
            }
        } else {
            return interaction.reply({content: "Tu n'es pas dans la liste des utilisateurs qui ont configuré leur emploi du temps.", ephemeral: true});
        }
	},
};

module.exports = obj;