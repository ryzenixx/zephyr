const Discord = require("discord.js");

module.exports = {
    name: "meme",
    description: "Affiche un même aléatoire",
    dm: false,

    async run(bot, interaction) {
        
        await interaction.deferReply();

        try {
            const response = await fetch('https://meme-api.com/gimme');
            const data = await response.json();

            if (!data || !data.url) {
                return interaction.editReply({ content: "Désolé, je n'ai pas pu trouver de même. Réessaie plus tard." });
            }

            const embedMeme = new Discord.EmbedBuilder()
                .setColor(0xFF5733)
                .setTitle("Les mêmes de Zéphyr ⚡")
                .setDescription("Voici un même pour toi !")
                .setImage(data.url)
                .setTimestamp()
                .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });

            await interaction.editReply({ embeds: [embedMeme] });

        } catch (error) {
            console.error("Erreur lors de la récupération du même:", error);
            await interaction.editReply({ content: "Une erreur est survenue lors de la récupération du même. Réessaie plus tard ! ❌", ephemeral: true });
        }

    }
}