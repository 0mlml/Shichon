const { settings } = require('../util/settings');
const utils = require('../util/utils');

const { Command, categories } = require('./../classes/command.js');

class SlowmodeCommand extends Command {
    static name = 'slowmode';
    static reqArgs = true;
    static permissions = ['MANAGE_CHANNELS', 'MOD'];
    static aliases = ['sm'];
    static description = 'Set the slowmode in a channel';
    static usage = '<amount>';
    static category = categories.mod;

    async run() {
        const amt = parseInt(this.args[0]);
        if (amt >= 0 && amt <= 21600) {
            this.message.channel.setRateLimitPerUser(amt, `requested by ${this.message.author.tag}`);
            utils.sendToModChannel(this.message.guild.id, this.message.author, `Set slow mode to ${amt}s in ${this.message.channel.toString()}`);
            this.succeed(`Set slow mode to ${amt}s in ${this.message.channel.toString()}`);
        } else this.fail(`0 <= input <= 21601`);
    }
}

module.exports.command = SlowmodeCommand;