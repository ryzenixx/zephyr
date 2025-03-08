const Discord = require("discord.js");

module.exports = {
    name: "welcome",
    description: "Paramètres des messages de bienvenue",
    permission: Discord.PermissionFlagsBits.ManageGuild,
    dm: false,

    async run(bot, interaction) {
        const guildId = interaction.guild.id;
        const sql = `SELECT welcome_enabled, welcome_channel_id FROM guild_settings WHERE guild_id = ?`;

        let db = bot.db;

        db.query(sql, [guildId], async (err, result) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: '❌ Erreur lors de la récupération des paramètres.', ephemeral: true });
            }
    
            let welcomeEnabled = false;
            let welcomeChannelId = null;
    
            if (result.length > 0) {
                welcomeEnabled = result[0].welcome_enabled;
                welcomeChannelId = result[0].welcome_channel_id;
            }
    
            const embed = new Discord.EmbedBuilder()
                .setColor(welcomeEnabled ? 0xd0ffa9 : 0xff7474)
                .setTitle("Configuration des messages d'arrivées ⚙️")
                .setDescription(welcomeEnabled 
                    ? `\n\nLes messages d'arrivées sont **activés ✅** sur ce serveur.\nLe salon configuré est <#${welcomeChannelId}> !\n\nClique sur **Désactiver les messages** si tu souhaites désactiver cette fonctionnalitée.`
                    : `\n\nLes messages d'arrivées sont **désactivés ❌** sur ce serveur.\nClique sur **Activer les messages** pour choisir un salon dans lequel les futurs arrivants seront annoncés.`)
                .setTimestamp();
    
            const button = new Discord.ButtonBuilder()
                .setCustomId(welcomeEnabled ? 'disable_welcome' : 'enable_welcome')
                .setLabel(welcomeEnabled ? 'Désactiver les messages' : 'Activer les messages')
                .setStyle(welcomeEnabled ? Discord.ButtonStyle.Secondary : Discord.ButtonStyle.Secondary);
    
            const row = new Discord.ActionRowBuilder().addComponents(button);
    
            await interaction.reply({ embeds: [embed], components: [row] });
        });
    }
}