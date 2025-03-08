const Discord = require("discord.js");
require("dotenv").config()
const config = require("../../config.json")

module.exports = {
    name: "blague",
    description: "Affiche une blague aléatoire",
    dm: false,
    // options: [
    //    {
    //        type: "string",
    //        name: "type",
    //        description: "Le type de la blague",
    //        required: false,
    //        choices: [
    //            { name: 'Général', value: 'global' },
    //            { name: 'Développeur', value: 'dev' },
    //            { name: 'Humour noir', value: 'dark' },
    //            { name: 'Limite', value: 'limit' },
    //            { name: 'Beauf', value: 'beauf' },
    //            { name: 'Blondes', value: 'blondes' }
    //        ]
    //    },
    //],

    async run(bot, interaction) {
        
        let url = 'https://www.blagues-api.fr/api/random';
    
        
        try {
            await interaction.deferReply();
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${process.env.BLAGUES_API_TOKEN}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    const embedTypeInvalid = new Discord.EmbedBuilder()
                        .setColor(config.embeds.error)
                        .setTitle("Type de blague non disponible ❌")
                        .setDescription("Ce type de blague n'existe pas. Utilisez l'un des types suivants : global, dev, dark, limit, beauf, blondes.")
                        .setTimestamp()
                        .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });
                    
                    return interaction.editReply({ embeds: [embedTypeInvalid] });
                } else {
                    throw new Error(`Erreur API: ${response.status}`);
                }
            }
            
            const blague = await response.json();
            
            const embedBlague = new Discord.EmbedBuilder()
                .setColor(0x9cff8e)
                .setTitle("Les blagues de Zéphyr 🤣")
                .addFields(
                    { name: 'Question:', value: blague.joke },
                    { name: 'Réponse:', value: `||${blague.answer}||` }
                )
                .setTimestamp()
                .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });
            
            await interaction.editReply({ embeds: [embedBlague] });
            
        } catch (error) {
            console.error("Erreur lors de la récupération de la blague:", error);
            
            const embedError = new Discord.EmbedBuilder()
                .setColor(config.embeds.error)
                .setTitle("Oups, une erreur s'est produite... ❌")
                .setDescription("Impossible de récupérer une blague pour le moment. Veuillez réessayer plus tard.")
                .setTimestamp()
                .setFooter({ text: 'Zéphyr - Votre assistant Discord', iconURL: bot.user.displayAvatarURL() });
            
            await interaction.editReply({ embeds: [embedError] });
        }

    }
}