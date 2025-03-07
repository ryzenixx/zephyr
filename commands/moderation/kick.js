const Discord = require("discord.js");

module.exports = {
    name: "kick",
    description: "Exclure un utilisateur de ce serveur",
    permission: Discord.PermissionFlagsBits.KickMembers,
    dm: false,
    options: [
        {
            type: "user",
            name: "utilisateur",
            description: "Nom de l'utilisateur à exclure",
            required: true
        },
        {
            type: "string",
            name: "raison",
            description: "Raison de l'exclusion",
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

                    console.error(error);

                    const embedNotInTheServer = new Discord.EmbedBuilder()
                        .setColor(0xf56868)
                        .setTitle("Oups, une erreur s'est produite... ❌")
                        .setDescription(`L'utilisateur \`\`${utilisateur.tag}\`\` n'est pas dans ce serveur.`)
                        .setTimestamp()
                        .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });

                    return interaction.rely({ embeds: [embedNotInTheServer] });

                }

                if(!member.kickable) {
                    const embedNotKickable = new Discord.EmbedBuilder()
                        .setColor(0xf56868)
                        .setTitle("Oups, une erreur s'est produite... ❌")
                        .setDescription(`Je ne suis pas en mesure d'exclure \`\`${utilisateur.tag}\`\`. Vérifiez mes permissions et autorisations sur ce serveur.`)
                        .setTimestamp()
                        .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });

                    return interaction.reply({ embeds: [embedNotKickable] })
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

                const embedKicked = new Discord.EmbedBuilder()
                    .setColor(0x9cff8e)
                    .setTitle(`${utilisateur.tag} **a été expulsé.** ✅`)
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

                    await utilisateur.send({ content: `🚨 **Tu as été expulsé de ${interaction.guild.name}** 🚨\n📌 **Raison :** ${raison}`, components: [discordNameButton] });
                } catch (error) {
                    console.error(error);
                    console.log(`Impossible d'envoyer un DM à ${utilisateur.tag}.`);
                }

                await member.kick(raison);
                await interaction.reply({ embeds: [embedKicked] })

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