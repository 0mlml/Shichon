const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils');
const { settings } = require('../util/settings');
const econ = require('../util/economy');

class EconMultiplierCommand extends Command {
    static name = 'emultilplier';
    static description = 'Adujst a multiplier (economy)';
    static aliases = ['multiplier', 'mult', 'emult'];
    static usage = '<user> <mult>';
    static reqArgs = true;
    static category = categories.econ;
    static permissions = 'owner';

    async run() {
        let member = this.message.mentions.members.first() || await this.message.guild.members.fetch(this.args[0]).catch(r => { console.log(r) });
        if (!member) return this.fail('Please provide a valid member as a mention or ID');
        let amt = parseFloat(this.args[1]);
        if (isNaN(amt)) return this.fail('The number provided is invalid!');
        econ.getUser(member.id).multiplier = amt;
        econ.saveEconomy();
        this.succeed(`Adjusted ${member.user.tag}'s multiplier to ${econ.getUser(member.id).multiplier}`);
    }
}

module.exports.command = EconMultiplierCommand;