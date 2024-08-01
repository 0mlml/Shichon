const { Command, categories } = require('../classes/command');
const fetch = require('node-fetch');

class DiscordTogetherCommand extends Command {
    static name = 'discordtogether';
    static description = 'youtube in the voice channel fo today';
    static aliases = ['activities', 'dt', 'ytt'];
    static usage = '[activity]';
    static category = categories.fun;

    static allApplications = {
        youtube: '880218394199220334', // Note : First package to include the new YouTube Together version, any other package offering it will be clearly inspired by it
        youtubedev: '880218832743055411', // Note : First package to include the new YouTube Together development version, any other package offering it will be clearly inspired by it
        poker: '755827207812677713',
        betrayal: '773336526917861400',
        fishing: '814288819477020702',
        chess: '832012774040141894',
        chessdev: '832012586023256104', // Note : First package to offer chessDev, any other package offering it will be clearly inspired by it
        lettertile: '879863686565621790', // Note : First package to offer lettertile, any other package offering it will be clearly inspired by it
        wordsnack: '879863976006127627', // Note : First package to offer wordsnack any other package offering it will be clearly inspired by it
        doodlecrew: '878067389634314250', // Note : First package to offer doodlecrew, any other package offering it will be clearly inspired by it
        awkword: '879863881349087252', // Note : First package to offer awkword, any other package offering it will be clearly inspired by it
        spellcast: '852509694341283871', // Note : First package to offer spellcast, any other package offering it will be clearly inspired by it
        checkers: '832013003968348200', // Note : First package to offer checkers, any other package offering it will be clearly inspired by it
        puttparty: '763133495793942528', // Note : First package to offer puttparty, any other package offering it will be clearly inspired by it
        sketchheads: '902271654783242291', // Note : First package to offer sketchheads any other package offering it will be clearly inspired by it
        ocho: '832025144389533716', // Note : First package to offer ocho any other package offering it will be clearly inspired by it
        puttpartyqa: '945748195256979606',
        sketchyartist: '879864070101172255', // Note : First package to offer sketchyartist, any other package offering it will be clearly inspired by it
        land: '903769130790969345',
        meme: '950505761862189096',
        askaway: '976052223358406656',
        bobble: '947957217959759964',
    };

    async run() {
        if (this.args[0] && DiscordTogetherCommand.allApplications[this.args[0].toLowerCase()]) {
            if (!this.message.member.voice.channel?.id) return this.fail('Please join a voice channel');
            let voiceChannelId = this.message.member.voice.channel.id;
            let applicationID = DiscordTogetherCommand.allApplications[this.args[0].toLowerCase()];
            try {
                await fetch(`https://discord.com/api/v10/channels/${voiceChannelId}/invites`, {
                    method: 'POST',
                    body: JSON.stringify({
                        max_age: 86400,
                        max_uses: 0,
                        target_application_id: applicationID,
                        target_type: 2,
                        temporary: false,
                        validate: null,
                    }),
                    headers: {
                        Authorization: `Bot ${this.client.token}`,
                        'Content-Type': 'application/json',
                    },
                })
                    .then((res) => res.json())
                    .then((invite) => {
                        if (invite.error || !invite.code) return this.fail('An error occured while retrieving data !');
                        if (Number(invite.code) === 50013) console.warn('Your bot lacks permissions to perform that action');
                        this.succeed(`https://discord.com/invite/${invite.code}`);
                    });
            } catch (e) {
                this.fail('Error starting an activity: ' + e.message);
                console.log(e.toJSON());
            }
        } else {
            this.succeed(`Valid messages: \`${Object.keys(DiscordTogetherCommand.allApplications).join(', ')}\``);
        }
    }
};

module.exports.command = DiscordTogetherCommand;