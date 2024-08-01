const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils');
const { settings } = require('../util/settings');

class UserinfoCommand extends Command {
    async run() {
        let member = this.message.mentions.members.first() || (this.args[0] ? await this.message.guild.members.fetch(this.args[0]).catch(r => { console.log(r) }) : false);
        member = member || this.message.member;
        const resEmbed = utils.getEmbedTemplate(member.user || this.message.author);
        const u = this.client.users.resolve(await member.user.fetch(true));
        resEmbed.setTitle(member.displayName);
        resEmbed.setDescription('');
        resEmbed.setThumbnail(u.displayAvatarURL());
        resEmbed.setImage(u.bannerURL());
        resEmbed.setColor(member.displayColor);
        resEmbed.addField('Tag', u.tag, true);
        resEmbed.addField('Created', u.createdAt.toDateString(), true);
        resEmbed.addField('Joined', member.joinedAt.toDateString(), true);
        resEmbed.addField('ID', member.id, true);
        let isMod = false, isAdmin = false;
        for (let r of this.message.member.roles.cache) if (settings[this.message.guild.id].modroles.includes(r.id)) isMod = true;
        for (let r of this.message.member.roles.cache) if (settings[this.message.guild.id].adminroles.includes(r.id)) isAdmin = true;
        if (member.permissions.has('ADMINISTRATOR')) isAdmin = true;
        if (isAdmin) isMod = true;
        resEmbed.addField('Is mod?', '' + isMod, true);
        resEmbed.addField('Is admin?', '' + isAdmin, true);
        resEmbed.addField('Banner color', '' + u.hexAccentColor, true);
        resEmbed.addField('Roles', member.roles.cache.map(r => r.toString()).join(', '));
        resEmbed.setFooter({text: 'use the `euserinfo` for economy related info'});
        this.message.channel.send({ embeds: [resEmbed] });
        this.succeed();
    }

    static name = 'userinfo';
    static description = 'Get information about a user';
    static aliases = ['who', 'ui', 'user'];
    static usage = '[user]';
    static category = categories.util;
}

module.exports.command = UserinfoCommand;
