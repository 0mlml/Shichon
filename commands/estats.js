const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils');
const econ = require('../util/economy');

class EconStatsCommand extends Command {
    static name = 'estats';
    static description = 'See the stats about the bot\'s usage (economy)';
    static aliases = ['stats', 'estat'];
    static category = categories.econ;

    async run() {
        const resEmbed = utils.getEmbedTemplate(this.message.author);
        resEmbed.setTitle('Economy stats');
        resEmbed.setDescription(`Global gambling gain: ${econ.getStat('gambling_won')}\nGlobal gambling loss: ${econ.getStat('gambling_lost')}`);
        this.message.channel.send({ embeds: [resEmbed] });
        this.succeed();
    }
}

module.exports.command = EconStatsCommand;