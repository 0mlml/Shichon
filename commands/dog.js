const { Command, categories } = require('./../classes/command.js');
const axios = require('axios').default;
const utils = require('../util/utils');

class DogCommand extends Command {
    static name = 'dog';
    static description = 'dog';
    static category = categories.fun; 
    
    async run() {
        const dog = (await axios.get('https://random.dog/woof.json')).data;
        if (dog.url.includes('mp4')) this.message.channel.send({ files: [dog.url] });
        else {
            let r = utils.getEmbedTemplate(this.message.author);
            this.message.channel.send({ embeds: [utils.getEmbedTemplate(this.message.author).setDescription('').setImage(dog.url).setFooter({ text: utils.humanFileSize(dog.fileSizeBytes) })] });
        }
    }
}

module.exports.command = DogCommand;