const fs = require("fs");
const path = require("path");

module.exports = async bot => {
    const loadCommands = (dir) => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                loadCommands(filePath);
            } else if (file.endsWith(".js")) {
                try {
                    let command = require(filePath);
                    if (!command.name || typeof command.name !== "string") {
                        throw new TypeError(`La commande ${file.slice(0, file.length - 3)} n'a pas de nom !`);
                    }
                    bot.commands.set(command.name, command);
                    console.log(`Commande ${command.name} chargée avec succès !`);
                } catch (err) {
                    console.error(`Erreur lors du chargement de la commande ${command.name}: ${err.message}`);
                }
            }
        });
    };

    loadCommands(path.join(__dirname, "../commands"));
};
