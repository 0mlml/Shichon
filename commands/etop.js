const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils');
const econ = require('../util/economy');

class EconLeaderboardCommand extends Command {
    static name = 'etop';
    static description = 'Get the leaderboards (economy)';
    static aliases = ['eleaderboard', 'eleaderboards', 'top'];
    static category = categories.econ;

    static getTopSorted = () => {
        return Object.keys(econ.stored.u).sort((a, b) => econ.stored.u[b].balance - econ.stored.u[a].balance);
    }

    async run() {
        const resEmbed = utils.getEmbedTemplate(this.message.author);
        let userIndex = EconLeaderboardCommand.getTopSorted().findIndex(v => v === this.message.author.id);
        resEmbed.setDescription(EconLeaderboardCommand.getTopSorted().splice(0, 10).map((v, i) => `**${i + 1}.** <@${v}> - $${econ.stored.u[v].balance}`).join('\n') + (userIndex > -1 && userIndex >= 10 ? `\n\n**${userIndex + 1}.** <@${this.message.author.id}> - $${econ.stored.u[this.message.author.id].balance}` : ''));
        this.message.channel.send({ embeds: [resEmbed] });
        this.succeed();
    }
}

module.exports.command = EconLeaderboardCommand;