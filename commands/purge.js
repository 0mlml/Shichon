const { settings } = require('../util/settings');
const utils = require('../util/utils');

const { Command, categories } = require('./../classes/command.js');

class PurgeCommand extends Command {
    static name = 'purge';
    static reqArgs = true;
    static permissions = ['MANAGE_MESSAGES', 'MOD'];
    static description = 'Clear a bunch of messages';
    static usage = '<amount>';
    static category = categories.mod;

    async run() {

        const amt = parseInt(this.args[0]);
        try {
            if (amt > 0 && amt <= 1000) {
                this.message.delete();
                let newamt = amt;
                while (newamt > 0) {
                    await this.message.channel.bulkDelete(utils.clamp(newamt, 0, 100));
                    newamt -= utils.clamp(newamt, 0, 100);
                }
                this.message.channel.send(`Deleted ${amt} messages, as requested by ${this.message.author.tag}`).then(m => {
                    setTimeout(() => { m.delete() }, 5000);
                }).catch(console.log);
                utils.sendToModChannel(this.message.guild.id, this.message.author, `Bulk deleted ${amt} messages in ${this.message.channel.toString()}`);
            } else this.fail(`I don't think you gave me a positive number less than or equal to 1000`);
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports.command = PurgeCommand;