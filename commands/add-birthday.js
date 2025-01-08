const { SlashCommandBuilder } = require("@discordjs/builders");
const { getDb } = require("../db/db");
const { MessageFlags } = require("discord.js");

const COLLECTION = "birthdays";

function validateBirthday(day, month) {
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

async function checkForEntry(collection, username) {
  return await collection.findOne({ username });
}

async function saveBirthday(collection, username, day, month) {
  const doc = { username, day, month };
  return await collection.insertOne(doc);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-birthday")
    .setDescription(
      "Adds your birthday to a database. This allows Grug to wish you a happy birthday.",
    )
    .addIntegerOption((day) =>
      day.setName("day").setDescription("Day of birthday").setRequired(true),
    )
    .addIntegerOption((month) =>
      month
        .setName("month")
        .setDescription("Month of birthday")
        .setRequired(true),
    ),

  async execute(interaction) {
    const username = interaction.user.username;
    const db = getDb();
    const collection = db.collection(COLLECTION);

    try {
      if (await checkForEntry(collection, username)) {
        await interaction.reply({
          content: "You already gave me your birthday 👍",
          flags: [MessageFlags.Ephemeral],
        });
      } else {
        const day = interaction.options.getInteger("day");
        const month = interaction.options.getInteger("month");

        if (!validateBirthday(day, month)) {
          await interaction.reply({
            content: "It doesn't look like that is a valid date 🥺",
            flags: [MessageFlags.Ephemeral],
          });
        } else {
          await saveBirthday(collection, username, day, month);
          await interaction.reply({
            content: `You entered your birthday as ${month}/${day}. I will remember this and wish you a happy birthday when the time comes 🥳`,
            flags: [MessageFlags.Ephemeral],
          });
        }
      }
    } catch (error) {
      console.error("Error while processing birthday:", error);
      await interaction.reply({
        content:
          "Something went wrong when I tried to save your birthday. Please try again sometime later.",
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
};
