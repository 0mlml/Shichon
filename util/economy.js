const fs = require('fs');
module.exports.stored = JSON.parse(fs.readFileSync('./economy.json'));
if (!this.stored.u) this.stored.u = {};
if (!this.stored.s) this.stored.s = {};

const utils = require('./utils.js');

module.exports.saveEconomy = () => {
    utils.writeFileRename('./economy.json', JSON.stringify(this.stored), () => {
        console.log('Saved Economy!');
    });
}

module.exports.incrementStat = (key, amount) => {
    if (isNaN(amount)) return;
    if (!this.stored.s[key]) this.stored.s[key] = 0;
    this.stored.s[key] = this.stored.s[key] + amount;
}

module.exports.getStat = (key) => {
    return this.stored.s[key];
}

module.exports.getUser = id => {
    if (this.stored.u[id]) return this.stored.u[id];
    this.stored.u[id] = {
        displayName: 'Investor',
        displayColor: '#7771d1',
        balance: 10,
        holdings: {},
        accolades: [],
        multiplier: 1
    }
    return this.stored.u[id];
}

module.exports.addMoney = (id, money) => {
    if (isNaN(money)) return false;
    let user = this.getUser(id);
    user.balance += (money * user.multiplier);
    user.balance = parseFloat(user.balance.toFixed(2));
    return (money * user.multiplier);
}

module.exports.addMoneyRaw = (id, money) => {
    if (isNaN(money)) return false;
    let user = this.getUser(id);
    user.balance += money;
    user.balance = parseFloat(user.balance.toFixed(2));
    return money;
}

module.exports.addToHolding = (id, key, amount) => {
    if (isNaN(amount)) return false;
    let user = this.getUser(id);
    if (!user.holdings[key]) user.holdings[key] = 0;
    user.holdings[key] += amount;
    user.holdings[key] = parseFloat(user.holdings[key].toFixed(8));
    return amount;
}
