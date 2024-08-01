const { client } = require('../app');
const { Command, categories } = require('../classes/command');
const utils = require('../util/utils');
const sU = require('../util/settings');

class BlacklistCommand extends Command {
    static name = `blacklist`;
    static description = `Prevent phrases from being typed`;
    static usage = `add | remove <value>\nlist`;
    static aliases = [`bl`];
    static reqArgs = true;
    static permissions = ['MANAGE_MESSAGES', 'MANAGE_CHANNELS', 'ADMIN'];
    static category = categories.mod;

    async run() {
        if (!sU.settings[this.message.guild.id]) sU.addNewGuildSettings(this.message.guild.id);
        const subcommand = args[0].toLocaleLowerCase();
        if (subcommand === 'add') {
            let phrase = args.splice(1).join(' ');
            if (sU.settings[this.message.guild.id].blacklist.includes(phrase)) return this.fail(`${phrase} was already in the blacklist!`);
            sU.settings[this.message.guild.id].blacklist.push(phrase);
            this.succeed(`Added ${phrase} to blacklist!`)
            utils.sendToModChannel(this.message.guild.id, this.message.author, `Added ${phrase} to blacklist!`);
        } else if (subcommand === 'remove') {
            let phrase = args.splice(1).join(' ');
            if (!sU.settings[this.message.guild.id].blacklist.includes(phrase)) return this.fail(`${phrase} was not in the blacklist!`);
            sU.settings[this.message.guild.id].blacklist.splice(sU.settings[this.message.guild.id].blacklist.indexOf(phrase), 1);
            this.succeed(`Removed ${phrase} from blacklist!`)
            utils.sendToModChannel(this.message.guild.id, this.message.author, `Removed ${phrase} from blacklist!`);
        } else if (subcommand === 'list') {
            if (sU.settings[this.message.guild.id].blacklist.length < 1) return this.fail(`Nothing in the blacklist`);
            this.succeed(`Blacklist:\n${sU.settings[this.message.guild.id].blacklist.join('\n')}`);
        }
        sU.saveSettings();
    }
}

module.exports.command = BlacklistCommand;