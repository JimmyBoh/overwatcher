import * as moment from 'moment-timezone';
import { isTeamPlaying, getNextGame } from './service';

const OUTLAWS = 4525;
const DYNASTY = 4409;
const VALIANT = 4405;
const LONDON = 4410;

(async function test() {
    await show(OUTLAWS);
    await show(DYNASTY);
    await show(VALIANT);
    await show(LONDON);
})();

function show(id: number) {
    return isTeamPlaying(id).then(function (results) {
        let speechOutput;
        if (results.isPlaying) {
            speechOutput = 'The ' + results.nextGame.team + ' are currently playing against ' + results.nextGame.opponent;
        } else {
            speechOutput = 'The ' + results.nextGame.team + ' are not playing at the moment.';
            if (results.nextGame) {
                let nextGameTime = moment(results.nextGame.time).format('dddd, MMMM Do [at] h:mma');
                speechOutput += ' Their next game is on ' + nextGameTime + ' against the ' + results.nextGame.opponent;
            }
        }

        console.log(speechOutput);
    }, function (err: string) {
               
        console.log(err);
    });
}