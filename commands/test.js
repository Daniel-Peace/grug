const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("media")
    .setDescription("Send a media link or attachment")
    .addStringOption((option) =>
      option
        .setName("link")
        .setDescription("Paste a media URL")
        .setRequired(false),
    )
    .addAttachmentOption((option) =>
      option
        .setName("file")
        .setDescription("Upload a media file")
        .setRequired(false),
    ),

  async execute(interaction) {
    const link = interaction.options.getString("link");
    const attachment = interaction.options.getAttachment("file");

    if (link) {
      // Handle media URL
      await interaction.reply({
        content: `You provided a link: ${link}`,
      });
    } else if (attachment) {
      // Handle uploaded media file
      await interaction.reply({
        content: `You uploaded a file: ${attachment.name}`,
        files: [attachment.url], // Send the file
      });
    } else {
      // Handle case where no media or link was provided
      await interaction.reply({
        content: "Please provide a link or upload a media file.",
      });
    }
  },
};
