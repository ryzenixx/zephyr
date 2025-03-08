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

    if (interaction.isButton()) {
        const guildId = interaction.guild.id;
        let db = bot.db;
    
        if (interaction.customId === 'enable_welcome') {
            await interaction.reply({ 
                content: "📢 **Mentionne le salon où je dois envoyer les futurs messages d'arrivées.** (ex: `#général`)", 
                ephemeral: true 
            });
    
            const filter = response => response.author.id === interaction.user.id && response.mentions.channels.size > 0;
            const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });
    
            collector.on('collect', async response => {
                const channelId = response.mentions.channels.first().id;
    
                const sql = `UPDATE guild_settings SET welcome_enabled = TRUE, welcome_channel_id = ? WHERE guild_id = ?`;
                db.query(sql, [channelId, guildId], (err) => {
                    if (err) {
                        console.error(err);
                        return interaction.followUp({ content: "❌ Erreur lors de l'activation.", ephemeral: true });
                    }
                    const successActivateMessagesEmbed = new Discord.EmbedBuilder()
                        .setColor(0xd0ffa9)
                        .setDescription(`Les **messages d'arrivées** ont été activés dans le salon <#${channelId}> !`)
                        .setTimestamp()

                    interaction.followUp({ embeds: [successActivateMessagesEmbed], ephemeral: false });
                });
    
                response.delete();
            });
    
        } else if (interaction.customId === 'disable_welcome') {
            const sql = `UPDATE guild_settings SET welcome_enabled = FALSE, welcome_channel_id = NULL WHERE guild_id = ?`;
            db.query(sql, [guildId], (err) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: "❌ Erreur lors de la désactivation.", ephemeral: true });
                }
                const successDesactivateMessagesEmbed = new Discord.EmbedBuilder()
                    .setColor(0xff7474)
                    .setDescription(`Les **messages d'arrivées** ont été désactivés !`)
                    .setTimestamp()

                interaction.reply({ embeds: [successDesactivateMessagesEmbed], ephemeral: false });
            });
        }
    }
};
