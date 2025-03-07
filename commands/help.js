const Discord = require("discord.js");

module.exports = {
    name: "help",
    description: "Affiche les commandes de Zéphyr",
    dm: false,

    async run(bot, interaction) {
        
        const helpEmbed = new Discord.EmbedBuilder()
            .setColor(0xffffff)
            .setTitle("Le guide d'aide de Zéphyr 📖")
            .setDescription("**⚠️ Le bot est en développement, si vous souhaitez contribuer à de nouvelles idées, [rejoignez notre Discord](https://discord.gg/K4fxn4ZnJM) !**\n\n\n**👋 Général**\n</help:1347563329446613093> **-** Affiche les commandes de Zéphyr\n\n**🔄 Utilitaire**\n</invite:1347565523147165696> **-** Invite Zéphyr sur un autre serveur !\n\n**🚨 Modération**\n</kick:1346216373738672248> **-** Exclure un utilisateur de ce serveur\n</ban:1346262228164153364> **-** Bannir un utilisateur de ce serveur\n</mute:1346263817025224805> **-** Mute un utilisateur de ce serveur\n\n**🎮 Divertissement**\n</blague:1346265753732644914> **-** Affiche une blague aléatoire\n</meme:1346268808737722378> **-** Affiche un même aléatoire\n</8ball:1346271075096334519> **-** Pose une question et la boule magique te répondra !\n\n**⚙️ Configuration**\n</welcome:1346618984388231209> **-** Active/désactive les messages d'arrivées sur ce serveur !\n</autorole:1346626527877660817> **-** Active/désactive l'autorole sur ce serveur !")
            .setTimestamp()
            .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });

        interaction.reply({ embeds: [helpEmbed] });        

    }
}