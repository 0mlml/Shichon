console.log(`Starting!`);
const { Client, Collection } = require('discord.js');
const activities = [
    { name: 'for my tasty takeaway', type: 'LISTENING' },
    { name: 'rocket league', type: 'PLAYING' },
    { name: 'out for 5 billion rockets', type: 'WATCHING' },
];
let activityIndex = 0;
const client = new Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    disableMentions: { repliedUser: true },
    presence: { status: 'idle', activities: [activities[activityIndex]] }
});
module.exports.client = client;
module.exports.emojiMappings = { // TODO: map all emojis, not just custom
    econ_crypto_doge: '<:doge:928841945458024460>',
    econ_crypto_btc: '<:btc:928841945709690890>',
    econ_crypto_eth: '<:eth:928841945680334980>',
    econ_highroller_badge: '<a:high_roller:948584238368825364>',
    econ_betatester_badge: '<:beta_tester:918551032273977355>',
    econ_hamster_badge: '<a:hamster:918912445769199746>',
    econ_crash_ongoing: '<a:ongoing:948969664342556782>',
    econ_crash_done: '<:done:948970106032111626>',
    econ_slots_rolling: '<a:slots_roll:948603881087180800>',
    ar_alert_react: '<a:antiraid_alert:955292453760544841>'
}

setInterval(() => {
    activityIndex++;
    if (activityIndex >= activities.length) activityIndex = 0;
    client.user.setPresence({ status: 'idle', activities: [activities[activityIndex]] });
}, 30000);

const fs = require('fs');
if (!fs.existsSync('./config.json')) fs.writeFileSync('./config.json', JSON.stringify({ token: '', prefix: '!', owner: '' }, null, 2));
const { config } = require('./util/settings');

if (!config.token || !config.owner) { console.error(new Error('Please fill in the fields in config.json!')); process.exit(-1) }

const handlers = require('./util/handlers');
const events = require('./util/events');
events.initTimeouts();

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const cf = require(`./commands/${file}`);
    client.commands.set(file.split('.')[0], cf.command);
}

console.log(`Loaded ${client.commands.size} commands!`);
client.cooldowns = new Collection();

client.once('ready', handlers.ready);
client.on('guildCreate', handlers.guildCreate);
client.on('messageCreate', handlers.messageCreate);
client.on('messageDelete', handlers.messageDelete);
client.on('messageUpdate', handlers.messageUpdate);
client.on('guildMemberAdd', handlers.guildMemberAdd);
client.on('guildMemberRemove', handlers.guildMemberRemove);
client.on('interactionCreate', handlers.interactionCreate);
client.on('messageReactionAdd', handlers.messageReactionAdd);
client.on('messageReactionRemove', handlers.messageReactionRemove);

client.login(config.debug ? config.test_token : config.token);