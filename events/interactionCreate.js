const Discord = require("discord.js");
const config = require("../config.json");

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
            if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild)) {
                const notAuthorizedEmbed = new Discord.EmbedBuilder()
                    .setColor(config.embeds.error)
                    .setTitle("Permission manquante ❌")
                    .setDescription("**Tu n'as pas la permision ``Gérer le serveur``, nécéssaire pour effectuer cette action.**")

                return interaction.reply({ 
                    embeds: [notAuthorizedEmbed], 
                    ephemeral: true 
                });
            }

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

                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor(config.embeds.error)
                            .setTitle("Oups, une erreur est survenue.. ❌")
                            .setDescription("Veuillez réessayer.\n\n**Si cette erreur persiste, veuillez ouvrir un ticket sur le** [Discord support](https://discord.gg/fFw4w7EBWn)**.**")

                        interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                        return response.delete();
                    }
                    const successActivateMessagesEmbed = new Discord.EmbedBuilder()
                        .setColor(0xd0ffa9)
                        .setDescription(`Les **messages d'arrivées** ont été activés dans le salon <#${channelId}> !`)
                        .setTimestamp()

                    interaction.followUp({ embeds: [successActivateMessagesEmbed], ephemeral: false });
                });
    
                response.delete();
            });
    
        }
        


        if (interaction.customId === 'disable_welcome') {
            if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild)) {
                const notAuthorizedEmbed = new Discord.EmbedBuilder()
                    .setColor(config.embeds.error)
                    .setTitle("Permission manquante ❌")
                    .setDescription("**Tu n'as pas la permision ``Gérer le serveur``, nécéssaire pour effectuer cette action.**")

                return interaction.reply({ 
                    embeds: [notAuthorizedEmbed], 
                    ephemeral: true 
                });
            }

            const sql = `UPDATE guild_settings SET welcome_enabled = FALSE, welcome_channel_id = NULL WHERE guild_id = ?`;
            db.query(sql, [guildId], (err) => {
                if (err) {
                    console.error(err);

                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor(config.embeds.error)
                        .setTitle("Oups, une erreur est survenue.. ❌")
                        .setDescription("Veuillez réessayer.\n\n**Si cette erreur persiste, veuillez ouvrir un ticket sur le** [Discord support](https://discord.gg/fFw4w7EBWn)**.**")

                    return interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                }
                const successDesactivateMessagesEmbed = new Discord.EmbedBuilder()
                    .setColor(0xff7474)
                    .setDescription(`Les **messages d'arrivées** ont été désactivés !`)
                    .setTimestamp()

                interaction.reply({ embeds: [successDesactivateMessagesEmbed], ephemeral: false });
            });
        }



        if (interaction.customId === 'enable_autorole') {
            if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild)) {
                const notAuthorizedEmbed = new Discord.EmbedBuilder()
                    .setColor(config.embeds.error)
                    .setTitle("Permission manquante ❌")
                    .setDescription("**Tu n'as pas la permision ``Gérer le serveur``, nécéssaire pour effectuer cette action.**")

                return interaction.reply({ 
                    embeds: [notAuthorizedEmbed], 
                    ephemeral: true 
                });
            }

            await interaction.reply({ 
                content: "📢 **Mentionne le rôle que je dois donner aux futurs arrivants.** (ex: `@Membre`)", 
                ephemeral: true 
            });
        
            const filter = response => response.author.id === interaction.user.id && response.mentions.roles.size > 0;
            const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });
        
            collector.on('collect', async response => {
                const role = response.mentions.roles.first();
                const roleId = role.id;
                const botMember = interaction.guild.members.me;
        
                if (!botMember.permissions.has(Discord.PermissionsBitField.Flags.ManageRoles)) {
                    const botNotAuthorizedEmbed = new Discord.EmbedBuilder()
                        .setColor(config.embeds.error)
                        .setTitle("Oups, une erreur est survenue.. ❌")
                        .setDescription("**Je n'ai pas la permission ``Gérer les rôles``, nécéssaire pour effectuer cette action.**")

                    interaction.followUp({ 
                        embeds: [botNotAuthorizedEmbed], 
                        ephemeral: true 
                    });
                    return response.delete();
                }
        
                if (role.position >= botMember.roles.highest.position) {
                    const botNotAuthorizedEmbed = new Discord.EmbedBuilder()
                        .setColor(config.embeds.error)
                        .setTitle("Oups, une erreur est survenue.. ❌")
                        .setDescription("**Je ne peux pas définir un rôle égal ou supérieur à mon rôle le plus élévé pour l'autorole.**")

                    interaction.followUp({ 
                        embeds: [botNotAuthorizedEmbed],
                        ephemeral: true 
                    });
                    return response.delete();
                }
        
                const sql = `UPDATE guild_settings SET autorole_enabled = TRUE, autorole_role_id = ? WHERE guild_id = ?`;
                db.query(sql, [roleId, guildId], (err) => {
                    if (err) {
                        console.error(err);

                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor(config.embeds.error)
                            .setTitle("Oups, une erreur est survenue.. ❌")
                            .setDescription("Veuillez réessayer.\n\n**Si cette erreur persiste, veuillez ouvrir un ticket sur le** [Discord support](https://discord.gg/fFw4w7EBWn)**.**")

                        interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                        return response.delete();
                    }
        
                    const successActivateMessagesEmbed = new Discord.EmbedBuilder()
                        .setColor(0xd0ffa9)
                        .setDescription(`L'**autorole** a été activé, et je donnerai le rôle <@&${roleId}> aux futurs arrivants !`)
                        .setTimestamp();
        
                    interaction.followUp({ embeds: [successActivateMessagesEmbed], ephemeral: false });
                });
        
                response.delete();
            });
        }
        



        if (interaction.customId === 'disable_autorole') {
            if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild)) {
                const notAuthorizedEmbed = new Discord.EmbedBuilder()
                    .setColor(config.embeds.error)
                    .setTitle("Permission manquante ❌")
                    .setDescription("**Tu n'as pas la permision ``Gérer le serveur``, nécéssaire pour effectuer cette action.**")

                return interaction.reply({ 
                    embeds: [notAuthorizedEmbed], 
                    ephemeral: true 
                });
            }

            const sql = `UPDATE guild_settings SET autorole_enabled = FALSE, autorole_role_id = NULL WHERE guild_id = ?`;
            db.query(sql, [guildId], (err) => {
                if (err) {
                    console.error(err);

                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor(config.embeds.error)
                        .setTitle("Oups, une erreur est survenue.. ❌")
                        .setDescription("Veuillez réessayer.\n\n**Si cette erreur persiste, veuillez ouvrir un ticket sur le** [Discord support](https://discord.gg/fFw4w7EBWn)**.**")

                    interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                }
                const successDesactivateMessagesEmbed = new Discord.EmbedBuilder()
                    .setColor(0xff7474)
                    .setDescription(`L'**autorole** a été désactivé !`)
                    .setTimestamp()

                interaction.reply({ embeds: [successDesactivateMessagesEmbed], ephemeral: false });
            });
        }
    }
};
