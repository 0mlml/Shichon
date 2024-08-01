const sU = require('./settings.js');
const utils = require('./utils.js');
const { client } = require('../app');
const Discord = require('discord.js');
const asyncutils = require('./events');
const { categories } = require('../classes/command');

module.exports.ready = async () => {
    await client.guilds.fetch();
    console.log(`Loaded and logged into Discord as ${client.user.tag} (${client.user.id}). I have ${client.guilds.cache.size} guilds.\nLoaded in ${process.uptime()} seconds!`);
}

/** @param {Discord.Message} message */
module.exports.messageCreate = message => {
    utils.logMessage(message);
    if (message.mentions.users.has(client.user)) message.react('👀');
    if (!message.content.startsWith(sU.prefixFor(message.guild.id))) return;
    const args = message.content.substring(sU.prefixFor(message.guild.id).length).split(/ +/);
    const commandName = args.shift().toLocaleLowerCase();
    const commandClass = client.commands.get(commandName) || client.commands.find(cmd => cmd?.aliases?.includes(commandName));
    if (!commandClass) return new Command(message).fail('That command does not exist!');
    const command = new commandClass(message, args, []);
    if (!utils.canUserExecute(message, commandClass)) {
        if (commandClass.category === categories.hidden) return command.fail('That command does not exist!');
        else return command.fail(`You do not have permissions to execute this command!\nMissing: ${commandClass.permissions instanceof Array ? commandClass.permissions.map(s => `\`${s}\``).join() : commandClass.permissions}`);
    }
    if (commandClass.reqArgs && !args.length) {
        let reply = `You didn't provide arguments!`;
        if (commandClass.usage) reply += `\ndo this :\n\`${sU.prefixFor(message.guild.id)}${commandClass.name} ${commandClass.usage}\``;
        return command.fail(reply);
    }
    if (commandClass.cooldown) {
        if (!client.cooldowns.has(commandClass.name)) client.cooldowns.set(commandClass.name, new Discord.Collection());
        const now = Date.now();
        const timestamps = client.cooldowns.get(commandClass.name);
        const cooldownAmount = (commandClass.cooldown) * 1000;
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                if (!utils.canUserExecute(message, { permissions: ['ADMINISTRATOR'] })) return command.fail(`please wait ${timeLeft.toFixed(1)} more second${timeLeft > 1 ? 's' : ''} before using that command`);
            }
        }
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
    console.log(`Handling command ${commandClass.name} from ${message.author.tag}`);
    if (command.run.constructor.name === `AsyncFunction`) {
        command.run(message, args).catch(e => {
            console.error(e);
            command.fail('there was an error trying to execute that command!');
        });
    } else {
        try {
            command.run(message, args);
        } catch (error) {
            console.error(error);
            command.fail('there was an error trying to execute that command!');
        }
    }
}

const { handleTicketCreate, handleTicketDelete } = require('../commands/tickets');
const { handleCrashLeaveButton } = require('../commands/ecrash');
const { Command } = require('../classes/command.js');
/** @param {Discord.Interaction} interaction */
module.exports.interactionCreate = interaction => {
    if (interaction.isButton() && interaction.customId === 'entergiveaway') asyncutils.addGiveawayUser(interaction);
    else if (interaction.isButton() && interaction.customId === 'openticket') handleTicketCreate(interaction);
    else if (interaction.isButton() && interaction.customId === 'closeticket') handleTicketDelete(interaction);
    else if (interaction.isButton() && interaction.customId === 'leavecrash') handleCrashLeaveButton(interaction);
}

/** @param {Discord.MessageReaction} reaction; @param {Discord.User} user */
module.exports.messageReactionAdd = async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
            await reaction.message.fetch();
        } catch (e) {
            console.error(`Something went wrong while fetching a partial reaction: `, e);
            return;
        }
    }
    if (reaction.emoji.name === '⭐') {
        if (!sU.settings[reaction.message.guild.id].starboard?.channel) return;
        if (reaction.count < sU.settings[reaction.message.guild.id].starboard.limit) return;
        const sbchannel = await client.channels.fetch(sU.settings[reaction.message.guild.id].starboard.channel).catch(r => { console.log(r) });
        if (!sbchannel) return (await client.users.fetch(sU.config.owner)).send(`Hey, \`${reaction.message.guild.name.toString()}\` has an invalid starboard id.\nApplying fix: set to null`).then(m => {
            sU.settings[reaction.message.guild.id].starboard.channel = null;
            sU.saveSettings();
        });
        const prevEntry = (await sbchannel.messages.fetch({ limit: 100 })).find(m => m.embeds.length > 0 && m.embeds[0].author?.url && m.embeds[0].author.url.includes(reaction.message.id));
        if (prevEntry) {
            const starboardEmbed = new Discord.MessageEmbed(prevEntry.embeds[0]);
            starboardEmbed.setFooter({ text: `${reaction.count}⭐`, iconURL: 'https://raw.githubusercontent.com/fartdev/fartdev.github.io/main/img/dog_gold_grillz.jpg' });
            starboardEmbed.setTimestamp(new Date());
            prevEntry.edit({ content: 'Updated!', embeds: [starboardEmbed] });
        } else {
            const starboardEmbed = new Discord.MessageEmbed();
            starboardEmbed.setAuthor({ name: reaction.message.author.tag, iconURL: reaction.message.author.avatarURL(), url: reaction.message.url });
            starboardEmbed.setFooter({ text: `${reaction.count}⭐`, iconURL: 'https://raw.githubusercontent.com/fartdev/fartdev.github.io/main/img/dog_gold_grillz.jpg' });
            starboardEmbed.setTimestamp(new Date());
            starboardEmbed.setColor(14732819);
            starboardEmbed.setTitle(`#${reaction.message.channel.name.toString()} (Jump!)`);
            starboardEmbed.setURL(reaction.message.url);
            starboardEmbed.setDescription(reaction.message.content);
            if (reaction.message.attachments.first() && utils.urlIsImage(reaction.message.attachments.first().url))
                starboardEmbed.setImage(reaction.message.attachments.first().url);
            sbchannel.send({ content: 'New!', embeds: [starboardEmbed] });
        }
    } else {
        for (rrp of sU.settings[reaction.message.guild.id].reactionroles) {
            if (rrp.parent !== reaction.message.id || (rrp.emoji !== reaction.emoji.name && rrp.emoji !== `<:${reaction.emoji.identifier}>`)) continue;
            const role = reaction.message.guild.roles.fetch(rrp.role);
            reaction.message.guild.members.fetch(user.id).then(async m => {
                m.roles.add(await role).catch(r => { console.log(r) });
            });
        }
    }
}

/** @param {Discord.MessageReaction} reaction; @param {Discord.User} user */
module.exports.messageReactionRemove = async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
            await reaction.message.fetch();
        } catch (e) {
            console.error(`Something went wrong while fetching a partial reaction: `, e);
            return;
        }
    }
    if (reaction.emoji.name === '⭐') {
        if (!sU.settings[reaction.message.guild.id].starboard) return;
        const sbchannel = await client.channels.fetch(sU.settings[reaction.message.guild.id].starboard.channel).catch(r => { console.log(r) });
        if (!sbchannel) return (await client.users.fetch(sU.config.owner)).send(`Hey, \`${reaction.message.guild.name.toString()}\` has an invalid starboard id.\nApplying fix: set to null`).then(m => {
            sU.settings[reaction.message.guild.id].starboard.channel = null;
            sU.saveSettings();
        });
        const prevEntry = (await sbchannel.messages.fetch({ limit: 100 })).find(m => m.embeds.length > 0 && m.embeds[0].author?.url && m.embeds[0].author.url.includes(reaction.message.id));
        if (prevEntry) {
            const tooLow = reaction.count < sU.settings[reaction.message.guild.id].starboard.limit;
            const starboardEmbed = new Discord.MessageEmbed(prevEntry.embeds[0]);
            starboardEmbed.setFooter({ text: `${reaction.count}⭐`, iconURL: 'https://raw.githubusercontent.com/fartdev/fartdev.github.io/main/img/dog_gold_grillz.jpg' });
            starboardEmbed.setTimestamp(new Date());
            prevEntry.edit({ content: tooLow ? 'deleting in 10 seconds!' : 'Updated!', embeds: [starboardEmbed] });
            if (tooLow) setTimeout(() => prevEntry.delete().catch(r => { console.log(r) }), 10000);
        }
    } else {
        for (rrp of sU.settings[reaction.message.guild.id].reactionroles) {
            if (rrp.parent !== reaction.message.id || (rrp.emoji !== reaction.emoji.name && rrp.emoji !== `<:${reaction.emoji.identifier}>`)) continue;
            const role = reaction.message.guild.roles.fetch(rrp.role);
            reaction.message.guild.members.fetch(user.id).then(async m => {
                m.roles.remove(await role).catch(r => { console.log(r) });
            });
        }
    }
}

/** @param {Discord.Message | Discord.PartialMessage} message */
module.exports.messageDelete = async (message) => {
    if (message.author?.bot) return;
    if (!sU.settings[message.guild?.id].logconfig?.messages) return;
    const logchannel = await client.channels.fetch(sU.settings[message.guild.id].logconfig.messages).catch(r => { console.log(r) });
    if (!logchannel) return (await client.users.fetch(sU.config.owner)).send(`Hey, \`${message.guild.name.toString()}\` has an invalid log channel id.\nApplying fix: set to null`).then(m => {
        sU.settings[message.guild.id].logconfig.messages = null;
        sU.saveSettings();
    });
    const resEmbed = utils.getEmbedTemplate(message.author);
    resEmbed.setTitle('Message Deleted!');
    resEmbed.setURL(message.url);
    if (message.partial) resEmbed.addField('Partial', true, true);
    if (message.channel) resEmbed.addField('Channel', message.channel.toString(), true);
    if (message.author) resEmbed.addField('Author', message.author.tag, true);
    const delLog = message.guild.fetchAuditLogs({ limit: 1, type: 'MESSAGE_DELETE' });
    if ((await delLog).entries.first()?.target.id === message.author.id) {
        resEmbed.addField("Maybe deleted by", (await delLog).entries.first().executor.tag, true);
        resEmbed.setDescription("Maybe deleted by is based off of last person to delete one of that user's messages.\nThe message could very well be self-deleted.");
    } else resEmbed.setDescription("");
    if (message.content) resEmbed.addField('Content', message.content, false);
    let aTxt = "";
    for (k of message.attachments.keys()) aTxt += `${message.attachments.get(k).url} (${humanFileSize(message.attachments.get(k).size)})\n`
    if (aTxt !== "") resEmbed.addField("Attachments", aTxt, false);
    logchannel.send({ embeds: [resEmbed] }).catch(e => {
        console.log(`Error sending modlog for messageDelete in ${logchannel.name}: ${e.message}`);
    });
}

/** @param {Discord.Message | Discord.PartialMessage} oldMessage @param {Discord.Message | Discord.PartialMessage} message*/
module.exports.messageUpdate = async (oldMessage, message) => {
    try {
        if (message.author.bot) return;
        if (oldMessage.content === message.content) return;
        if (!sU.settings[message.guild.id].logconfig?.messages) return;
        const logchannel = await client.channels.fetch(sU.settings[message.guild.id].logconfig.messages).catch(r => { console.log(r) });
        if (!logchannel) return (await client.users.fetch(config.owner)).send(`Hey, \`${message.guild.name.toString()}\` has an invalid log channel id.\nApplying fix: set to null`).then(m => {
            sU.settings[message.guild.id].logconfig.messages = null;
            sU.saveSettings();
        });
        const resEmbed = utils.getEmbedTemplate(message.author);
        resEmbed.setTitle('Message Edited!');
        resEmbed.setURL(message.url);
        resEmbed.setDescription("");
        if (message.partial) resEmbed.addField('Partial', true, true);
        if (message.channel) resEmbed.addField('Channel', message.channel.toString(), true);
        if (message.author) resEmbed.addField('Author', message.author.tag, true);
        if (oldMessage.content) resEmbed.addField('Old Content', oldMessage.content, false);
        if (message.content) resEmbed.addField('New Content', message.content, false);
        logchannel.send({ embeds: [resEmbed] });
    } catch (e) {
        console.log(`Error while handling for messageUpdate: ${e.message}`);
    }
}

/** @param {Discord.GuildMember} member */
module.exports.guildMemberRemove = async (member) => {
    if (!sU.settings[member.guild.id]?.logconfig?.leave) return;
    const logchannel = await client.channels.fetch(sU.settings[member.guild.id].logconfig.leave).catch(r => { console.log(r) });
    if (!logchannel) return (await client.users.fetch(sU.config.owner)).send(`Hey, \`${member.guild.name.toString()}\` has an invalid log channel id.\nApplying fix: set to null`).then(m => {
        sU.settings[member.guild.id].logconfig.channel = null;
        sU.saveSettings();
    });
    const resEmbed = utils.getEmbedTemplate(member.user);
    resEmbed.setTitle("Member removed!");
    const banLog = member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD' });
    const kickLog = member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_KICK' });
    if ((await banLog).entries.first() && (await banLog).entries.first().target.id === member.id) resEmbed.addField("Maybe banned by", (await banLog).entries.first().executor.tag, true);
    if ((await kickLog).entries.first() && (await kickLog).entries.first().target.id === member.id) resEmbed.addField("Maybe kicked by", (await kickLog).entries.first().executor.tag, true);
    if (((await banLog).entries.first() && (await banLog).entries.first().target.id === member.id) || ((await kickLog).entries.first() && (await kickLog).entries.first().target.id === member.id)) resEmbed.setDescription("Maybe banned/kicked by is based off of last person to perform one of those actions");
    else resEmbed.setDescription("");
    resEmbed.addField("Target", member.user.toString(), true);
    logchannel.send({ embeds: [resEmbed] }).catch(e => {
        console.log(`Error sending modlog for guildMemberRemove in ${logchannel.name}: ${e.message}`);
    });
}

/** @param {Discord.GuildMember} member */
module.exports.guildMemberAdd = async (member) => {
    if (!sU.settings[member.guild.id]?.logconfig?.join) return;
    const logchannel = await client.channels.fetch(sU.settings[member.guild.id].logconfig.join).catch(r => { console.log(r) });
    if (!logchannel) return (await client.users.fetch(sU.config.owner)).send(`Hey, \`${member.guild.name.toString()}\` has an invalid log channel id.\nApplying fix: set to null`).then(m => {
        sU.settings[member.guild.id].logconfig.channel = null;
        sU.saveSettings();
    });
    const resEmbed = utils.getEmbedTemplate(member.user);
    resEmbed.setDescription("");
    resEmbed.setTitle("Member joined!");
    resEmbed.addField("Target", member.user.toString(), true);
    logchannel.send({ embeds: [resEmbed] }).catch(e => {
        console.log(`Error sending modlog for guildMemberAdd in ${logchannel.name}: ${e.message}`);
    });
}

module.exports.guildCreate = async guild => {
    const newServerEmbed = utils.getEmbedTemplate(client.user);
    newServerEmbed.setDescription(``);
    newServerEmbed.setTitle(`Joined new server: \`${guild.name}\`!`);
    const invites = [];
    invites.push(...(await (await guild.invites.fetch()).keys()));
    if (!invites.length) await guild.invites.create(guild.channels.cache.find(c => c.type === "GUILD_TEXT"), { maxAge: 0 }).then(i => invites.push(i.code));
    newServerEmbed.addField(`Invite codes:`, invites.length ? invites.join(", ") : "N/A", true);
    newServerEmbed.addField(`ID:`, guild.id, true);
    newServerEmbed.addField(`Owner:`, (await guild.fetchOwner()).user.tag, true);
    newServerEmbed.addField(`Members:`, guild.memberCount ? guild.memberCount + "" : "N/A", true);
    (await client.users.fetch(sU.config.owner)).send({ content: `Joined a new server!`, embeds: [newServerEmbed] });
}