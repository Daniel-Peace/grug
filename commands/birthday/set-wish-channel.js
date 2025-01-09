const { SlashCommandBuilder } = require("@discordjs/builders");
const { getDb } = require("../../db/db");
const { MessageFlags } = require("discord.js");
const { getConfigCollection } = require("../../db/db");
const { saveWishChannel } = require("../../command-utils/birthdayUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-wish-channel")
    .setDescription("Sets the channel that grug sends birthday messages to.")
    .addChannelOption((channel) =>
      channel
        .setName("channel")
        .setDescription("select a channel")
        .setRequired(true),
    ),
  async execute(interaction) {
    try {
      const db = getDb();
      const collection = await getConfigCollection(db);
      const channel = interaction.options.getChannel("channel");
      const channelDoc = {
        configName: "birthday-config",
        channel: { name: channel.name, id: channel.id },
      };
      await saveWishChannel(channelDoc);
      await interaction.reply({
        content: `No problem! I will now send birthday messages to **${channel.name}**.`,
        flags: [MessageFlags.Ephemeral], // Makes the response visible only to the user
      });
    } catch (error) {
      console.error("Error while processing birthday:", error);
      await interaction.reply({
        content:
          "Something went wrong when I tried to save the channel. Please try again later.",
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
};
