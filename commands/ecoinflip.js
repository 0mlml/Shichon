const { Command, categories } = require('../classes/command');
const econ = require('../util/economy');
const utils = require('../util/utils');

class EconFlipCommand extends Command {
    static name = 'ecoinflip';
    static description = 'Coin flip (economy)';
    static aliases = ['coinflip', 'cf'];
    static usage = '<heads | tails> <amount>';
    static category = categories.econ;
    static cooldown = 5;

    async run() {
        let resEmbed = utils.getEmbedTemplate(this.message.author).setDescription('').setTitle('Coinflip').setFooter({ text: 'I love gambling!11!!' });
        if (!this.args.length) return this.fail('Usage: ' + EconFlipCommand.usage);
        let face = this.args[0].toLocaleLowerCase();
        if (!['heads', 'tails'].includes(face)) return this.fail('Usage: ' + EconFlipCommand.usage);
        let udata = econ.getUser(this.message.author.id);
        let amt = this.args[0] === 'all' ? econ.getUser(this.message.author.id).balance : parseFloat(this.args[1]);
        if (isNaN(amt) || amt <= 0) return this.fail('Invalid amount!');
        if (udata.balance < amt) return this.fail('You do not have enough money!');
        econ.addMoneyRaw(this.message.author.id, amt * -1);
        if (Math.random() < 0.5) {
            let winnings = 2 * amt;
            let res = econ.addMoney(this.message.author.id, winnings);
            let gotHighRoller = !udata.accolades.find(v => v === '<a:high_roller:948584238368825364>') && winnings >= 2000;
            if (gotHighRoller) udata.accolades.push('<a:high_roller:948584238368825364>');
            resEmbed.setTitle(resEmbed.title + ': ' + face);
            resEmbed.setDescription(resEmbed.description + `\nYou won ${res}! (Payout: 2x${amt})${gotHighRoller ? '\nYou also got the <a:high_roller:948584238368825364> badge!' : ''}`);
            econ.incrementStat('gambling_won', winnings);
        } else {
            resEmbed.setTitle(resEmbed.title + ': ' + (face === 'heads' ? 'tails' : 'heads'));
            resEmbed.setDescription(resEmbed.description + `\nYou lost ${amt}!`);
            econ.incrementStat('gambling_lost', amt);
        }
        this.message.channel.send({ embeds: [resEmbed] });
        econ.saveEconomy();
        this.succeed();
    }
}

module.exports.command = EconFlipCommand;