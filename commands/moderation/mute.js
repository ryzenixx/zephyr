const Discord = require("discord.js");

module.exports = {
    name: "mute",
    description: "Réduire au silence un utilisateur de ce serveur",
    permission: Discord.PermissionFlagsBits.ModerateMembers,
    dm: false,
    options: [
        {
            type: "user",
            name: "utilisateur",
            description: "Nom de l'utilisateur à mute",
            required: true
        },
        {
            type: "string",
            name: "duree",
            description: "Durée du mute (ex: 10m, 2h, 3j, 1h30m)",
            required: true
        },
        {
            type: "string",
            name: "raison",
            description: "Raison du mute",
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
                const dureeString = interaction.options.getString('duree');
                const raison = interaction.options.getString('raison') || 'Aucune raison fournie.';
    
                let dureeMsTotal = 0;
                let formattedDuration = '';
    
                try {
                    const pattern = /(\d+)([mhjd])/g;
                    let match;
                    
                    while ((match = pattern.exec(dureeString)) !== null) {
                        const valeur = parseInt(match[1]);
                        const unite = match[2];
                        
                        let dureeMs = 0;
                        
                        switch (unite) {
                            case 'm':
                                dureeMs = valeur * 60 * 1000;
                                formattedDuration += `${valeur} minute(s) `;
                                break;
                            case 'h':
                                dureeMs = valeur * 60 * 60 * 1000;
                                formattedDuration += `${valeur} heure(s) `;
                                break;
                            case 'j':
                                dureeMs = valeur * 24 * 60 * 60 * 1000;
                                formattedDuration += `${valeur} jour(s) `;
                                break;
                            case 'd':
                                dureeMs = valeur * 24 * 60 * 60 * 1000;
                                formattedDuration += `${valeur} jour(s) `;
                                break;
                            default:
                                throw new Error('Format de durée invalide');
                        }
                        
                        dureeMsTotal += dureeMs;
                    }
                    
                    if (dureeMsTotal === 0) {
                        throw new Error('Format de durée invalide');
                    }
                } catch (error) {
                    const embedInvalidFormat = new Discord.EmbedBuilder()
                        .setColor(0xff4c4c)
                        .setTitle("Oups, une erreur s'est produite... ❌")
                        .setDescription("Le format de durée est invalide. Utilisez des formats comme '``10m``', '``2h``', '``3j``' ou une combinaison comme '``1h30m``'.")
                        .setTimestamp()
                        .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });
    
                    return interaction.reply({ embeds: [embedInvalidFormat] });
                }
    
                const maxTimeout = 28 * 24 * 60 * 60 * 1000;
                if (dureeMsTotal > maxTimeout) {
                    const embedTooLong = new Discord.EmbedBuilder()
                        .setColor(0xff4c4c)
                        .setTitle("Oups, une erreur s'est produite... ❌")
                        .setDescription("Un mute ne peut pas dépasser 28 jours.")
                        .setTimestamp()
                        .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });
    
                    return interaction.reply({ embeds: [embedTooLong] });
                }
    
                let member;
                try {
                    member = await interaction.guild.members.fetch(utilisateur.id);
                } catch (error) {
                    const embedNotInTheServer = new Discord.EmbedBuilder()
                        .setColor(0xff4c4c)
                        .setTitle("Oups, une erreur s'est produite... ❌")
                        .setDescription(`L'utilisateur \`\`${utilisateur.tag}\`\` n'est pas dans le serveur.`)
                        .setTimestamp()
                        .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });
    
                    return interaction.reply({ embeds: [embedNotInTheServer] });
                }
    
                if (!member.moderatable) {
                    const embedNotMutable = new Discord.EmbedBuilder()
                        .setColor(0xff4c4c)
                        .setTitle("Oups, une erreur s'est produite... ❌")
                        .setDescription(`Je ne suis pas en mesure de réduire au silence \`\`${utilisateur.tag}\`\`. Vérifiez mes permissions et autorisations sur ce serveur.`)
                        .setTimestamp()
                        .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });
    
                    return interaction.reply({ embeds: [embedNotMutable] });
                }
    
                const dateExpiration = new Date(Date.now() + dureeMsTotal);
    
                const embedMuted = new Discord.EmbedBuilder()
                    .setColor(0x9cff8e)
                    .setTitle(`${utilisateur.tag} **a été réduit au silence.** ✅`)
                    .setDescription(`\n\n**Durée:** ${formattedDuration}\n**Raison:** ${raison}`)
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
                    );
    
                    await utilisateur.send({ 
                        content: `🔇 **Tu as été réduit au silence sur ${interaction.guild.name}** 🔇\n⏱️ **Durée :** ${formattedDuration}\n📌 **Raison :** ${raison}`, 
                        components: [discordNameButton] 
                    });
                } catch (error) {
                    console.log(`Impossible d'envoyer un DM à ${utilisateur.tag}.`);
                }
    
                await member.timeout(dureeMsTotal, raison);
                await interaction.reply({ embeds: [embedMuted] });

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