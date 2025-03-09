const Discord = require("discord.js");

module.exports = {
    name: "ticket",
    description: "Paramètres des tickets",
    permission: Discord.PermissionFlagsBits.ManageGuild,
    dm: false,

    async run(bot, interaction) {
        const guildId = interaction.guild.id;
        const sql = `SELECT ticket_enabled, ticket_category_id, role_support_ticket_id FROM guild_settings WHERE guild_id = ?`;

        let db = bot.db;

        db.query(sql, [guildId], async (err, result) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: '❌ Erreur lors de la récupération des paramètres.', ephemeral: true });
            }
    
            let ticketEnabled = false;
            let ticketCategoryId = null;
            let roleSupportTicketId = null;
    
            if (result.length > 0) {
                ticketEnabled = result[0].ticket_enabled;
                ticketCategoryId = result[0].ticket_category_id;
                roleSupportTicketId = result[0].role_support_ticket_id;
            }
    
            const embed = new Discord.EmbedBuilder()
                .setColor(ticketEnabled ? 0xd0ffa9 : 0xff7474)
                .setTitle("Configuration des tickets ⚙️")
                .setDescription(ticketEnabled 
                    ? `\n\nLes tickets sont **activés ✅** sur ce serveur.\n\nClique sur **Désactiver sur les tickets** si tu souhaites désactiver cette fonctionnalitée.\n\n**Catégorie des tickets:** <#${ticketCategoryId}>\n**Rôle support:** <@&${roleSupportTicketId}>`
                    : `\n\nLes tickets sont **désactivés ❌** sur ce serveur.\nClique sur **Activer les tickets** pour activer le système de ticket.`)
                .setTimestamp();
    
            const button = new Discord.ButtonBuilder()
                .setCustomId(ticketEnabled ? 'disable_ticket' : 'enable_ticket')
                .setLabel(ticketEnabled ? 'Désactiver les tickets' : 'Activer les tickets')
                .setStyle(ticketEnabled ? Discord.ButtonStyle.Secondary : Discord.ButtonStyle.Secondary);
    
            const row = new Discord.ActionRowBuilder().addComponents(button);
    
            await interaction.reply({ embeds: [embed], components: [row] });
        });
    }
}