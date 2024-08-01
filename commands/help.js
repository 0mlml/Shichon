const { config } = require('../util/settings.js');
const { getEmbedTemplate, canUserExecute } = require('../util/utils.js');
const { Command, categories } = require('./../classes/command.js');

class HelpCommand extends Command {
    static name = 'help';
    static description = 'Get help on usage of the bot';
    static aliases = ['commands', 'cmds'];
    static category = categories.util;

    async run() {
        const resEmbed = getEmbedTemplate(this.message.author);
        const { commands } = this.client;
        if (!this.args.length) {
            resEmbed.setDescription(`Here's a list of all my commands:\nYou can send \`${config.prefix}help [command name]\` to get info on a specific command!`);
            for (let i of Object.keys(categories)) {
                if (i === 'hidden') continue;
                const data = [];
                data.push(commands.map((command) => {
                    if (command?.category === categories[i]) return canUserExecute(this.message, command) ? command.name : `~~${command.name}~~`;
                }).filter((value) => {
                    return value !== undefined;
                }).join(`, `));
                resEmbed.addField(categories[i], data.join('\n'));
            }
            this.succeed();
            return this.message.channel.send({ embeds: [resEmbed] });
        }
        const name = this.args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return this.fail('That\'s not a valid command!');
        }

        resEmbed.setDescription('');
        resEmbed.addField(`**Name:**`, command.name, true);

        if (command.aliases.length) resEmbed.addField(`** Aliases:**`, command.aliases.join(', '), true);
        if (command.description) resEmbed.addField(`** Description:**`, command.description, true);
        if (command.permissions.length) resEmbed.addField(`** Permissions:**`, '' + (command.permissions instanceof Array ? command.permissions.join(', ') : command.permissions), true);
        if (command.category) resEmbed.addField(`** Category:**`, command.category, true);
        if (command.cooldown) resEmbed.addField(`** Cooldown:**`, '' + command.cooldown, true);
        if (command.usage) resEmbed.addField(`** Usage:** `, `\`${config.prefix}${command.name} ${command.usage}\``, false);

        this.succeed();
        return this.message.channel.send({ embeds: [resEmbed] });
    }

}

module.exports.command = HelpCommand;