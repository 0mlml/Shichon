const utils = require('../util/utils');

const { Command, categories } = require('../classes/command.js');

class UnlockCommand extends Command {
    static name = 'unlock';
    static permissions = ['MANAGE_CHANNELS', 'ADMIN'];
    static description = 'Open a category';
    static category = categories.mod;

    async run() {
        const category = this.message.channel.parent;
        if (category) {
            category.children.forEach((c, k) => {
                c.permissionOverwrites.edit(this.message.guild.roles.everyone, { SEND_MESSAGES: null }, { reason: 'unlockdown by ' + this.message.author.tag });
            });
            utils.sendToModChannel(this.message.guild.id, this.message.author, 'Requested a unlock in ' + category.name);
        } else {
            this.message.channel.permissionOverwrites.edit(this.message.guild.roles.everyone, { SEND_MESSAGES: null }, { reason: 'unlockdown by ' + this.message.author.tag });
            utils.sendToModChannel(this.message.guild.id, this.message.author, 'Requested a unlock in ' + this.message.channel.name);
        }
        this.succeed();
    }
}

module.exports.command = UnlockCommand;