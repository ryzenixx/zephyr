const Discord = require('discord.js');
const { createCanvas, loadImage } = require("@napi-rs/canvas");

module.exports = async (bot, member) => {
    const guildId = member.guild.id;
    let db = bot.db;

    const sql = `SELECT welcome_enabled, welcome_channel_id FROM guild_settings WHERE guild_id = ?`;
    db.query(sql, [guildId], async (err, result) => {
        if (err) return console.error(err);

        if (result.length > 0 && result[0].welcome_enabled) {
            const channel = member.guild.channels.cache.get(result[0].welcome_channel_id);

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

                if (channel) channel.send({ content: `${member}`, embeds: [embed], files: [attachment] });

            } catch (error) {
                console.error("Erreur lors de la création de l'image de bienvenue: ", error);
            }
        }
    });
};
