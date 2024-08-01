const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { Command, categories } = require('../classes/command');
const econ = require('../util/economy');
const utils = require('../util/utils');
const emojis = require('../app').emojiMappings;

class CrashGame {
    /** @param {import('discord.js').Message} message */
    constructor(message) {
        this.parentChannel = message.channel;
        this.players = [];
        this.embed = new MessageEmbed({ title: 'Crash!', color: '#7771d1', author: { name: 'Gambling' }, description: 'Join using the `ecrash <amt>` command!\nStarting in 5 seconds!', footer: { text: 'I love gambling!' } });
        this.maxMultiplier = parseFloat(((1 / (Math.floor(Math.random() * 900 + 100) / 100)) * 10).toFixed(2));
        this.currentMultiplier = 1;
        this.parentMessage = this.parentChannel.send({
            embeds: [this.embed]
        });
        this.crashed = false;
        this.starttime = performance.now() + 5000;
        this.lastUpdate = performance.now();
        this.ticker = setInterval(() => {
            if (performance.now() < this.starttime) return;
            this.tick();
        }, 800);
    }

    async tick() {
        this.currentMultiplier += 0.137;
        if (this.currentMultiplier > this.maxMultiplier) {
            this.currentMultiplier = this.maxMultiplier;
            this.crashed = true;
        }
        if (performance.now() - this.lastUpdate >= 3000) {
            (await this.parentMessage).edit({
                embeds: [this.embed.setDescription('Current multiplier: x' + this.currentMultiplier).setTitle(emojis.econ_crash_ongoing + ' Crash')],
                components: [new MessageActionRow().addComponents(new MessageButton().setCustomId('leavecrash').setLabel('Cash out').setStyle('SUCCESS').setEmoji('🤑'))]
            });
            this.lastUpdate = performance.now();
        } else if (this.crashed) {
            (await this.parentMessage).edit({
                embeds: [this.embed.setDescription('Crashed!\nMultiplier: x' + this.currentMultiplier).setTitle(emojis.econ_crash_done + ' Crash'),
                new MessageEmbed({ title: 'Crash results', color: '#7771d1', description: this.players.sort((a, b) => b.outMultiplier - a.outMultiplier).map((p, i) => p.out ? `**${i + 1}.** <@${p.id}> : $${p.winnings} @ x${p.outMultiplier}` : `<@${p.id}> : -$${p.amount}`).join('\n') })],
                components: []
            });
            this.lastUpdate = performance.now();
            EconCrashCommand.games.delete(this.parentChannel.id);
            econ.saveEconomy();
            clearInterval(this.ticker);
        }
    }

    joinPlayer(id, amount) {
        if (performance.now() > this.starttime) return { failed: true, reason: 'Game started!' };
        if (this.players.find(p => p.id === id)) return { failed: true, reason: 'Player already joined!' };
        this.players.push({ id: id, amount: amount, out: false, winnings: 0 });
        return { failed: false, reason: 'Successfully joined' };
    }

    /** @param {import('discord.js').ButtonInteraction} interaction */
    cashOut(interaction) {
        let player = this.players.find(p => p.id === interaction.user.id);
        if (!player) return interaction.reply({ content: 'You never joined!', ephemeral: true });
        if (player.out) return interaction.reply({ content: 'You have already cashed out!', ephemeral: true });
        player.out = true;
        player.outMultiplier = this.currentMultiplier;
        player.winnings = (this.currentMultiplier * player.amount).toFixed(2);
        econ.addMoney(player.id, player.winnings);
        econ.incrementStat('gambling_won', player.winnings);
        let gotHighRoller = !econ.getUser(interaction.user.id).accolades.find(v => v === emojis.econ_highroller_badge) && player.winnings >= 2000;
        if (gotHighRoller) econ.getUser(interaction.user.id).accolades.push(emojis.econ_highroller_badge);
        interaction.reply({ content: `You won $${player.winnings} at ${player.outMultiplier}${gotHighRoller ? `\nYou also got the ${emojis.econ_highroller_badge} badge!` : ''}`, ephemeral: true });
    }
}

class EconCrashCommand extends Command {
    static name = 'ecrash';
    static description = 'Crash gambling (economy)';
    static aliases = ['crash'];
    static usage = '<amount>';
    static category = categories.econ;
    static cooldown = 5;
    static games = new Map();

    async run() {
        let amt = this.args[0] === 'all' ? econ.getUser(this.message.author.id).balance : parseFloat(this.args[0]);
        if (isNaN(amt) || amt <= 0) return this.fail('Invalid amount!');
        if (econ.getUser(this.message.author.id).balance < amt) return this.fail('You do not have enough money!');
        econ.addMoneyRaw(this.message.author.id, amt * -1);
        econ.incrementStat('gambling_lost', amt);
        if (!EconCrashCommand.games.get(this.message.channel.id)) {
            EconCrashCommand.games.set(this.message.channel.id, new CrashGame(this.message));
            let r = EconCrashCommand.games.get(this.message.channel.id).joinPlayer(this.message.author.id, amt);
            if (r.failed) this.fail(r.reason);
            else this.succeed();
        } else {
            let r = EconCrashCommand.games.get(this.message.channel.id).joinPlayer(this.message.author.id, amt);
            if (r.failed) this.fail(r.reason);
            else this.succeed();
        }
    }
}

module.exports.command = EconCrashCommand;
/** @param {import('discord.js').ButtonInteraction} interaction */
module.exports.handleCrashLeaveButton = (interaction) => {
    let game = EconCrashCommand.games.get(interaction.channel.id);
    if (!game) interaction.reply({ content: 'This button does not correspond to an active game!', ephemeral: true });
    else game.cashOut(interaction);
}
