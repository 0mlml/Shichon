const { Command, categories } = require('./../classes/command.js');

class ReloadCommand extends Command {
    run() {
        const commandName = this.args[0].toLowerCase();
        const command = this.message.client.commands.get(commandName)
            || this.message.client.commands.find(cmd => cmd?.aliases.includes(commandName));
        if (!command) return this.fail(`There is no command with name or alias \`${commandName}\``);
        delete require.cache[require.resolve(`./${command.name}.js`)];
        try {
            const newCommand = require(`./${command.name}.js`);
            this.message.client.commands.set(newCommand.command.name, newCommand.command);
            this.succeed(`${newCommand.command.name} has been reloaded successfully`);
        } catch (error) {
            console.log(error);
            return this.fail(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
        }
    }

    static name = 'reload';
    static reqArgs = true;
    static permissions = 'owner';
    static description = 'Reloads a command';
    static aliases = ['rl'];
    static usage = '<command>';
    static category = categories.hidden;
}

module.exports.command = ReloadCommand;