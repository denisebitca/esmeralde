//node
import fs from 'fs';
import path from 'path';

//config
import config from './config.json';

//discord
import { Client, ClientOptions, Collection, Intents, CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

export interface Command {
	data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
	execute(interaction : CommandInteraction) : Promise<void>;
}

class ClientMod extends Client{
	public constructor(options: ClientOptions, comm: Collection<string, Command>){
		super(options);
		this.commands = comm;
	}
	public commands: Collection<string, Command>;
}

const rest = new REST({ version: '9' }).setToken(config.token);

const client = new ClientMod({ intents: [Intents.FLAGS.GUILDS] }, new Collection());

//import commands

const commands = [];
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname,'./commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	console.log(command);
	commands.push(command.data.toJSON());
	client.commands.set(command.data.name, command);
}

(async () => {
	try {
		await rest.put(
			Routes.applicationCommands(config.CLIENTID),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'Kyaaaa !!! J`ai eu un petit souci, désowée >.<', ephemeral: true });
	}
});

client.login(config.token);