const { Command, categories } = require('./../classes/command.js');

class PingCommand extends Command {
    static name = 'ping';
    static description = 'the pong';
    static aliases = ['pong', 'lag'];
    static category = categories.util;

    async run() {
        this.message.reply(`pong! ${this.client.ws.ping}ms`);
    }
}

module.exports.command = PingCommand;