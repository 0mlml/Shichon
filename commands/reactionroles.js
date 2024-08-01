const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils.js');
const sU = require('../util/settings.js');
const asyncutils = require('../util/events.js');

class ReacitonRoleCommand extends Command {
    static name = `reactionroles`;
    static aliases = [`rr`];
    static description = `Allow self-assignment of roles`;
    static usage = `<messageid> ...<emoji=role_id>`;
    static reqArgs = true;
    static permissions = ['MANAGE_ROLES', 'ADMIN'];
    static category = categories.mod;

    async run() {
        if (!sU.settings[this.message.guild.id]) sU.addNewGuildSettings(this.message.guild.id);
        if (this.args[0].toLocaleLowerCase() === 'clear') return sU.settings[this.message.guild.id].reactionroles = [];
        let parentMessage;
        for (let c of this.message.guild.channels.cache.entries()) {
            let t = await c[1].messages?.fetch(this.args[0]).catch(r => { console.log(r) });
            if (t) parentMessage = t;
        }
        if (!parentMessage) return this.fail(`Please provide a message id (or the one provided returned no result)`);
        let pairs = this.args.splice(1).map(p => p = { emoji: p.split('=')[0], role: p.split('=')[1], parent: parentMessage.id, channel: parentMessage.channel.id });
        if (!sU.settings[this.message.guild.id].reactionroles) sU.settings[this.message.guild.id].reactionroles = [];
        let filtered = pairs.filter(v => !sU.settings[this.message.guild.id].reactionroles.some(o => { for (let i of Object.keys(o)) if (v[i] !== o[i]) return false; return true; }));
        for (let p of filtered) if (p.role === 'null') sU.settings[this.message.guild.id].reactionroles.splice(sU.settings[this.message.guild.id].reactionroles.findIndex(v => { for (let i of ['emoji', 'parent', 'channel']) if (p[i] !== v[i]) return false; return true; }), 1);
        sU.settings[this.message.guild.id].reactionroles.push(...filtered.filter(v => v.role !== 'null'));
        sU.saveSettings();
        let c = `Found ${filtered.length} non-duplicate assignments (${pairs.length} ${pairs.length === 1 ? 'was detected' : 'were detected'})`;
        for (let p of filtered) await (parentMessage.react(p.emoji).catch(r => { c += `\nSomething went wrong adding the emoji ${p.emoji} to the message!` }));
        this.succeed(c + '\nDone!');
    }
}

module.exports.command = ReacitonRoleCommand;