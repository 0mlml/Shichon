const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils');
const { settings } = require('../util/settings');
const econ = require('../util/economy');

class EconCustomizeCommand extends Command {
    static name = 'ecustomize';
    static description = 'Customize your profile (economy)';
    static aliases = ['ecustom', 'ec'];
    static usage = '[user] <name | color> <value>';
    static reqArgs = true;
    static category = categories.econ;
    static cooldown = 300;

    async run() {
        let member = this.message.mentions.members.first() || await this.message.guild.members.fetch(this.args[0]).catch(r => { console.log(r) });
        if (member) {
            if (member !== this.message.member && utils.canUserExecute(this.message, { permissions: ['ADMINISTATOR'] })) return this.fail('You cannot edit other users!');
            this.args.shift();
        }
        member = member || this.message.member;
        let udata = econ.getUser(member.id);
        if (this.args[0].toLocaleLowerCase() === 'name') {
            this.args.shift();
            udata.displayName = this.args.join(' ').substring(0, this.args.join(' ').length < 32 ? this.args.join(' ').length : 32);
        } else if (this.args[0].toLocaleLowerCase() === 'color') {
            this.args.shift();
            let hex = this.args[0].match(/#?[0-9A-F]{6}/i)[0];
            if (hex) udata.displayColor = hex;
            else return this.fail('Invalid hex!');
        } else {
            return this.fail('No valid subcommand!');
        }
        this.succeed();
        econ.saveEconomy();
    }
}

module.exports.command = EconCustomizeCommand;