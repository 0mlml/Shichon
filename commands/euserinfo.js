const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils');
const econ = require('../util/economy');

class EconUserinfoCommand extends Command {
    static name = 'euserinfo';
    static description = 'Get information about a user (economy)';
    static aliases = ['ewho', 'eui', 'profile', 'bal'];
    static usage = '[user]';
    static category = categories.econ;

    async run() {
        let member = this.message.mentions.members.first() || (this.args[0] ? await this.message.guild.members.fetch(this.args[0]).catch(r => { console.log(r) }) : false);
        member = member || this.message.member;
        let udata = econ.getUser(member.id);
        const resEmbed = utils.getEmbedTemplate(member.user);
        resEmbed.setTitle(udata.displayName);
        resEmbed.setColor(udata.displayColor);
        resEmbed.setDescription(`${udata.accolades.length ? '**Badges:** ' : ''}${udata.accolades.join(' | ')}\n**Balance:** ${udata.balance}\n**Multiplier:** ${udata.multiplier}\n**Other holdings:**\n${Object.keys(udata.holdings).length ? Object.keys(udata.holdings).map(v => `${udata.holdings[v]} ${v}`).join('\n') : 'none'}`);
        resEmbed.setThumbnail(member.user.displayAvatarURL());
        resEmbed.setFooter({ text: 'use the `userinfo` for non-economy related info' });
        this.message.channel.send({ embeds: [resEmbed] });
        this.succeed();
    }
}

module.exports.command = EconUserinfoCommand;