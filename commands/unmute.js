const { settings, saveSettings } = require('../util/settings');
const utils = require('../util/utils');

const { Command, categories } = require('./../classes/command.js');

class UmuteCommand extends Command {
    static name = 'unmute';
    static reqArgs = true;
    static permissions = ['MOD'];
    static description = 'Umute a member';
    static usage = '<member>';
    static category = categories.mod;

    async run() {
        const victim = this.message.mentions.members.first() || await this.message.guild.members.fetch(args[0]);
        if (!victim) return this.fail(`Please provide a target as an ID or a mention`);
        const muteRole = victim.roles.cache.find(r => r.name.toLowerCase() === 'muted');
        if (!muteRole) return this.fail(`It doesn't seem that ${victim.user.tag} is muted!`);
        victim.roles.remove(muteRole).catch(e => {
            console.error(e);
            this.fail(`Error occured, check if I'm higher than the muted role`);
        }).then((e) => {
            let i = settings.timeouts.findIndex(a => a.action === `unmute ${victim.id} ${this.message.guild.id}`);
            let a = 0;
            while (i >= 0) { 
                settings.timeouts.splice(i, 1);
                i = settings.timeouts.findIndex(a => a.action === `unmute ${victim.id} ${this.message.guild.id}`);
                a++;
            }
            saveSettings();
            this.succeed(`Unmuted ${victim.user.tag}\nAlso cleared ${a} timeouts`);
        });
    }

}

module.exports.command = UmuteCommand;