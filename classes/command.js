const { MessageEmbed } = require('discord.js');
const utils = require('../util/utils');

class Command {
    constructor(message, args, specialArgs) {
        /** @type {import('discord.js').Client} */
        this.client = message.client;
        /** @type {import('discord.js').Message} */
        this.message = message;
        /** @type {string[]} */
        this.args = args;
        this.specialArgs = specialArgs;
        this.status = { done: false, failed: false, reason: null };
    }

    async run() {
        this.message.reply('the default');
    }

    fail(text) {
        if (this.status.done) return console.log(`Attempted to fail an already finished command! Command: ${typeof this}`);
        this.message.react('❌');
        if (!text) text = 'Command failed!';
        this.status = { failed: true, reason: text };
        if (text instanceof MessageEmbed) return this.message.reply(text);
        let resEmbed = utils.getEmbedTemplate(this.message.author);
        resEmbed.setColor('RED');
        resEmbed.setDescription('❌ ' + text);
        return this.message.reply({ embeds: [resEmbed] });

    }

    succeed(text) {
        if (this.status.done) return console.log(`Attempted to succeed an already finished command! Command: ${typeof this}`);
        this.message.react('✅');
        this.status.done = true;
        if (text) {
            if (text instanceof MessageEmbed) return this.message.reply({ embeds: [text] });
            let resEmbed = utils.getEmbedTemplate(this.message.author);
            resEmbed.setColor('GREEN');
            resEmbed.setDescription('✅ ' + text);
            return this.message.reply({ embeds: [resEmbed] });
        }
    }

    static name = 'unset';
    static usage = 'unset';
    static permissions = [];
    static description = 'No description found';
    static aliases = [];
    static reqArgs = false;
    static arguments = [];
    static flags = [];
    static cooldown = 2;
}

module.exports.Command = Command;
module.exports.categories = {
    fun: 'Fun',
    econ: 'Economy',
    mod: 'Moderation',
    util: 'Util',
    hidden: 'Hidden'
}