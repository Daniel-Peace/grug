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

async function updateBirthday(collection, doc, day, month) {
  const filter = { _id: doc._id };
  const update = { $set: { day, month } };
  return await collection.updateOne(filter, update);
}

async function saveBirthday(collection, username, day, month) {
  const doc = { username, day, month };
  return await collection.insertOne(doc);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("update-birthday")
    .setDescription(
      "Updates your existing birthday or adds it if it was not previously saved.",
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

    const day = interaction.options.getInteger("day");
    const month = interaction.options.getInteger("month");

    if (!validateBirthday(day, month)) {
      await interaction.reply({
        content: "It doesn't look like that is a valid date 🥺",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    try {
      const doc = await checkForEntry(collection, username);

      if (doc) {
        await updateBirthday(collection, doc, day, month);
        await interaction.reply({
          content: `I updated your birthday to ${month}/${day}.`,
          flags: [MessageFlags.Ephemeral],
        });
      } else {
        await saveBirthday(collection, username, day, month);
        await interaction.reply({
          content: `It doesn't look like you have a birthday saved. I'll add ${month}/${day} to my database.`,
          flags: [MessageFlags.Ephemeral],
        });
      }
    } catch (error) {
      console.error("Error while processing birthday:", error);
      await interaction.reply({
        content:
          "Something went wrong when I tried to save your birthday. Please try again later.",
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
};
