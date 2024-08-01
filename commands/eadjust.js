const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils');
const { settings } = require('../util/settings');
const econ = require('../util/economy');

class EconAdjustCommand extends Command {
    static name = 'eadjust';
    static description = 'Adujst a bank balance (economy)';
    static aliases = ['adjust'];
    static usage = '<user> <amount>';
    static reqArgs = true;
    static category = categories.econ;
    static permissions = 'owner';

    async run() {
        let member = this.message.mentions.members.first() || await this.message.guild.members.fetch(this.args[0]).catch(r => { console.log(r) });
        if (!member) return this.fail('Please provide a valid member as a mention or ID');
        let amt = parseFloat(this.args[1]);
        if (isNaN(amt)) return this.fail('The number provided is invalid!');
        if (this.args.includes('--set') || this.args.includes('-s')) econ.getUser(member.id).balance = amt;
        else econ.addMoneyRaw(member.id, amt);
        econ.saveEconomy();
        this.succeed(`Adjusted ${member.user.tag}'s balance to ${econ.getUser(member.id).balance}`);
    }
}

module.exports.command = EconAdjustCommand;