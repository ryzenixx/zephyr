const Discord = require("discord.js");
const config = require("../config.json");
const discordTranscripts = require('discord-html-transcripts');
const path = require('path');
const express = require('express');
const app = express();
const fs = require('fs');
const transcriptFolder = path.join(__dirname, 'transcripts');

if (!fs.existsSync(transcriptFolder)) {
    fs.mkdirSync(transcriptFolder);
}

app.use('/transcripts', express.static(transcriptFolder));

const PORT = 25588;
app.listen(PORT, () => {
    console.log(`Serveur d'hébergement de transcripts actif sur le port ${PORT}`);
});

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
            interaction.message.delete();

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

                    interaction.editReply({ content: ` `, embeds: [successActivateMessagesEmbed], ephemeral: false });
                });
    
                response.delete();
            });
    
        }
        


        if (interaction.customId === 'disable_welcome') {
            interaction.message.delete();

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

                interaction.reply({ embeds: [successDesactivateMessagesEmbed], ephemeral: true });
            });
        }



        if (interaction.customId === 'enable_autorole') {
            interaction.message.delete();

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
        
                    interaction.editReply({ content: ` `, embeds: [successActivateMessagesEmbed], ephemeral: false });
                });
        
                response.delete();
            });
        }
        



        if (interaction.customId === 'disable_autorole') {
            interaction.message.delete();

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

                interaction.reply({ embeds: [successDesactivateMessagesEmbed], ephemeral: true });
            });
        }

        if (interaction.customId === 'enable_ticket') {
            interaction.message.delete();

            if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild)) {
                const notAuthorizedEmbed = new Discord.EmbedBuilder()
                    .setColor(config.embeds.error)
                    .setTitle("Permission manquante ❌")
                    .setDescription("**Tu n'as pas la permission `Gérer le serveur`, nécessaire pour effectuer cette action.**");
        
                return interaction.reply({
                    embeds: [notAuthorizedEmbed],
                    ephemeral: true
                });
            }
        
            await interaction.reply({
                content: "📢 **Mentionne le salon dans lequel je dois envoyer le panel d'ouverture des tickets.** (ex: `#ouvrir-un-ticket`)",
                ephemeral: true
            });
        
            const filter = response => response.author.id === interaction.user.id && response.mentions.channels.size > 0;
            const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });
        
            collector.on('collect', async response => {
                const channelId = response.mentions.channels.first().id;
                response.delete();
        
                await interaction.editReply({
                    content: `**Choisis la catégorie dans laquelle je dois placer les tickets:**`,
                });
        
                const categories = interaction.guild.channels.cache
                    .filter(c => c.type === Discord.ChannelType.GuildCategory)
                    .first(25);
        
                const options = categories.map(category => ({
                    label: category.name,
                    value: category.id
                }));
        
                const categorySelector = new Discord.ActionRowBuilder().addComponents(
                    new Discord.StringSelectMenuBuilder()
                        .setCustomId('select_ticket_category')
                        .setPlaceholder('Sélectionne une catégorie')
                        .addOptions(options)
                );
        
                await interaction.editReply({
                    content: `Choisis la catégorie dans laquelle je dois placer les tickets:`,
                    components: [categorySelector]
                });
        
                const categoryFilter = i => i.user.id === interaction.user.id && i.customId === 'select_ticket_category';
                const categoryCollector = interaction.channel.createMessageComponentCollector({ categoryFilter, time: 30000, max: 1 });
        
                categoryCollector.on('collect', async i => {
                    const categoryId = i.values[0];
        
                    await interaction.editReply({
                        content: `**Mentionne le rôle support pour les tickets.** (ex: \`@Support\`)`,
                        components: []
                    });
        
                    const roleFilter = response => response.author.id === interaction.user.id && response.mentions.roles.size > 0;
                    const roleCollector = interaction.channel.createMessageCollector({ roleFilter, time: 30000, max: 1 });
        
                    roleCollector.on('collect', async roleResponse => {
                        const roleId = roleResponse.mentions.roles.first().id;
                        roleResponse.delete();
        

                        const sql = `UPDATE guild_settings SET ticket_enabled = TRUE, ticket_category_id = ?, role_support_ticket_id = ? WHERE guild_id = ?`;
                        db.query(sql, [categoryId, roleId, guildId], async (err) => {
                            if (err) {
                                console.error(err);
                                const errorEmbed = new Discord.EmbedBuilder()
                                    .setColor(config.embeds.error)
                                    .setTitle("Oups, une erreur est survenue.. ❌")
                                    .setDescription("Veuillez réessayer.\n\n**Si cette erreur persiste, veuillez ouvrir un ticket sur le** [Discord support](https://discord.gg/fFw4w7EBWn)**.");
                                return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                            }
        

                            const successEmbed = new Discord.EmbedBuilder()
                                .setColor("#d0ffa9")
                                .setDescription(`Les **tickets** ont été activés dans <#${channelId}>, et seront placés dans la catégorie **<#${categoryId}>** !`)
                                .setTimestamp();
        
                            await interaction.editReply({ content: ' ', embeds: [successEmbed], ephemeral: false });
        

                            const channel = interaction.guild.channels.cache.get(channelId);
                            if (channel) {
                                const openTicketEmbed = new Discord.EmbedBuilder()
                                    .setColor("#82f8bb")
                                    .setTitle("Ouvrir un ticket ✍️")
                                    .setDescription(`Clique sur le bouton ci-dessous pour ouvrir un ticket !`)
                                    .setTimestamp()
                                    .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });
        
                                const openTicketButton = new Discord.ButtonBuilder()
                                    .setCustomId('openTicket')
                                    .setLabel("Ouvrir un ticket")
                                    .setEmoji("✍️")
                                    .setStyle(Discord.ButtonStyle.Primary);
        
                                const openTicketActionRow = new Discord.ActionRowBuilder()
                                    .addComponents(openTicketButton);
        

                                channel.send({ embeds: [openTicketEmbed], components: [openTicketActionRow] });
                            }
                        });
                    });
                    i.deferUpdate();
                });
            });
        }
        
        
        
        if (interaction.customId === 'disable_ticket') {
            interaction.message.delete();

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

            const sql = `UPDATE guild_settings SET ticket_enabled = FALSE, ticket_category_id = NULL, role_support_ticket_id = NULL WHERE guild_id = ?`;
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
                    .setDescription(`Les **tickets** ont été désactivés !`)
                    .setTimestamp()

                interaction.reply({ embeds: [successDesactivateMessagesEmbed], ephemeral: true });
            });
        }

        if (interaction.customId === "openTicket") {
            const sql = `SELECT ticket_category_id, role_support_ticket_id FROM guild_settings WHERE guild_id = ?`;
            db.query(sql, [guildId], async (err, result) => {
                if (err) return console.error(err);
        
                if (result.length > 0) {
                    const categoryId = result[0].ticket_category_id;
                    const category = interaction.guild.channels.cache.get(categoryId);
                    const roleSupportTicketId = result[0].role_support_ticket_id;
        
                    if (category) {
                        let ticketName = `ticket-${interaction.user.username.replace(/[^\w\s-]/gi, '')}`;
        
                        if (ticketName.length > 100) {
                            ticketName = ticketName.substring(0, 100);
                        }
        
                        try {
                            const ticketChannel = await interaction.guild.channels.create({
                                name: `${ticketName}`,
                                type: Discord.ChannelType.GuildText,
                                parent: category.id,
                                topic: `Ticket de ${interaction.user.username}`,
                                permissionOverwrites: [
                                    {
                                        id: interaction.guild.id,
                                        deny: [Discord.PermissionFlagsBits.ViewChannel],
                                    },
                                    {
                                        id: interaction.user.id,
                                        allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages],
                                    },
                                    {
                                        id: roleSupportTicketId,
                                        allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages],
                                    }
                                ],
                            });

                            const ticketMessageEmbed = new Discord.EmbedBuilder()
                                .setColor("#709eff")
                                .setTitle("Bienvenue dans votre ticket ! 👋")
                                .setTimestamp()
                                .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });

                            
                            const closeTicketButton = new Discord.ButtonBuilder()
                                .setCustomId("close_ticket")
                                .setStyle(Discord.ButtonStyle.Danger)
                                .setLabel("🔒")

                            const ticketActionRow = new Discord.ActionRowBuilder()
                                .addComponents(closeTicketButton)
                            
                            await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [ticketMessageEmbed], components: [ticketActionRow] });

                            const createdTicketEmbed = new Discord.EmbedBuilder()
                                .setColor(config.embeds.success)
                                .setDescription(`**Votre ticket a été créé dans le salon <#${ticketChannel.id}> !**`);
                            
                            let urlTicketButton = `https://discord.com/channels/${guildId}/${ticketChannel.id}`;
                            
                            const goToTicketButton = new Discord.ButtonBuilder()
                                .setStyle(Discord.ButtonStyle.Link)
                                .setURL(urlTicketButton)
                                .setLabel("Aller au ticket");
                            
                            const goToTicketActionRow = new Discord.ActionRowBuilder()
                                .addComponents(goToTicketButton);
                            
                            await interaction.reply({
                                embeds: [createdTicketEmbed],
                                components: [goToTicketActionRow],
                                ephemeral: true,
                            });
                            
                        } catch (error) {
                            console.error("Erreur lors de la création du salon :", error);

                            const errorEmbed = new Discord.EmbedBuilder()
                                .setColor(config.embeds.error)
                                .setTitle("Oups, une erreur est survenue.. ❌")
                                .setDescription("Veuillez réessayer.\n\n**Si cette erreur persiste, veuillez ouvrir un ticket sur le** [Discord support](https://discord.gg/fFw4w7EBWn)**.**")

                            await interaction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true,
                            });
                        }
                    } else {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor(config.embeds.error)
                            .setTitle("Oups, une erreur est survenue.. ❌")
                            .setDescription("Le système de ticket est désactivé sur ce serveur **ou** la catégorie définie lors de la configuration n'est plus disponible.")

                        await interaction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true,
                        });
                    }
                } else {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setColor(config.embeds.error)
                        .setTitle("Oups, une erreur est survenue.. ❌")
                        .setDescription("Le système de ticket est désactivé sur ce serveur **ou** la catégorie définie lors de la configuration n'est plus disponible.")

                    await interaction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true,
                    });
                }
            });
        }


        if (interaction.customId === "close_ticket") {

            const wantCloseTicketEmbed = new Discord.EmbedBuilder()
                .setColor(config.embeds.error)
                .setDescription("**Êtes-vous sûr de vouloir fermer ce ticket ?** ❌")

            const wantCloseTicketButton = new Discord.ButtonBuilder()
                .setCustomId("confirm_close_ticket")
                .setLabel("Confirmer")
                .setStyle(Discord.ButtonStyle.Danger)
                .setEmoji("🔒")
            
            const wantCloseTicketActionRow = new Discord.ActionRowBuilder()
                .addComponents(wantCloseTicketButton)

            interaction.reply({ embeds: [wantCloseTicketEmbed], components: [wantCloseTicketActionRow], ephemeral: true })

        }

        if (interaction.customId === "confirm_close_ticket") {
            const sql = `SELECT role_support_ticket_id FROM guild_settings WHERE guild_id = ?`;
            db.query(sql, [guildId], async (err, result) => {
                if (err) return console.error(err);
        
                if (result.length > 0) {
                    const roleSupportTicketId = result[0].role_support_ticket_id;

                const ticketChannel = interaction.channel;

                ticketChannel.permissionOverwrites.set([
                    {
                        id: interaction.guild.id,
                        deny: [Discord.PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: roleSupportTicketId,
                        allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages],
                    }
                ])

                const infoClosedEmbed = new Discord.EmbedBuilder()
                    .setColor(config.embeds.error)
                    .setDescription(`**Vous venez de fermer ce ticket.**`)

                const closedEmbed = new Discord.EmbedBuilder()
                    .setColor(config.embeds.error)
                    .setDescription(`**Ce ticket a été fermé par <@${interaction.user.id}>.**`)
                    .setTimestamp();

                const transcriptedEmbed = new Discord.EmbedBuilder()
                    .setColor(config.embeds.error)
                    .setDescription(`**La transcription de ce ticket est disponible en cliquant sur le bouton ci-dessous !** 📜`)
                    .setTimestamp();

                const attachment = await discordTranscripts.createTranscript(ticketChannel);

                const transcriptPath = path.join(transcriptFolder, `${ticketChannel.id}.html`);
                fs.writeFileSync(transcriptPath, attachment.attachment);

                const transcriptURL = `http://188.165.160.38:${PORT}/transcripts/${ticketChannel.id}.html`;

                const deleteTicketButton = new Discord.ButtonBuilder()
                    .setCustomId("delete_ticket")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setEmoji("🗑️")

                const transcriptTicketButton = new Discord.ButtonBuilder()
                    .setLabel("Accéder au transcript")
                    .setURL(`${transcriptURL}`)
                    .setStyle(Discord.ButtonStyle.Link);
                
                const deleteTicketActionRow = new Discord.ActionRowBuilder()
                    .addComponents(deleteTicketButton, transcriptTicketButton)

                await interaction.reply({ embeds: [infoClosedEmbed], ephemeral: true })
                await interaction.channel.send({ embeds: [closedEmbed, transcriptedEmbed], components: [deleteTicketActionRow] })
                await interaction.channel.setName("ticket-fermé");
            }
        });
        }

        if (interaction.customId === "delete_ticket") {
            
            const deleteInProgressEmbed = new Discord.EmbedBuilder()
                .setColor(config.embeds.error)
                .setDescription("**🗑️ Ce ticket va être supprimé dans quelques secondes...**")

            await interaction.reply({ embeds: [deleteInProgressEmbed] })

            setTimeout(() => {
                interaction.channel.delete();
            }, 5000);
        }
        
        
    }
};
