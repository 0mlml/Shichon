const utils = require('../util/utils');

const { Command, categories } = require('../classes/command.js');

class LockCommand extends Command {
    static name = 'lock';
    static permissions = ['MANAGE_CHANNELS', 'ADMIN'];
    static aliases = ['lockdown', 'close'];
    static description = 'Lockdown a category';
    static category = categories.mod;

    async run() {
        const category = this.message.channel.parent;
        if (category) {
            category.children.forEach((c, k) => {
                c.permissionOverwrites.edit(this.message.guild.roles.everyone, { SEND_MESSAGES: false }, { reason: 'lockdown by ' + this.message.author.tag });
            });
            utils.sendToModChannel(this.message.guild.id, this.message.author, 'Requested a lockdown in ' + category.name);
        } else {
            this.message.channel.permissionOverwrites.edit(this.message.guild.roles.everyone, { SEND_MESSAGES: false }, { reason: 'lockdown by ' + this.message.author.tag });
            utils.sendToModChannel(this.message.guild.id, this.message.author, 'Requested a lockdown in ' + this.message.channel.name);
        }
        this.succeed();
    }
}

module.exports.command = LockCommand;