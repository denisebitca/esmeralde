//node
import fs from 'fs';
import path from 'path';

//config
var config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));

//discord
import * as Discord from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

//other
import {FollowupFunctions} from './FollowupFunctions';

export interface Command {
	data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
	execute(interaction : Discord.CommandInteraction) : Promise<void>;
}

class ClientMod extends Discord.Client{
	public constructor(options: Discord.ClientOptions, comm: Discord.Collection<string, Command>){
		super(options);
		this.commands = comm;
	}
	public commands: Discord.Collection<string, Command>;
}

const rest = new REST({ version: '9' }).setToken(config.token);

const client = new ClientMod({ intents: [Discord.Intents.FLAGS.GUILDS] }, new Discord.Collection());

//import commands

const commands = [];
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync(path.join(__dirname,'./commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	console.log(command);
	commands.push(command.data.toJSON());
	client.commands.set(command.data.name, command);
}

(async () => {
	try {
		for(var element of config.GUILDID){
			await rest.put(
				Routes.applicationGuildCommands(config.CLIENTID, element),
				{ body: commands },
			);

			console.log('Registered for guild ' + element);
		}

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (interaction.isSelectMenu()){
		if (interaction.customId === 'select' || interaction.customId === 'select2') {
			FollowupFunctions.followUpActionMenu1_edt(interaction);
		} else if (interaction.customId === 'select3') {
			FollowupFunctions.followUpActionMenu2_edt(interaction);
			config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), {encoding: "utf-8"}));
		}
    } else if(interaction.isCommand()){
        const command = client.commands.get(interaction.commandName);

        if (!command) return;
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Oups ! Il y a un problème ! Contacte denise#2798 ! ``code erreur 2``', ephemeral: true });
        }
    }
});

client.login(config.token);