const { Command, categories } = require('../classes/command');
const axios = require('axios').default;
const utils = require('../util/utils');
const emojis = require('../app').emojiMappings;
const economy = require('../util/economy');

const fetchPrices = async (currency = 'usd') => {
    const final = {};
    for (const i of EconCryptoCommand.cryptos) {
        axios.get(`https://api.coinbase.com/v2/prices/${i}-${currency}/spot`).then(r => {
            final[i] = {};
            final[i].base = r.data.data.base;
            final[i].amount = r.data.data.amount;
            final[i].currency = r.data.data.currency;
        }).catch(r => {
            console.log(`Crypto fetchPrices() issue: ${r}`);
            final[i] = {};
            final[i].base = 'ERROR';
            final[i].amount = 'ERROR';
            final[i].currency = 'ERROR';
        });
    }
    let waiter;
    await new Promise((resolve) => {
        waiter = setInterval(() => {
            if (Object.keys(final).length === EconCryptoCommand.cryptos.length) resolve();
        }, 100);
    });
    clearInterval(waiter);
    return final;
}

class EconCryptoCommand extends Command {
    static name = 'ecrypto';
    static aliases = ['crypto', 'invest'];
    static cooldown = 10;
    static descritpion = 'Use real-life crypto prices to invest fake money\nThanks Miasmus#1984 for the idea';
    static category = categories.econ;
    static cryptoOptions = [
        ['buy', 'invest'],
        ['sell', 'cashout'],
        ['howmuch', 'maximum', 'max'],
        ['prices', 'current']
    ];
    static usage = '\nSubcommands:\n' + this.cryptoOptions.map(v => v[0]).join('\n');

    static cryptos = ['btc', 'eth', 'doge', 'usdt'];
    async run() {
        const search = this.args.length ? this.args.shift().toLocaleLowerCase() : null;
        const found = EconCryptoCommand.cryptoOptions.find(a => a.map(v => v.toLocaleLowerCase()).includes(search))
        switch (found?.length ? found[0] : null) {
            case 'buy': {
                if (this.args.length < 2 || !EconCryptoCommand.cryptos.includes(this.args[1].toLocaleLowerCase())) return this.fail(`Usage: ...buy <amount> <${EconCryptoCommand.cryptos.join(' | ')}>`);
                const amt = parseFloat(this.args[0]);
                if (isNaN(amt) || amt <= 0) return this.fail(`Usage: ...buy <amount> <${EconCryptoCommand.cryptos.join(' | ')}>`);
                const price = (await axios.get(`https://api.coinbase.com/v2/prices/${this.args[1].toLocaleLowerCase()}-usd/spot`)).data.data.amount;
                if (isNaN(price) || price < 0) return this.fail('there was an error fetching the price of ' + this.args[1].toLocaleLowerCase());
                if ((price * amt).toFixed(2) > economy.getUser(this.message.author.id).balance) return this.fail(`You can't afford to buy ${(price * amt).toFixed(2)} worth!`);
                economy.addMoneyRaw(this.message.author.id, price * amt * -1);
                economy.addToHolding(this.message.author.id, this.args[1].toLocaleLowerCase(), amt);
                this.succeed(`Bought ${(price * amt).toFixed(2)} worth of ${this.args[1].toLocaleLowerCase()} @ ${price}`);
                break;
            }
            case 'sell': {
                if (this.args.length < 2 || !EconCryptoCommand.cryptos.includes(this.args[1].toLocaleLowerCase())) return this.fail(`Usage: ...sell <amount> <${EconCryptoCommand.cryptos.join(' | ')}>`);
                const amt = this.args[0] === 'all' ? 0 + economy.getUser(this.message.author.id).holdings[this.args[1].toLocaleLowerCase()] : parseFloat(this.args[0]);
                if (isNaN(amt) || amt <= 0) return this.fail(`Usage: ...sell <amount> <${EconCryptoCommand.cryptos.join(' | ')}>`);
                if (amt > economy.getUser(this.message.author.id).holdings[this.args[1].toLocaleLowerCase()]) return this.fail(`You don't have enought to sell ${amt}!`);
                const price = (await axios.get(`https://api.coinbase.com/v2/prices/${this.args[1].toLocaleLowerCase()}-usd/spot`)).data.data.amount;
                if (isNaN(price) || price < 0) return this.fail('there was an error fetching the price of ' + this.args[1].toLocaleLowerCase());
                economy.addMoneyRaw(this.message.author.id, price * amt);
                economy.addToHolding(this.message.author.id, this.args[1].toLocaleLowerCase(), amt * -1);
                this.succeed(`Sold ${(price * amt).toFixed(2)} worth of ${this.args[1].toLocaleLowerCase()} @ ${price}`);
                break;
            }
            case 'howmuch': {
                if (this.args.length < 1 || !EconCryptoCommand.cryptos.includes(this.args[0].toLocaleLowerCase())) return this.fail(`Usage: ...howmuch <${EconCryptoCommand.cryptos.join(' | ')}>`);
                const price = (await axios.get(`https://api.coinbase.com/v2/prices/${this.args[0].toLocaleLowerCase()}-usd/spot`)).data.data.amount;
                if (isNaN(price) || price < 0) return this.fail('there was an error fetching the price of ' + this.args[1].toLocaleLowerCase());
                this.succeed(`You can purchase ${(economy.getUser(this.message.author.id).balance / price).toFixed(8)} ${this.args[0].toLocaleLowerCase()} @ ${price}`);
                break;
            }
            case 'prices':
            default: {
                const resEmbed = utils.getEmbedTemplate(this.message.author);
                const priceData = await fetchPrices();
                resEmbed.setDescription(`Crypto prices`);
                for (let crypto of EconCryptoCommand.cryptos) {
                    resEmbed.addField((emojis['econ_crypto_' + crypto] || '') + ' ' + crypto.toLocaleUpperCase(), `1 ${priceData[crypto].base} = **${priceData[crypto].amount}** ${priceData[crypto].currency}`, true);
                }
                this.succeed(resEmbed);
                return;
            }
        }
        economy.saveEconomy();
    }
}

module.exports.command = EconCryptoCommand;