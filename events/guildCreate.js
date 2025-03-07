const Discord = require("discord.js");

module.exports = async (bot, guild) => {

    const welcomeEmbed = new Discord.EmbedBuilder()
        .setColor(0xffffff)
        .setTitle('🌟 Ravi de vous rejoindre !')
        .setDescription(`Merci de m'avoir ajouté à votre serveur ! 🚀\n\nJe suis là pour vous aider et rendre votre expérience encore plus agréable. Tapez \`/help\` pour voir tout ce que je peux faire !\n\n💡 **Besoin d'assistance ou d'améliorations ?**\nRejoignez notre communauté en cliquant sur le bouton ci-dessous !`)
        .setTimestamp()
        .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });

    const discordButton = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setLabel('🚀 Rejoindre la communauté')
                .setStyle(Discord.ButtonStyle.Link)
                .setURL('https://discord.gg/NE5SQwjJp4'),
            
            new Discord.ButtonBuilder()
                .setLabel('👀 Voir sur GitHub')
                .setStyle(Discord.ButtonStyle.Link)
                .setURL('https://github.com/ryzenixx/zephyr')
        )


    const firstChannel = guild.channels.cache
        .filter(channel => channel.type === 0 && channel.permissionsFor(guild.members.me).has('SendMessages'))
        .sort((a, b) => a.position - b.position)
        .first();

    if (firstChannel) {
        firstChannel.send({ embeds: [welcomeEmbed], components: [discordButton] });
    }


    let db = bot.db;
    const guildId = guild.id;

    const sql = `INSERT INTO guild_settings (guild_id) VALUES (?)`

    db.query(sql, [guildId], (err) => {
        if (err) {
            console.error(err);
            console.log("❌ Erreur lors de de l'enregistrement du serveur dans la base de données.");
        }

        console.log("Serveur ajouté dans la base de donnée.");
    });

    const zephyrguild = bot.guilds.cache.get("1346171593356738723");
    const channeljoins = zephyrguild.channels.cache.get("1347687988024446997");
    const serverCreatedAt = `<t:${Math.floor(guild.createdAt.getTime() / 1000)}>`;

    const infoJoinZephyrEmbed = new Discord.EmbedBuilder()
        .setColor(0xffc654)
        .setTitle("Zéphyr a rejoint un nouveau serveur 👋")
        .setDescription(`**Nom du serveur:** ${guild.name}\n**Nombre de membres:** ${guild.memberCount}\n**Serveur créé le:** ${serverCreatedAt}`)

    channeljoins.send({ embeds: [infoJoinZephyrEmbed] }).catch(console.error);
}