const { settings, config } = require('./settings');
const Discord = require('discord.js');
const fs = require('fs');
const { client } = require('../.');

module.exports.logMessage = (message) => {
    let final = '~~~~~~~~~~~~~\n';
    let ts = new Date(message.createdTimestamp);
    final += `[${ts.getHours()}:${ts.getMinutes()}:${ts.getSeconds()}] `;
    final += `${message.content ? (message.content.includes('\n') ? '\x1b[36mmulti-line message below:\x1b[0m\n' : '') + message.content : '\x1b[31mNO CONTENT\x1b[0m'}\n`;
    if (message.attachments.first()) final += `Attachments:\n`
    for (k of message.attachments.keys()) final += `${message.attachments.get(k).url} (${this.humanFileSize(message.attachments.get(k).size)})\n`
    if (message.embeds.length) final += `Embed count: ${message.embeds.length}\n`;
    final += `by ${message.author.tag} `
    final += `in #${message.channel.name} (${message.guild.toString()})`;
    console.log(final);
}

module.exports.writeFileRename = (path, c, cb) => {
    const tmp = `${path}.new`;
    if (fs.existsSync(tmp)) return console.log('Blocked attempt to double write a file, ' + tmp);
    fs.writeFile(tmp, c, (e) => {
        if (e) {
            return cb(e);
        }
        fs.rename(tmp, path, cb);
    });
};

module.exports.humanFileSize = (size) => {
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
};

const specialPermsList = ['MOD', 'ADMIN', 'GUILD_OWNER'];
/** @param {Discord.Message} message * @param {import('../classes/command').Command} command */
module.exports.canUserExecute = (message, command) => {
    if (!command.permissions.length) return true;
    if (command.permissions === 'owner' || message.author.id === config.owner) return message.author.id === config.owner;
    const specialPerms = command.permissions?.filter(p => specialPermsList.includes(p));
    if (specialPerms?.includes('MOD')) for (key of message.member.roles.cache.keys()) if (settings[message.guild.id].modroles.includes(message.member.roles.cache.get(key).id) || settings[message.guild.id].adminroles.includes(message.member.roles.cache.get(key).id)) return true;
    if (specialPerms?.includes('ADMIN')) {
        if (message.channel.permissionsFor(message.member).has(['ADMINISTRATOR'])) return true;
        for (key of message.member.roles.cache.keys()) if (settings[message.guild.id].adminroles.includes(message.member.roles.cache.get(key).id)) return true;
    }
    if (specialPerms?.length > 0) if (message.guild.ownerId === message.author.id) return true;
    let filtered = command.permissions?.filter(p => !specialPermsList.includes(p));
    return filtered.length > 0 && message.channel.permissionsFor(message.member).has(filtered);
}

module.exports.randomElementFromArray = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports.urlIsImage = (url) => {
    module.exports.splitUrl = url.split('.');
    if (!/(jpg|jpeg|png|gif)/gi.test(splitUrl[splitUrl.length - 1])) return;
    return url;
}

/**
* @param {Discord.User} user
* @returns {Discord.MessageEmbed}
*/
module.exports.getEmbedTemplate = (user) => {
    return new Discord.MessageEmbed()
        .setAuthor({ name: user.tag, iconURL: user.avatarURL() })
        .setTimestamp(new Date())
        .setColor('#a03ca0')
        .setFooter({ text: 'Shichon v' + config.version, iconURL: client.user.displayAvatarURL() })
}

module.exports.removeZalgo = (str) => {
    return str.replace(/([aeiouy]\u0308)|[\u0300-\u036f\u0489]/ig, '$1');
}

module.exports.replaceLetterSubstitutions = (str) => {
    str = str.replaceAll('​', '');
    str = str.replaceAll('|', 'I');
    str = str.replaceAll('I', 'l');
    str = str.replaceAll('_', '');
    str = str.replaceAll('*', '');
    return str;
}

module.exports.getMSUntil = (date) => {
    return date - Date.now();
}

module.exports.getTimePlusString = (input) => {
    const matches = input.match(/(\d+)([dhms])/);
    let now = Date.now();
    if (!matches) return -1;
    if (matches[2] === 'd') now += 86400000 * parseInt(matches[1]);
    if (matches[2] === 'h') now += 3600000 * parseInt(matches[1]);
    if (matches[2] === 'm') now += 60000 * parseInt(matches[1]);
    if (matches[2] === 's') now += 1000 * parseInt(matches[1]);
    return now;
}

module.exports.getTimeFromString = (input) => {
    const matches = input.match(/(\d+)([dhms])/);
    let time = 0;
    if (!matches) return -1;
    if (matches[2] === 'd') time += 86400000 * parseInt(matches[1]);
    if (matches[2] === 'h') time += 3600000 * parseInt(matches[1]);
    if (matches[2] === 'm') time += 60000 * parseInt(matches[1]);
    if (matches[2] === 's') time += 1000 * parseInt(matches[1]);
    return time;
}

module.exports.formatDateTime = (date) => {
    return date.getUTCFullYear() + '/' +
        ('0' + (date.getUTCMonth() + 1)).slice(-2) + '/' +
        ('0' + date.getUTCDate()).slice(-2) + ' ' +
        ('0' + date.getUTCHours()).slice(-2) + ':' +
        ('0' + date.getUTCMinutes()).slice(-2) + ':' +
        ('0' + date.getUTCSeconds()).slice(-2);
}

module.exports.stringToBoolean = (string) => {
    switch (string.toLowerCase().trim()) {
        case 'true':
        case 'yes':
        case '1':
            return true;

        case 'false':
        case 'no':
        case '0':
        case null:
            return false;

        default:
            return Boolean(string);
    }
}

module.exports.resolveAfterMS = (ms) => {
    return new Promise(res => {
        setTimeout(() => {
            res();
        }, ms);
    });
}

module.exports.formatSeconds = (seconds) => {
    const pad = (s) => { return (s < 10 ? '0' : '') + s; }
    return pad(`${Math.floor(seconds / (60 * 60))} hours, ${pad(Math.floor(seconds % (60 * 60) / 60))} minutes, ${pad(Math.floor(seconds % 60))} seconds`);
}

module.exports.sendToModChannel = async (guildid, user, info) => {
    if (!settings[guildid]?.logconfig?.moderation) return;
    const logchannel = await client.channels.fetch(settings[guildid].logconfig.moderation).catch(r => { console.log(r) });
    if (!logchannel) return (await client.users.fetch(config.owner)).send(`Hey, \`${guildid}\` has an invalid log channel id.\nApplying fix: set to null`).then(m => {
        settings[guildid].logconfig.moderation = null;
        require('./settings').saveSettings();
    });
    if (typeof info === Discord.MessageEmbed) {
        logchannel.send({ embeds: [resEmbed] });
    } else {
        console.log(info);
        const resEmbed = this.getEmbedTemplate(user);
        resEmbed.setDescription(info);
        logchannel.send({ embeds: [resEmbed] });
    }
}

module.exports.clamp = (v, min, max) => v > max ? max : v < min ? min : v;