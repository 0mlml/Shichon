const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils');

class ServerinfoCommand extends Command {
    static name = 'serverinfo';
    static description = 'Get information about the server';
    static aliases = ['si', 'guild', 'server'];
    static category = categories.util;

    async run() {
        const g = this.message.guild;
        let go = g.fetchOwner();
        let invites = g.invites.fetch();
        const resEmbed = utils.getEmbedTemplate(this.message.author);
        resEmbed.setTitle(g.name);
        resEmbed.setDescription(g.description || 'No description');
        resEmbed.setThumbnail(g.iconURL());
        resEmbed.setImage(g.bannerURL());
        resEmbed.addField('Emojis', g.emojis.cache.filter((v, k) => v.animated).size + ' animated\n' + g.emojis.cache.filter((v, k) => !v.animated).size + ' non-animated', true);
        resEmbed.addField('Created', g.createdAt.toDateString(), true);
        resEmbed.addField('Members', '' + g.memberCount, true);
        resEmbed.addField('Roles', '' + g.roles.cache.size, true);
        resEmbed.addField('Channels', '' + g.channels.cache.size, true);
        resEmbed.addField('Owner', (await go).user.tag, true);
        resEmbed.addField('Verification level', g.verificationLevel);
        resEmbed.addField('Invites', '' + (await invites).size);
        this.message.channel.send({ embeds: [resEmbed] });
        this.succeed();
    }
}

module.exports.command = ServerinfoCommand;