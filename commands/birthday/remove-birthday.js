const { SlashCommandBuilder } = require("@discordjs/builders");
const { getDb } = require("../../db/db");
const { MessageFlags } = require("discord.js");
const {
  removeBirthday,
  checkForBirthdayEntry,
} = require("../../command-utils/birthdayUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-birthday")
    .setDescription(
      "Remove your birthday from the database. Grug will no longer wish you a happy birthday.",
    ),

  async execute(interaction) {
    const username = interaction.user.username;
    try {
      if (await checkForBirthdayEntry(username)) {
        await removeBirthday(username);
        await interaction.reply({
          content: "I removed your birthday from my database 👍",
          flags: [MessageFlags.Ephemeral],
        });
      } else {
        await interaction.reply({
          content:
            "It doesn't look like you gave me your birthday, or I already removed it in the past 🤔",
          flags: [MessageFlags.Ephemeral],
        });
      }
    } catch (error) {
      console.error("Error while processing birthday:", error);
      await interaction.reply({
        content:
          "Something went wrong when I tried to remove your birthday. Please try again sometime later.",
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
};
