const utils = require('../util/utils');

const { Command, categories } = require('./../classes/command.js');

class KickCommand extends Command {
    async run() {
        const victim = this.message.mentions.members.first() || await this.message.guild.members.fetch(this.args[0]).catch(r => { console.log(r) });
        if (!victim) return this.message.channel.send(`Please provide a target as an ID or a mention`);
        if (!victim.kickable) return this.message.reply('not kickable');
        victim.kick({ reason: `requested by ${this.message.author.tag}` });
        utils.sendToModChannel(this.message.guild.id, this.message.author, `Kicked ${victim.toString()} (${victim.id})`);
        this.succeed()
        this.message.reply(`Kicked ${victim.user.tag}!`)
    }

    static name = 'kick';
    static reqArgs = true;
    static permissions = ['KICK_MEMBERS', 'MOD'];
    static description = 'Kick a member';
    static usage = '<member>';
    static category = categories.mod;
}

module.exports.command = KickCommand;