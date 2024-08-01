const { settings } = require('../util/settings');
const utils = require('../util/utils');
const {client} = require('../app');

const { Command, categories } = require('../classes/command.js');

class MuteCommand extends Command {
    static name = 'mute';
    static reqArgs = true;
    static permissions = ['MODERATE_MEMBERS', 'MOD'];
    static description = 'Mute a member';
    static usage = '<member> <time>';
    static category = categories.mod;

    async run() {
        const victim = this.message.mentions.members.first() || await this.message.guild.members.fetch(this.args[0]).catch(r => { console.log(r) });
        if (!victim) return this.fail(`Please provide a target as an ID or a mention`);
        let muteRole = this.message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
        if (!muteRole) {
            const makeMsg = this.message.channel.send(`Could not find muted role (role named muted)`).then(m => { return m });
            try {
                muteRole = await this.message.guild.roles.create({ name: 'Muted', reason: 'mute command issued without a muted role' });
                await this.message.guild.channels.cache.forEach(async (channel, id) => {
                    await channel.permissionOverwrites.create(muteRole, {
                        SEND_MESSAGES: false,
                        MANAGE_MESSAGES: false,
                        ADD_REACTIONS: false
                    });
                });
                (await makeMsg).edit('Made muted role')
            } catch (e) {
                console.error(e);
                return this.fail(`Error creating the muted role!`);
            }
        }
        victim.roles.add(muteRole).catch(e => {
            console.error(e);
            return this.fail(`Error occured, check if I'm higher than the muted role`);
        }).then((mem) => {
            let dur = '';
            if (this.args[1]) {
                if (!settings.timeouts) settings.timeouts = [];
                let date = utils.getTimePlusString(this.args[1]);
                let delay = utils.getMSUntil(date);
                if (delay > 2147483647 || delay < 0) {
                    dur = '\nTime was greater than ~24 days or was too small (or was unparseable)\nMuted indefinitely';
                } else {
                    let i = settings.timeouts.findIndex(a => a.action === `unmute ${victim.id} ${this.message.guild.id}`);
                    let a = 0;
                    while (i >= 0) {
                        settings.timeouts.splice(i, 1);
                        i = settings.timeouts.findIndex(a => a.action === `unmute ${victim.id} ${this.message.guild.id}`);
                        a++;
                    }
                    require('../util/events').addTimeout({ action: `unmute ${victim.id} ${this.message.guild.id}`, when: date, delay: delay  })
                    dur = `\nunmute date: ${utils.formatDateTime(new Date(date))}`;
                }
            }
            if (this.status.failed) return;
            this.succeed(`Muted ${victim.user.tag}${dur}`);
            utils.sendToModChannel(this.message.guild.id, this.message.author, `Muted ${victim.user.tag}${dur}`);
        });
    }

    /** @param {import('discord.js').GuildMember} member */
    static programMute = async (member, duration) => {
        let muteRole = member.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
        if (!muteRole) {
            try {
                muteRole = await this.message.guild.roles.create({ name: 'Muted', reason: 'mute command issued without a muted role' });
                await this.message.guild.channels.cache.forEach(async (channel, id) => {
                    await channel.permissionOverwrites.create(muteRole, {
                        SEND_MESSAGES: false,
                        MANAGE_MESSAGES: false,
                        ADD_REACTIONS: false
                    });
                });
            } catch (e) {
                console.error(e);
                return false;
            }
        }
        let dur = '';
        member.roles.add(muteRole).catch(e => {
            console.error(e);
            return false;
        }).then((mem) => {
            if (duration.length) {
                if (!settings.timeouts) settings.timeouts = [];
                let date = utils.getTimePlusString(duration);
                let delay = utils.getMSUntil(date);
                if (delay > 2147483647 || delay < 0) {
                    dur = '\nTime was greater than ~24 days or was too small (or was unparseable)\nMuted indefinitely';
                } else {
                    let i = settings.timeouts.findIndex(a => a.action === `unmute ${mem.id} ${mem.guild.id}`);
                    let a = 0;
                    while (i >= 0) {
                        settings.timeouts.splice(i, 1);
                        i = settings.timeouts.findIndex(a => a.action === `unmute ${mem.id} ${mem.guild.id}`);
                        a++;
                    }
                    require('../util/events').addTimeout({ action: `unmute ${mem.id} ${mem.guild.id}`, when: date, delay: delay })
                    dur = `\nunmute date: ${utils.formatDateTime(new Date(date))}`;
                }
            }
            utils.sendToModChannel(mem.guild.id, client.user, `Muted ${mem.user.tag}${dur}`);
        });
        return dur;
    }
}

module.exports.command = MuteCommand;