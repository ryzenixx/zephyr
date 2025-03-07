const Discord = require("discord.js");

module.exports = async (bot, guild) => {

    const zephyrguild = bot.guilds.cache.get("1346171593356738723");
    const channeljoins = zephyrguild.channels.cache.get("1347687988024446997");
    const serverCreatedAt = `<t:${Math.floor(guild.createdAt.getTime() / 1000)}>`;

    const infoJoinZephyrEmbed = new Discord.EmbedBuilder()
        .setColor(0xff5454)
        .setTitle("Zéphyr a été retiré d'un serveur 😪")
        .setDescription(`**Nom du serveur:** ${guild.name}\n**Nombre de membres:** ${guild.memberCount}\n**Serveur créé le:** ${serverCreatedAt}`)

    channeljoins.send({ embeds: [infoJoinZephyrEmbed] }).catch(console.error);
}