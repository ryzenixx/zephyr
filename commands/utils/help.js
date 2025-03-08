const Discord = require("discord.js");

module.exports = {
    name: "help",
    description: "Affiche les commandes de Zéphyr",
    dm: false,

    async run(bot, interaction) {
        
        const helpEmbed = new Discord.EmbedBuilder()
            .setColor(0xffffff)
            .setTitle("Le guide d'aide de Zéphyr 📖")
            .setDescription("**⚠️ Le bot est en développement, si vous souhaitez contribuer à de nouvelles fonctionnalitées, [rejoignez notre Discord](https://discord.gg/NE5SQwjJp4) ou [consultez le GitHub](https://github.com/ryzenixx/zephyr) !**\n\n\n**👋 Général**\n</help:1347563329446613093> **-** Affiche les commandes de Zéphyr\n\n**🔄 Utilitaire**\n</invite:1347565523147165696> **-** Invite Zéphyr sur un autre serveur !\n\n**🚨 Modération**\n</kick:1347568140355371019> **-** Exclure un utilisateur de ce serveur\n</ban:1347639177650507919> **-** Bannir un utilisateur de ce serveur\n</mute:1347639177650507920> **-** Réduire au silence un utilisateur de ce serveur\n\n**🎮 Divertissement**\n</blague:1347642736194617384> **-** Affiche une blague aléatoire\n</meme:1347645316169728041> **-** Affiche un même aléatoire\n\n**⚙️ Configuration**\n/welcome **-** Paramètres des messages de bienvenue")
            .setTimestamp()
            .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });

        interaction.reply({ embeds: [helpEmbed] });        

    }
}