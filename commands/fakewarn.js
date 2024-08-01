const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils');

class FakeWarnCommand extends Command {
    static name = 'fakewarn';
    static description = 'Allow users to issue fake warnings to each other';
    static aliases = ['warn', 'ban_'];
    static category = categories.fun;
    static usage = `<target>`;
    static reqArgs = true;

    async run() {
        const victim = this.message.mentions.members.first() || await this.message.guild.members.fetch(this.args[0]).catch(r => { console.log(r) });
        if (!victim) return this.message.channel.send(`Please provide a target as an ID or a mention`);
        const resEmbed = utils.getEmbedTemplate(this.message.author);
        resEmbed.setDescription(`Issuing warning for ${victim.user.toString()}!\n${this.args[1] ? "For: " + this.args.splice(1).join(" ") : "*No reason provided*"}\nCase ID: ${Math.floor(Math.random() * 30 + 10)}\nExecutor: ${this.message.author.toString()}`);
        this.message.reply({ embeds: [resEmbed] });    
    }
}

module.exports.command = FakeWarnCommand;