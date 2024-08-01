const { Command, categories } = require('../classes/command');
const econ = require('../util/economy');

class EconBankruptcyCommand extends Command {
    static name = 'ebankruptcy';
    static description = 'File for bankruptcy (economy)';
    static aliases = ['bankruptcy'];
    static category = categories.econ;
    static cooldown = 120;
    static reward = 5;

    async run() {
        if (econ.getUser(this.message.author.id).balance > 0) return this.fail('You aren\'t broke!');
        let res = econ.addMoneyRaw(this.message.author.id, EconBankruptcyCommand.reward);
        this.succeed('Received your bailout of ' + res);
        econ.saveEconomy();
    }
}

module.exports.command = EconBankruptcyCommand;