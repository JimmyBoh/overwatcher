
import { isTeamPlaying, getNextGame} from './service';

const OUTLAWS = { id: 4525, name: 'Houston Outlaws' };
const VALIANT = { id: 4405, name: 'Los Angeles Valiant' };
const LONDON = { id: 4410, name: 'London Spitfire' };

show(VALIANT);

function show(team: {id: number, name: string}) {

    return isTeamPlaying(team.id).then(function (results) {
        let speechOutput;
        if (results.isPlaying) {
            speechOutput = 'The ' + team.name + ' are currently playing against ' + results.nextGame.opponent;
        } else {
            speechOutput = 'The ' + team.name + ' are not playing at the moment.';
            if (results.nextGame) speechOutput += ' Their next game is on ' + results.nextGame.time + ' against the ' + results.nextGame.opponent;
        }

        console.log(speechOutput);
    }, function (err: string) {
               
        console.log(err);
    });
}