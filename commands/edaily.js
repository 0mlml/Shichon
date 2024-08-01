const { Command, categories } = require('../classes/command');
const econ = require('../util/economy');

class EconDailyCommand extends Command {
    static name = 'edaily';
    static description = 'Daily money (economy)';
    static aliases = ['daily'];
    static category = categories.econ;
    static cooldown = 86400;
    static reward = 20;

    async run() {
        let res = econ.addMoney(this.message.author.id, EconDailyCommand.reward)
        this.succeed('Redeemed your daily reward of ' + res);
        econ.saveEconomy();
    }
}

module.exports.command = EconDailyCommand;