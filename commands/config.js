const { client } = require('../app');
const { Command, categories } = require('../classes/command.js');
const sU = require('../util/settings');
const utils = require('../util/utils');

class ConfigCommand extends Command {
    static name = 'config';
    static description = 'Configure different aspects of the bot';
    static configOptions = [
        ['addAdminRole', 'addAR'],
        ['removeAdminRole', 'rmAR'],
        ['listAdminRoles', 'lsAR'],
        ['addModRole', 'addMR'],
        ['removeModRole', 'rmMR'],
        ['listModRoles', 'lsMR'],
        ['starboard', 'sb'],
        ['logging', 'logs', 'log'],
        ['prefix']
    ];
    static usage = '\nSubcommands:\n' + this.configOptions.map(v => v[0]).join('\n');
    static aliases = ['figgy', 'cfg'];
    static reqArgs = true;
    static permissions = ['GUILD_OWNER', 'ADMIN'];
    static category = categories.hidden;

    async run() {
        if (!sU.settings[this.message.guild.id]) sU.addNewGuildSettings(this.message.guild.id);
        const search = this.args.shift().toLocaleLowerCase();
        const found = ConfigCommand.configOptions.find(a => a.map(v => v.toLocaleLowerCase()).includes(search));
        switch (found?.length ? found[0] : null) {
            case 'addAdminRole': {
                if (!utils.canUserExecute(this.message, { permissions: ['GUILD_OWNER'] })) return this.fail('You need \`GUILD_OWNER\` to use this subcommand!');
                const roleID = this.message.mentions.roles.first()?.id || (await this.message.guild.roles.fetch(this.args[0]).catch(r => { console.log(r) })).id;
                if (!roleID) return this.fail('Did you provide a valid role?');
                if (sU.settings[this.message.guild.id].adminroles.includes(roleID)) return this.fail(`That is already an admin role!`);
                sU.settings[this.message.guild.id].adminroles.push(roleID);
                this.succeed();
                sU.saveSettings();
                break;
            }
            case 'removeAdminRole': {
                if (!utils.canUserExecute(this.message, { permissions: ['GUILD_OWNER'] })) return this.fail('You need \`GUILD_OWNER\` to use this subcommand!');
                const roleID = this.message.mentions.roles.first()?.id || (await this.message.guild.roles.fetch(this.args[0]).catch(r => { console.log(r) })).id;
                if (!roleID) return this.fail('Did you provide a valid role?');
                if (!sU.settings[this.message.guild.id].adminroles.includes(roleID)) return this.fail(`That was not an admin role!`);
                sU.settings[this.message.guild.id].adminroles.splice(sU.settings[this.message.guild.id].adminroles.findIndex(i => i === roleID), 1);
                this.succeed();
                sU.saveSettings();
                break;
            }
            case 'listAdminRoles': {
                let text = sU.settings[this.message.guild.id].adminroles.length > 0 ? sU.settings[this.message.guild.id].adminroles.map(r => `<@&${r}>`).join(', ') : 'Length is 0!';
                this.message.reply({ embeds: [utils.getEmbedTemplate(this.message.author).setDescription(text)] });
                this.succeed();
                break;
            }
            case 'addModRole': {
                if (!utils.canUserExecute(this.message, { permissions: ['GUILD_OWNER'] })) return this.fail('You need \`GUILD_OWNER\` to use this subcommand!');
                const roleID = this.message.mentions.roles.first()?.id || (await this.message.guild.roles.fetch(this.args[0]).catch(r => { console.log(r) })).id;
                if (!roleID) return this.fail('Did you provide a valid role?');
                if (sU.settings[this.message.guild.id].modroles.includes(roleID)) return this.fail(`That is already a mod role!`);
                sU.settings[this.message.guild.id].modroles.push(roleID);
                this.succeed();
                sU.saveSettings();
                break;
            }
            case 'removeModRole': {
                if (!utils.canUserExecute(this.message, { permissions: ['GUILD_OWNER'] })) return this.fail('You need \`GUILD_OWNER\` to use this subcommand!');
                const roleID = this.message.mentions.roles.first()?.id || (await this.message.guild.roles.fetch(this.args[0]).catch(r => { console.log(r) })).id;
                if (!roleID) return this.fail('Did you provide a valid role?');
                if (!sU.settings[this.message.guild.id].modroles.includes(roleID)) return this.fail(`That was not a mod role!`);
                sU.settings[this.message.guild.id].modroles.splice(sU.settings[this.message.guild.id].modroles.findIndex(i => i === roleID), 1);
                this.succeed();
                sU.saveSettings();
                break;
            }
            case 'listModRoles': { 
                let text = sU.settings[this.message.guild.id].modroles.length > 0 ? sU.settings[this.message.guild.id].modroles.map(r => `<@&${r}>`).join(', ') : 'Length is 0!';
                this.message.reply({ embeds: [utils.getEmbedTemplate(this.message.author).setDescription(text)] });
                this.succeed();
                break;
            }
            case 'starboard': {
                if (!this.args[0] || !this.args[1]) return this.fail('Starboard command usage: <channel> <limit>');
                let channelID = this.message.mentions.channels.first().id || (await this.message.guild.channels.fetch(this.args[0])).id;
                if (!channelID) return this.fail('Please provide a valid channel!');
                if (!sU.settings[this.message.guild.id].starboard) sU.settings[this.message.guild.id].starboard = {channel:null,limit:null};
                sU.settings[this.message.guild.id].starboard.channel = channelID;
                let lim = parseInt(this.args[1]);
                if (!(lim > 0)) return this.fail('Please provide a positive integer!');
                sU.settings[this.message.guild.id].starboard.limit = lim;
                this.succeed(`Set starboard to <#${channelID}> with a limit of ${lim} ⭐`);
                break;
            }
            case 'logging': {
                if (!this.args.length) return this.fail('Configure as follows (you do not need to set all fields): \njoin=<channel>\nleave=<channel>\nmoderation=<channel>\nmessages=<channel>\n\nYou can unset fields by setting them to `null`')
                let pairs = this.args.map(p => p = { action: p.split('=')[0].toLocaleLowerCase(), channel: p.split('=')[1].replace(/\D/g, '') });
                for (let p of pairs.filter(v => ['join', 'leave', 'moderation', 'messages'].includes(v.action)).filter(v => v.channel === 'null' || client.channels.cache.get(v.channel)))
                    for (let a of ['join', 'leave', 'moderation', 'messages']) if (p.action === a) sU.settings[this.message.guild.id].logconfig[a] = p.channel;
                this.succeed('Mappings:\n' + pairs.filter(v => ['join', 'leave', 'moderation', 'messages'].includes(v.action)).filter(v => v.channel === 'null' || client.channels.cache.get(v.channel)).map(p => p.action + '=<#' + p.channel + '>').join('\n'));
                break;
            }
            case 'prefix': {
                if (!this.args.length) return this.fail('No prefix provided!');
                sU.settings[this.message.guild.id].prefix = this.args[0];
                break;
            }
            default: {
                this.fail(`Invalid usage! Use:${ConfigCommand.usage}`);
                return;
            }
        }
        sU.saveSettings();
    }
};

module.exports.command = ConfigCommand;