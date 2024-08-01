const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils.js');
const sU = require('../util/settings.js');
const asyncutils = require('../util/events.js');
const { MessageActionRow, MessageButton } = require('discord.js');

class GiveawayCommand extends Command {
    async run() {
        let subcommand;
        const subcommandBypass = this.message.content.toString().slice(sU.prefixFor(this.message.guild.id).length).split(/ +/).shift();
        if ([`gastart`, `gaend`].includes(subcommandBypass.toLocaleLowerCase())) subcommand = subcommandBypass;
        else subcommand = this.args.shift().toLocaleLowerCase();
        if (!subcommand) return this.fail(`No subcommand!`);
        if ([`gastart`, `start`].includes(subcommand)) {
            if (!this.args.length) return this.fail(`Start command usage:\n\`${sU.prefixFor(this.message.guild.id)}giveaway start <channel> <duration> <winnersCount> ...<prize>\``);

            const gaChannel = this.message.mentions.channels.first() || await this.message.guild.channels.fetch(this.args[0]).catch(r => { console.log(r) });
            if (!gaChannel) return this.fail(`Please provide a valid channel to host the giveaway as the first argument`);
            if (!gaChannel.permissionsFor(this.message.member.id).has('SEND_MESSAGES')) return this.fail(`You are trying to start a giveaway in a channel you do not have \`SEND_MESSAGES\` permissions in!`);

            if (!this.args[1]) return this.fail(`Please provide a duration!`);
            const date = utils.getTimePlusString(this.args[1]);
            const delay = utils.getMSUntil(date);
            if (delay > 2147483647 || delay < 1) return this.fail(`The duration is invalid!\nThis may be a result of many factors, e.g. invalid syntax, too long ->\`${args[1]}\``);

            if (!this.args[2]) return this.fail(`Please provide a number of winners!`);
            const winnersAmount = parseInt(this.args[2]);
            if (winnersAmount <= 0 || isNaN(winnersAmount)) return this.fail(`The amount of winners provided is invalid! ->\`${args[2]}\``);

            if (!this.args[3]) return this.fail(`Please provide a prize!`);
            const prize = this.args.splice(3).join(' ');

            const resMsg = this.succeed(`Setting it up now!`);

            const giveawayEmbed = utils.getEmbedTemplate(this.message.author);
            giveawayEmbed.setTitle(prize);
            giveawayEmbed.setDescription(`${winnersAmount} winner${winnersAmount > 1 ? 's' : ''}!\nHost: <@${this.message.author.id}>\nClick the button to enter`);
            giveawayEmbed.setFooter({ text: `Giveaway ends at ` });
            giveawayEmbed.setTimestamp(date);

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('entergiveaway')
                        .setLabel('Enter')
                        .setStyle('SUCCESS'),
                );


            const giveawayMessage = await gaChannel.send({ embeds: [giveawayEmbed], content: `🎉 ${this.message.author.tag} is hosting a giveaway! 🎉`, components: [row] });

            (await resMsg).edit({ embeds: [(await resMsg).embeds[0].setDescription(`Setting it up now!\nGiveaway message id: ${giveawayMessage.id}`)] });
            asyncutils.addTimeout({ action: `giveaway ${giveawayMessage.id}`, delay: delay, when: date, channel: gaChannel.id, prize: prize, winners: winnersAmount, host: this.message.author.id, refmsg: giveawayMessage.id, joined: [] })
        } else {
            this.message.reply(`\`${this.usage}\``);
        }
    }
    static name = `giveaway`;
    static aliases = [`ga`, `freenitroworking`, `gastart`, `gaend`];
    static description = `free nitro working`;
    static usage = `<start>\nUse a subcommand without arguments to get detailed info for that subcommand`;
    static reqArgs = true;
    static permissions = ['MANAGE_EVENTS', 'MOD'];
    static category = categories.util;
}

module.exports.command = GiveawayCommand;