const utils = require('./utils');
const { client } = require('../app');
const sU = require('./settings');

module.exports.handleEventTimeout = async (input) => {
    console.log('Handling ' + input);
    let a = sU.settings.timeouts.splice(sU.settings.timeouts.findIndex(a => a.action === input), 1)[0];
    sU.saveSettings();
    let parts = input.split(' ');
    if (parts[0] === 'unmute') {
        const targetGuild = await client.guilds.fetch(parts[2]).catch(r => { console.log(r) });
        if (!targetGuild) return console.log(`Was trying to unmute in ${parts[2]} but I can't find it`);
        const targetMem = await (targetGuild).members.fetch(parts[1]).catch(r => { console.log(r) });
        if (!targetMem) return console.log(`Was trying to unmute ${parts[1]} but I can't them`);
        const muteRole = targetMem.roles.cache.find(r => r.name.toLowerCase() === 'muted');
        if (!muteRole) return utils.sendToModChannel(parts[2], client.user, `Was scheduled to unmute ${targetMem.user.tag}, but they did not have the muted role`);
        targetMem.roles.remove(muteRole).catch(e => {
            console.error(e);
            return utils.sendToModChannel(parts[2], client.user, `Failed to unmute ${targetMem.user.tag} but their time is up`);
        }).then((e) => { utils.sendToModChannel(parts[2], client.user, `Unmuted ${targetMem.user.tag} because their time was up`) });
    } else if (parts[0] === 'sendmsg') {
        const payload = parts.splice(2).join(' ');
        const channel = await client.channels.fetch(parts[1]).catch(r = {});
        if (!channel) return console.log('failed sending of message:' + payload + ', no channel found');
        channel.send(payload);
    } else if (parts[0] === 'giveaway') {
        const giveawayChannel = await client.channels.fetch(a.channel).catch(r => {
            console.log(`Was handling a giveaway but the channel does not exist!`);
        });

        const giveawayMessage = await giveawayChannel.messages.fetch(a.refmsg).catch(r => {
            console.log(`Was handling a giveaway but the message does not exist!`);
        });

        const emb = giveawayMessage.embeds[0];
        const row = giveawayMessage.components[0];
        row.components[0].setDisabled(true);

        let winTxt;
        if (a.joined.length < a.winners) {
            winTxt = `\nGiveaway cancelled! Not enough people joined!`;
            giveawayChannel.send(winTxt);
        } else {
            const winners = [];
            while (winners.length < a.winners) { let u = utils.randomElementFromArray(a.joined); if (!winners.includes(u)) winners.push(u); }
            winTxt = '\nWinners: ' + winners.map(i => `<@${i}>`).join(', ');
            giveawayChannel.send(`Congratulations, ${winners.map(i => `<@${i}>`)}!\nYou have won ${a.prize} from <@${a.host}>`);
        }

        giveawayMessage.edit({ content: `Giveaway over!`, embeds: [emb.setDescription(emb.description.split('\n').splice(0, 2).join('\n') + winTxt)], components: [row] });
    }
}

module.exports.initTimeouts = () => {
    if (!sU.settings.timeouts) sU.settings.timeouts = [];
    let expired = 0;
    for (v of sU.settings.timeouts) {
        let delay = utils.getMSUntil(v.when);
        if (delay < 0) {
            expired++;
            let waiter;
            new Promise((res, rej) => {
                waiter = setInterval(() => {
                    if (client.isReady()) res();
                }, 1000);
            }).then(() => {
                clearInterval(waiter);
                this.handleEventTimeout(v.action);
            });
        } else {
            setTimeout(() => {
                this.handleEventTimeout(v.action);
            }, delay);
            console.log(`Registered ${v.action} to occur at ${new Date(v.when)}`);
        }
    }
    console.log(`Loaded ${sU.settings.timeouts.length} timeouts! Expired: ${expired}`);
}

module.exports.addTimeout = (data) => {
    sU.settings.timeouts.push(data);
    setTimeout(() => { this.handleEventTimeout(data.action) }, data.delay);
    sU.saveSettings();
}

/** @param {import('discord.js').ButtonInteraction} interaction */
module.exports.addGiveawayUser = (interaction) => {
    const ga = sU.settings.timeouts.find(t => t.action === `giveaway ${interaction.message.id}`);
    if (!ga) interaction.reply({ content: 'Oops... It seems something has gone wrong on my end and this button is not associated with a giveaway', ephemeral: true });
    else if (ga.joined.includes(interaction.user.id)) return interaction.reply({ content: 'You have already joined', ephemeral: true });
    else {
        ga.joined.push(interaction.user.id);
        interaction.reply({ content: 'You have successfully joined', ephemeral: true });
    }
}