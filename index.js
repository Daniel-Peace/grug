const { Client, GatewayIntentBits } = require("discord.js");
const { connectToDatabase, getDb } = require("./db/db"); // Make sure to require the correct path
const { wishHappyBirthday } = require("./command-utils/birthdayUtils");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const COLLECTION = "birthdays";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Optional
  ],
});

client.commands = new Map();

const commandsPath = path.join(__dirname, "commands");

const loadCommands = (directoryPath) => {
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);

    if (fs.lstatSync(filePath).isDirectory()) {
      // If it's a directory, recurse into it
      loadCommands(filePath);
    } else if (file.endsWith(".js")) {
      // If it's a JavaScript file, require it as a command
      const command = require(filePath);
      client.commands.set(command.data.name, command);
    }
  }
};

loadCommands(commandsPath);

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  console.log(client.guilds.cache);
  try {
    await connectToDatabase(); // Ensure DB connection is made
  } catch (error) {
    console.error("Failed to connect to MongoDB. Exiting...");
    process.exit(1); // Exit if connection fails
  }

  // Get the database and collection after successful connection
  const db = getDb();
  const collection = db.collection(COLLECTION);

  // Schedule the daily birthday check
  scheduleDailyTask(wishHappyBirthday, client, collection, 21, 55); // Runs at 8:00 AM every day
});

// Listen for interactions (slash commands)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction); // Execute the command
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error executing that command!",
      ephemeral: true,
    });
  }
});

// Schedules a task to run at a specific time daily
const scheduleDailyTask = (
  wishHappyBirthday,
  client,
  collection,
  hour = 8,
  minute = 0,
) => {
  const now = new Date();
  const nextRun = new Date();

  nextRun.setHours(hour, minute, 0, 0); // Set the target time
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1); // If the time today has passed, schedule for tomorrow
  }

  const timeUntilNextRun = nextRun - now;

  // Schedule the first run
  setTimeout(() => {
    if (!client) {
      console.log("Client is not available for scheduling.");
      return;
    }
    wishHappyBirthday(client); // Corrected callback to call the handleBirthdays function
    setInterval(() => wishHappyBirthday(client), 24 * 60 * 60 * 1000); // Schedule to run every 24 hours
  }, timeUntilNextRun);
};

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);
