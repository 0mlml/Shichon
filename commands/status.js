const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils');
const { config } = require('../util/settings.js');

class StatusCommand extends Command {
    static name = 'status';
    static description = 'Get information about the bot';
    static aliases = ['status', 'about'];
    static category = categories.util;

    async run() {
        const resEmbed = utils.getEmbedTemplate(this.message.author);
        resEmbed.setDescription('');
        resEmbed.setThumbnail(this.message.client.user.displayAvatarURL());
        resEmbed.addField('Client user:', this.message.client.user.toString(), true);
        resEmbed.addField('Owner:', `<@${config.owner}>`, true);
        resEmbed.addField('User cache size:', '' + this.message.client.users.cache.size, true);
        resEmbed.addField('Guild cache size:', '' + this.message.client.guilds.cache.size, true);
        resEmbed.addField('Channel cache size:', '' + this.message.client.channels.cache.size, true);
        resEmbed.addField('Connection:', `latency ${Date.now() - this.message.createdTimestamp}ms\nping ${Math.round(this.client.ws.ping)}ms`, true);
        resEmbed.addField('Commands:', '' + this.client.commands.size, true);
        resEmbed.addField('Created:', this.message.client.user.createdAt.toDateString(), true);
        resEmbed.addField('Uptime:', utils.formatSeconds(process.uptime()), true);
        resEmbed.addField('Version', 'v' + config.version, true);
        this.succeed(resEmbed);
    }
}

module.exports.command = StatusCommand;