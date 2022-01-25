//node
import fs from 'fs';
import path from 'path';

//config
import config from './config.json';

//discord
import * as Discord from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
const wait = require('util').promisify(setTimeout);

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
			console.log(interaction.values[0]);
			await interaction.update({content: "test", embeds: [], components: []});
		}
    } else if(interaction.isCommand()){
        const command = client.commands.get(interaction.commandName);

        if (!command) return;
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Kyaaaa !!! J`ai eu un petit souci, désowée >.<', ephemeral: true });
        }
    }
});

client.login(config.token);