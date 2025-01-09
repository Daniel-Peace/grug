const { SlashCommandBuilder } = require("@discordjs/builders");
const { getDb } = require("../../db/db");
const { MessageFlags } = require("discord.js");
const {
  addBirthday,
  updateBirthday,
  isValidBirthday,
  checkForBirthdayEntry,
} = require("../../command-utils/birthdayUtils");

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
    const day = interaction.options.getInteger("day");
    const month = interaction.options.getInteger("month");

    if (!isValidBirthday(day, month)) {
      await interaction.reply({
        content: "It doesn't look like that is a valid date 🥺",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    try {
      const doc = await checkForBirthdayEntry(username);

      if (doc) {
        // Update the birthday if it exists
        await updateBirthday(doc, day, month);
        await interaction.reply({
          content: `I updated your birthday to ${month}/${day}. 🎉`,
          flags: [MessageFlags.Ephemeral],
        });
      } else {
        // Add a new birthday if it doesn't exist
        await addBirthday(username, day, month);
        await interaction.reply({
          content: `It looks like you didn't have a birthday saved. I'll add ${month}/${day} to my database now. 🎂`,
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
