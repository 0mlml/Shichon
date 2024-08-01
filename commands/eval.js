const { Command, categories } = require('./../classes/command.js');
const utils = require('../util/utils');
const { settings } = require('../util/settings');
const econ = require('../util/economy');

class EvaluateCommand extends Command {
    static name = 'eval';
    static description = 'Evaluate JavaScript code';
    static usage = '<code>';
    static reqArgs = true;
    static category = categories.hidden;
    static permissions = 'owner';

    async run() {
        let out;
        try {
            out = eval(this.message.content.substring(5));
        } catch (e) {
            return this.fail(e);
        }
        this.succeed(`Executed: ${this.message.content.substring(5)}\nOutput: ${out}`);
    }
}

module.exports.command = EvaluateCommand;