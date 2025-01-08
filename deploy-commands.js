const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Function to recursively load command files
const loadCommands = (directoryPath) => {
  const commandData = [];

  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);

    if (fs.lstatSync(filePath).isDirectory()) {
      // If it's a directory, recurse into it
      commandData.push(...loadCommands(filePath)); // Merge the results of subdirectory
    } else if (file.endsWith(".js")) {
      // If it's a JavaScript file, require it as a command
      const command = require(filePath);
      commandData.push(command.data.toJSON()); // Register the command data
    }
  }

  return commandData;
};

const commandsPath = path.join(__dirname, "commands");
const commands = loadCommands(commandsPath);

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // For testing, use guild commands
const token = process.env.DISCORD_TOKEN;

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId), // For guild-specific commands
      { body: commands },
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
