//node
import fs from 'fs';

//config
import config from './config.json';

//discord
import { Client, ClientOptions, Collection, Intents, CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

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

const client = new ClientMod({ intents: [Intents.FLAGS.GUILDS] }, new Collection());

//import commands

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

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
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(config.token);