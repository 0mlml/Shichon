const { Command, categories } = require('../classes/command');
const econ = require('../util/economy');
const utils = require('../util/utils');
const emojis = require('../app').emojiMappings;

class EconSlotsCommand extends Command {
    static name = 'eslotmachine';
    static description = 'Slot machine (economy)';
    static aliases = ['esm', 'sm'];
    static usage = '<amount>';
    static category = categories.econ;
    static cooldown = 5;
    static payouts = [
        { emoji: ':lemon:', payoutMult: 8, probability: 0.1 },
        { emoji: ':strawberry:', payoutMult: 6, probability: 0.2 },
        { emoji: ':apple:', payoutMult: 4, probability: 0.3 },
        { emoji: ':cherries:', payoutMult: 2, probability: 0.4 }
    ];

    async run() {
        let resEmbed = utils.getEmbedTemplate(this.message.author).setDescription('').setTitle('Slot Machine :slot_machine:').setFooter({ text: 'I love gambling!11!!' });
        if (!this.args.length) {
            for (let p of EconSlotsCommand.payouts) resEmbed.addField(p.emoji.repeat(3), 'x' + p.payoutMult, true);
            this.message.channel.send({ embeds: [resEmbed.setFooter({ text: 'JS Math.random used to roll each wheel independently' })] });
            return this.succeed();
        }
        let udata = econ.getUser(this.message.author.id);
        let amt = this.args[0] === 'all' ? econ.getUser(this.message.author.id).balance : parseFloat(this.args[0]);
        if (isNaN(amt) || amt <= 0) return this.fail('Invalid amount!');
        if (udata.balance < amt) return this.fail('You do not have enough money!');
        let rolled = [];
        resEmbed.setDescription(emojis.econ_slots_rolling.repeat(3));
        let resMsg = await this.message.channel.send({ embeds: [resEmbed] });
        while (rolled.length < 3) {
            await utils.resolveAfterMS(2500);
            let rand = Math.random(), res;
            for (let i of EconSlotsCommand.payouts) {
                if (rand < i.probability) {
                    res = i;
                    break;
                }
                rand -= i.probability;
            }
            rolled.push(res);
            resEmbed.setDescription(rolled.map(v => v.emoji).join('') + emojis.econ_slots_rolling.repeat(3 - rolled.length));
            resMsg.edit({ embeds: [resEmbed] });
        }
        econ.addMoneyRaw(this.message.author.id, amt * -1);
        if (rolled[0] === rolled[1] && rolled[0] === rolled[2]) {
            let winnings = rolled[0].payoutMult * amt;
            let res = econ.addMoney(this.message.author.id, winnings);
            let gotHighRoller = !udata.accolades.find(v => v === emojis.econ_highroller_badge) && winnings >= 2000;
            if (gotHighRoller) udata.accolades.push(emojis.econ_highroller_badge);
            resEmbed.setDescription(resEmbed.description + `\nYou won ${res}! (Payout: ${rolled[0].payoutMult}x${amt})${gotHighRoller ? `\nYou also got the ${emojis.econ_highroller_badge} badge!` : ''}`);
            econ.incrementStat('gambling_won', winnings);
        } else {
            resEmbed.setDescription(resEmbed.description + `\nYou lost ${amt}!`);
            econ.incrementStat('gambling_lost', amt);
        }
        resMsg.edit({ embeds: [resEmbed] });
        econ.saveEconomy();
        this.succeed();
    }
}

module.exports.command = EconSlotsCommand;