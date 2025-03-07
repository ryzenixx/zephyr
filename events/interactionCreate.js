const path = require("path");
const Discord = require("discord.js");

module.exports = async (bot, interaction) => {
  if (interaction.type === Discord.InteractionType.ApplicationCommand) {
      const command = bot.commands.get(interaction.commandName);

      if (!command) {
          return interaction.reply({ content: "Commande non trouvée.", ephemeral: true });
      }

      try {
          await command.run(bot, interaction, command.options);
      } catch (err) {
          console.error(`Erreur lors de l'exécution de la commande ${interaction.commandName}:`, err);
          interaction.reply({ content: "Il y a eu une erreur lors de l'exécution de la commande.", ephemeral: true });
      }
  }
};
