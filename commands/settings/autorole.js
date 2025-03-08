const Discord = require("discord.js");

module.exports = {
    name: "autorole",
    description: "Paramètres de l'autorole",
    permission: Discord.PermissionFlagsBits.ManageGuild,
    dm: false,

    async run(bot, interaction) {
        const guildId = interaction.guild.id;
        const sql = `SELECT autorole_enabled, autorole_role_id FROM guild_settings WHERE guild_id = ?`;

        let db = bot.db;

        db.query(sql, [guildId], async (err, result) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: '❌ Erreur lors de la récupération des paramètres.', ephemeral: true });
            }
    
            let autoroleEnabled = false;
            let autoroleRoleId = null;
    
            if (result.length > 0) {
                autoroleEnabled = result[0].autorole_enabled;
                autoroleRoleId = result[0].autorole_role_id;
            }
    
            const embed = new Discord.EmbedBuilder()
                .setColor(autoroleEnabled ? 0xd0ffa9 : 0xff7474)
                .setTitle("Configuration de l'autorole ⚙️")
                .setDescription(autoroleEnabled 
                    ? `\n\nL'autorole est **activé ✅** sur ce serveur.\nLe rôle configuré est <@&${autoroleRoleId}> !\n\nClique sur **Désactiver l'autorole** si tu souhaites désactiver cette fonctionnalitée.`
                    : `\n\nL'autorole est **désactivé ❌** sur ce serveur.\nClique sur **Activer l'autorole** pour choisir un rôle qui sera donné aux futurs arrivants.`)
                .setTimestamp();
    
            const button = new Discord.ButtonBuilder()
                .setCustomId(autoroleEnabled ? 'disable_autorole' : 'enable_autorole')
                .setLabel(autoroleEnabled ? 'Désactiver l\'autorole' : 'Activer l\'autorole')
                .setStyle(autoroleEnabled ? Discord.ButtonStyle.Secondary : Discord.ButtonStyle.Secondary);
    
            const row = new Discord.ActionRowBuilder().addComponents(button);
    
            await interaction.reply({ embeds: [embed], components: [row] });
        });
    }
}