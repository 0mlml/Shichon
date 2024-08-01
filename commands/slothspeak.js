const { Command, categories } = require('../classes/command.js');
const { prefixFor } = require('../util/settings.js');

class SlothspeakCommand extends Command {
    static name = 'slothspeak';
    static description = 'replace all vowels with y, can be used in a reply';
    static usage = '<text>';
    static category = categories.fun;

    async run() {
        if (this.message.reference) {
            let reference = await this.message.fetchReference();
            if (!reference.content.length) return this.fail('Ny cyntynt!');
            this.succeed(reference.content.replace(/[a|e|i|o|u]/g, 'y').replace(/[a|e|i|o|u]/gi, 'Y'));
        } else {
            if (!this.args[0]) return this.fail('Ny cyntynt!');
            this.succeed(this.message.content.substring(SlothspeakCommand.name.length + prefixFor(this.message.guild.id).length + 1).replace(/[a|e|i|o|u]/g, 'y').replace(/[a|e|i|o|u]/gi, 'Y'));
        }
    }
}

module.exports.command = SlothspeakCommand;