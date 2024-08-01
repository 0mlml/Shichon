const utils = require('../util/utils');

const { Command, categories } = require('./../classes/command.js');

class BanCommand extends Command {
    static name = 'ban';
    static reqArgs = true;
    static permissions = ['BAN_MEMBERS', 'MOD'];
    static description = 'Bans a member';
    static usage = '<member>';
    static category = categories.mod;

    async run() {
        const victim = this.message.mentions.members.first() || await this.message.guild.members.fetch(this.args[0]).catch(r => { console.log(r) });
        if (!victim) return this.fail(`Please provide a target as an ID or a mention`);
        if (!victim.bannable) return this.fail('not bannable');
        victim.ban({ reason: `requested by ${this.message.author.tag}` });
        utils.sendToModChannel(this.message.guild.id, this.message.author, `Banned ${victim.toString()} (${victim.id})`);
        this.succeed(`Banned ${victim.user.tag}!`)
    }
}

module.exports.command = BanCommand;