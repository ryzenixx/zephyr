const Discord = require("discord.js");

module.exports = {
    name: "ban",
    description: "Bannir un utilisateur de ce serveur",
    permission: Discord.PermissionFlagsBits.BanMembers,
    dm: false,
    options: [
        {
            type: "user",
            name: "utilisateur",
            description: "Nom de l'utilisateur à bannir",
            required: true
        },
        {
            type: "string",
            name: "raison",
            description: "Raison du bannissement",
            required: false
        },
    ],

    async run(bot, interaction) {
        
        let db = bot.db;
        const guildId = interaction.guild.id;

        const sql = `SELECT mod_commands_enabled FROM guild_settings WHERE guild_id = ?`;
        db.query(sql, [guildId], async (err, result) => {

            if(err) {
                console.error(err);
                return interaction.reply({ content: "**Une erreur s'est produite lors de la récupération des paramètres pour votre serveur. ❌**", ephemeral: true });
            }

            let ModCommandsEnabled = false;

            if(result.length > 0) {
                ModCommandsEnabled = result[0].mod_commands_enabled;
            }

            if(ModCommandsEnabled){
                
                const utilisateur = interaction.options.getUser('utilisateur');
                const raison = interaction.options.getString('raison') || 'Aucune raison fournie.';

                let member;
                try {
                    member = await interaction.guild.members.fetch(utilisateur.id);
                } catch (error) {

                    const embedNotInTheServer = new Discord.EmbedBuilder()
                        .setColor(0xf56868)
                        .setTitle("Oups, une erreur s'est produite... ❌")
                        .setDescription(`L'utilisateur \`\`${utilisateur.tag}\`\` n'est pas dans ce serveur.`)
                        .setTimestamp()
                        .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });

                    return interaction.rely({ embeds: [embedNotInTheServer] });

                }

                if(!member.bannable) {
                    const embedNotBannable = new Discord.EmbedBuilder()
                        .setColor(0xf56868)
                        .setTitle("Oups, une erreur s'est produite... ❌")
                        .setDescription(`Je ne suis pas en mesure de bannir \`\`${utilisateur.tag}\`\`. Vérifiez mes permissions et autorisations sur ce serveur.`)
                        .setTimestamp()
                        .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });

                    return interaction.reply({ embeds: [embedNotBannable] })
                }

                if(!member) {
                    const embedNotInTheServer = new Discord.EmbedBuilder()
                        .setColor(0xf56868)
                        .setTitle("Oups, une erreur s'est produite... ❌")
                        .setDescription(`L'utilisateur \`\`${utilisateur.tag}\`\` n'est pas dans ce serveur.`)
                        .setTimestamp()
                        .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });

                    return interaction.rely({ embeds: [embedNotInTheServer] });
                }

                const embedBanned = new Discord.EmbedBuilder()
                    .setColor(0x9cff8e)
                    .setTitle(`${utilisateur.tag} **a été banni.** ✅`)
                    .setDescription(`\n\n**Raison:** ${raison}`)
                    .setTimestamp()
                    .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });

                try {
                    const discordNameButton = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('01')
                            .setStyle(Discord.ButtonStyle.Secondary)
                            .setLabel(`Envoyé depuis: ${interaction.guild.name}`)
                            .setDisabled(true)
                    )

                    await utilisateur.send({ content: `🚨 **Tu as été banni de ${interaction.guild.name}** 🚨\n📌 **Raison :** ${raison}`, components: [discordNameButton] });
                } catch (error) {
                    console.log(`Impossible d'envoyer un DM à ${user.tag}.`);
                }

                await member.ban({ reason: raison });
                await interaction.reply({ embeds: [embedBanned] })

            }
            else {

                const embedDisabled = new Discord.EmbedBuilder()
                    .setColor(0xf56868)
                    .setDescription("**Les commandes de modération sont désactivées sur ce serveur. ❌**")

                await interaction.reply({ embeds: [embedDisabled] })
            }

        });

    }
}