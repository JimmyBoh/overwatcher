import * as Alexa from 'alexa-sdk';
import * as moment from 'moment';

import { isTeamPlaying } from './service';
import { Team } from './models';

const SKILL_NAME = 'Overwatcher';
const HELP_MESSAGE = `You can ask if an Overwatch League team is playing, or tell me your favorite and I'll remember it.`;
const HELP_REPROMPT = 'Which team would you like to know about?';
const EMPTY_STRING = '';

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

const handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent');    
    },
    'SetMyFavIntent': async function () {
        let specifiedTeam: string = this.event.request.intent.slots.team.value;
        let myFavorite: string = this.event.request.intent.slots.myFavorite.value;
        let team: Team = this.event.request.intent.slots.team.resolutions.resolutionsPerAuthority[0].values[0].value;
        team.id = parseInt(team.id + EMPTY_STRING);
        let favorite: Team = this.event.request.intent.slots.myFavorite.resolutions.resolutionsPerAuthority[0].values[0].value;
        favorite.id = parseInt(favorite.id + EMPTY_STRING);

        if (team.id !== 1 && favorite.id !== 1) {
            let speechOutput = `I'm sorry, I didn't quite understand. Please try again. `;
            this.response.speak(speechOutput);
            this.emit(':responseReady');
        } else {
            let newFav = [team, favorite].find(t => t.id !== 1);

            this.attributes['fav'] = newFav;
            let speechOutput = `${newFav.name} has been set as your favorite. `;
            this.response.cardRenderer(SKILL_NAME, speechOutput);
            this.response.speak(speechOutput);
            this.emit(':responseReady');
        }
    },
    'GetMyFavIntent': async function () {
        let speechOutput: string = EMPTY_STRING;
        let myFavorite: string;
        let favorite: Team;

        try {
            myFavorite = this.event.request.intent.slots.myFavorite.value;
            favorite = this.event.request.intent.slots.myFavorite.resolutions.resolutionsPerAuthority[0].values[0].value;
            favorite.id = parseInt(favorite.id + EMPTY_STRING);
        } catch (ex) {
            this.response.speak(`I'm sorry, I didn't quite understand. Please try again.`);
            this.emit(':responseReady');
            return;
        }

        if (favorite.id !== 1) {
            this.response.speak(`I'm sorry, I didn't quite understand. Please try again.`);
            this.emit(':responseReady');
            return;
        }

        const currentFav = this.attributes['fav'];

        if (currentFav) {
            let speechOutput = `${currentFav.name} is your favorite.`;
            this.response.speak(speechOutput);
            this.response.cardRenderer(SKILL_NAME, speechOutput);
            this.emit(':responseReady');
            return;
        }

        this.response.speak(`You currently don't have a favorite team. You can tell me your favorite team, or ask me about any team.`);
        this.emit(':responseReady');
    },
    'MatchStatusIntent': async function () {
        let specifiedTeam: string;
        let team: Team;
        let speechOutput: string;

        try {
            specifiedTeam = this.event.request.intent.slots.team.value;
            
            team = this.event.request.intent.slots.team.resolutions.resolutionsPerAuthority[0].values[0].value;
            team.id = parseInt(team.id + EMPTY_STRING);

            if (team.id === 1) {
                team = this.attributes['fav'];
            }
        } catch (ex) {
            speechOutput = specifiedTeam ? ('Hmm, ' + specifiedTeam + ' is not a registered team. Please try again with a registered team.') : 'Please specify a registered team.';
            this.response.speak(speechOutput);
            this.emit(':responseReady');
            return;
        }
        
        const isPlayingResult = await isTeamPlaying(team.id);
        if (isPlayingResult.isPlaying) {
            speechOutput = 'The ' + team.name + ' are currently playing against ' + isPlayingResult.nextGame.opponent;
        } else {
            const timeStr = moment(isPlayingResult.nextGame.time).format('dddd, MMMM Do');
            speechOutput = `The ${team.name} are not playing at the moment. Their next game is on ${timeStr} against the ${isPlayingResult.nextGame.opponent}.`;
        }

        this.response.cardRenderer(SKILL_NAME, speechOutput);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':responseReady');
    }
};

export function handler (event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context, callback: (err: any, response: any) => void) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = process.env.OVERWATCHER_APP_ID;
    alexa.dynamoDBTableName = 'OverwatcherDB';
    alexa.registerHandlers(handlers);
    alexa.execute();
};
