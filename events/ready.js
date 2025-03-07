const { ActivityType } = require("discord.js");
const loadSlashCommand = require("../loaders/loadSlashCommands")
const loadDatabase = require("../loaders/loadDataBase")

module.exports = async (bot) => {
  async function connectToDataBase() {
    try {
      bot.db = loadDatabase()
      bot.db.connect(function () {
        console.log("Connecté à la base de données")
      })

      bot.db.on("error", async function (err) {
        console.log("Erreur de la base de données:", err)
        if (err.code === "ECONNRESET") {
          try {
            const db = loadDatabase()
            console.log("Reconnecté à la base de donnée !")
            bot.db = db
          } catch (errDB) {
            console.error(
              "Erreur lors de la reconnexion à la base de données:",
              errDB
            )
          }
        } else {
          throw err
        }
      })
    } catch (error) {
      console.error("Erreur lors de la connexion à la base de données:", error)
    }
  }

  await connectToDataBase()

  await loadSlashCommand(bot)

  bot.user.setPresence({
    status: "online",
    activities: [
      {
        name: "Un bot Discord open-source.",
        type: ActivityType.Custom
      },
    ],
  });

  console.log(`${bot.user.tag} est en ligne !`)
}
