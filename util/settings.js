const fs = require('fs');
module.exports.settings = JSON.parse(fs.readFileSync('./settings.json'));

const { version } = require('../package.json');
module.exports.config = JSON.parse(fs.readFileSync('./config.json'));
module.exports.config.version = version;

const utils = require('./utils.js');

module.exports.saveSettings = () => {
    utils.writeFileRename('./settings.json', JSON.stringify(this.settings), () => {
        console.log('Saved Settings!');
    });
}


module.exports.addNewGuildSettings = (id) => {
    if (this.settings[id]) return;
    this.settings[id] = {
        adminroles: [],
        modroles: [],
        prefix: this.config.prefix,
        logconfig: {
            join: null,
            leave: null,
            moderation: null,
            messages: null
        },
        reactionroles: [],
        blacklist: [],
        starboard: {
            channel: null,
            limit: null
        },
    }
    this.saveSettings();
}

module.exports.prefixFor = (id) => {
    if (!this.settings[id]) this.addNewGuildSettings(id);
    return this.settings[id].prefix || this.config.prefix;
}

