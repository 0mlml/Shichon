const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils.js');
const sU = require('../util/settings.js');
const asyncutils = require('../util/events.js');
const { MessageActionRow, MessageButton, ButtonInteraction, CategoryChannel } = require('discord.js');

class TicketCommand extends Command {
    static name = `tickets`;
    static aliases = [`ticket`, `st`];
    static description = `make new tickets channel`;
    static permissions = ['MANAGE_CHANNELS', 'ADMIN'];
    static category = categories.mod;
    
    async run() {
        const categoryChannel = await this.message.guild.channels.create('tickets', {
            type: 'GUILD_CATEGORY',
            permissionOverwrites: [
                {
                    id: this.message.guild.roles.everyone,
                    deny: ['SEND_MESSAGES'],
                }
            ]
        });
        const mainChannel = await this.message.guild.channels.create('new-ticket', {
            type: 'GUILD_TEXT',
            permissionOverwrites: [
                {
                    id: this.message.guild.roles.everyone,
                    deny: ['SEND_MESSAGES'],
                }
            ],
            parent: categoryChannel.id
        });
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('openticket')
                    .setLabel('New Ticket')
                    .setEmoji('❓')
                    .setStyle('SUCCESS'),
            );
        await mainChannel.send({ content: `Ticket Creation`, embeds: [utils.getEmbedTemplate(this.client.user).setDescription('Click the button to open a ticket')], components: [row] });
        this.succeed();
    }
}

module.exports.command = TicketCommand;

/** @param {ButtonInteraction} interaction */
module.exports.handleTicketCreate = async interaction => {
    /** @type {CategoryChannel} */
    const parent = interaction.message.channel.parent;
    if (parent.children.find((v, k) => v.name.includes(interaction.user.id))) return interaction.reply({ content: 'You already have an open ticket', ephemeral: true });
    const po = [{ id: interaction.guild.roles.everyone.id, deny: ['VIEW_CHANNEL'] }, { id: interaction.user.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] }];
    for (let r of sU.settings[interaction.guild.id].adminroles) po.push({ id: r, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] });
    for (let r of sU.settings[interaction.guild.id].modroles) po.push({ id: r, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] });
    const ticketChannel = await interaction.guild.channels.create('ticket-' + interaction.user.id, {
        type: 'GUILD_TEXT',
        permissionOverwrites: po,
        parent: parent.id
    });
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('closeticket')
                .setLabel('Close Ticket')
                .setEmoji('❌')
                .setStyle('DANGER')
        );
    await ticketChannel.send({ embeds: [utils.getEmbedTemplate(interaction.user).setDescription('Click the button to close this ticket')], components: [row] });
    interaction.reply({ content: ticketChannel.toString(), ephemeral: true });
}
/** @param {ButtonInteraction} interaction */
module.exports.handleTicketDelete = interaction => {
    interaction.reply('Deleting...');
    interaction.channel.delete();
}