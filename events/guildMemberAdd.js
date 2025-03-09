const Discord = require('discord.js');
const { createCanvas, loadImage } = require("@napi-rs/canvas");

module.exports = async (bot, member) => {
    const guildId = member.guild.id;
    let db = bot.db;

    const sql = `SELECT welcome_enabled, welcome_channel_id, autorole_enabled, autorole_role_id FROM guild_settings WHERE guild_id = ?`;
    db.query(sql, [guildId], async (err, result) => {
        if (err) return console.error(err);

        if (result.length > 0 && result[0].welcome_enabled) {
            const channel = member.guild.channels.cache.get(result[0].welcome_channel_id);

            if (channel) {
                const botMember = member.guild.members.me;

                if (botMember.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
                    sendWelcomeMessage(channel, member);
                } else {
                    const botPermissions = channel.permissionsFor(botMember);
                    
                    if (botPermissions && botPermissions.has([Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages])) {
                        sendWelcomeMessage(channel, member);
                    } else {
                        console.error(`Le bot n'a pas les permissions nécessaires dans le salon ${channel.name}`);
                    }
                }
            } else {
                console.error(`Le salon spécifié avec l'ID ${result[0].welcome_channel_id} est introuvable.`);
            }
        }


        if (result.length > 0 && result[0].autorole_enabled) {
            const roleId = result[0].autorole_role_id;
            const role = member.guild.roles.cache.get(roleId);

            if (role) {
                try {
                    await member.roles.add(role);
                } catch (error) {
                    console.error(`Erreur lors de l'attribution du rôle à ${member.user.tag}:`, error);
                }
            } else {
                console.error(`Le rôle spécifié avec l'ID ${roleId} est introuvable.`);
            }
        }
    });
};


async function sendWelcomeMessage(channel, member) {
    const canvas = createCanvas(800, 200);
    const context = canvas.getContext("2d");

    try {
        const backgroundImage = await loadImage("./images/welcome.png");
        context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        const avatar = await loadImage(
            member.user.displayAvatarURL({ extension: "png", size: 128 })
        );

        context.save();
        context.beginPath();
        context.arc(100, 100, 75, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        context.drawImage(avatar, 25, 25, 150, 150);
        context.restore();

        const attachment = new Discord.AttachmentBuilder(canvas.toBuffer("image/png"), { name: "bienvenue.png" });

        const embed = new Discord.EmbedBuilder()
            .setColor(0x8c6dff)
            .setTitle("Oh, un nouveau membre !")
            .setDescription(`🎉 Bienvenue ${member.user} sur **${member.guild.name}** !`)
            .setImage("attachment://bienvenue.png")
            .setTimestamp();

        channel.send({ content: `${member}`, embeds: [embed], files: [attachment] });

    } catch (error) {
        console.error("Erreur lors de la création de l'image de bienvenue: ", error);
    }
}
