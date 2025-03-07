const Discord = require("discord.js");

module.exports = {
    name: "invite",
    description: "Invite Zéphyr sur un autre serveur !",
    dm: false,

    async run(bot, interaction) {
        
        const embedInvite = new Discord.EmbedBuilder()
            .setColor(0xffffff)
            .setTitle("Invite Zéphyr sur un autre serveur ❣️")
            .setDescription(`**Soutient le projet en plein développement et profite d'un bot multifonction entièrement gratuit !**\n\n[Clique-ici pour ajouter le bot à ton serveur](https://discord.com/oauth2/authorize?client_id=1346170979440787498&permissions=8&integration_type=0&scope=bot+applications.commands)`)
            .setTimestamp()
            .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });


        await interaction.reply({ embeds: [embedInvite] });

    }
}