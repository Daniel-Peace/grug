const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("greeting")
    .setDescription("Replies with a greeting!"),
  async execute(interaction) {
    // Obtain the user's display name or username
    const user = interaction.member?.displayName || interaction.user.username;

    // Array of different greetings
    const greetings = [`Hello ${user}!`, `Hi ${user}!`, `Guten Tag ${user}!`];

    // Pick a random greeting
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // Reply with the greeting
    await interaction.reply(greeting);
  },
};
