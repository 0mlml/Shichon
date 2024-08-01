const { Command, categories } = require('../classes/command.js');
const { prefixFor } = require('../util/settings.js');

class CharsCommand extends Command {
    static name = 'chars';
    static description = 'chars counter';
    static reqArgs = true;
    static usage = '<text>';
    static category = categories.fun;

    async run() {
        this.succeed(`**Metrics:**\nAfter command: ${this.message.content.length - (CharsCommand.name.length + prefixFor(this.message.guild.id).length) - 1}\nNo spaces: ${this.args.join('').length}\nEntire message: ${this.message.content.length}`);
    }
}

module.exports.command = CharsCommand;