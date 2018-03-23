/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
import * as Alexa from 'alexa-sdk';
import * as moment from 'moment-timezone';

import { isTeamPlaying } from './service';
import { Team } from './models';

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this:
const APP_ID = process.env.OVERWATCHER_APP_ID;

const SKILL_NAME = 'Overwatcher';
const HELP_MESSAGE = 'You can ask if an Overwatch League team is playing... ?';
const HELP_REPROMPT = 'Which team would you like to know about?';
const EMPTY_STRING = '';

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

const handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent');
    },
    // 'SetMyTeamIntent': async function () {
    //     let speechOutput: string;
    //     let specifiedTeam: string = this.event.request.intent.slots.team.value;
    //     let team: Team = this.event.request.intent.slots.team.resolutions.resolutionsPerAuthority[0].values[0].value;

        
    // },
    'PlayingIntent': async function () {
        let specifiedTeam: string;
        let team: Team;
        let speechOutput: string;

        try {
            specifiedTeam = this.event.request.intent.slots.team.value;
            team.id = parseInt(team.id + EMPTY_STRING);
        } catch (ex) {
            speechOutput = specifiedTeam ? ('Hmm, ' + specifiedTeam + ' is not a registered team. Please try again with a registered team.') : 'Please specify a registered team.';
            this.response.cardRenderer(SKILL_NAME, speechOutput);
            this.response.speak(speechOutput);
            this.emit(':responseReady');
            return;
        }

        const results = await isTeamPlaying(team.id);
        if (results.isPlaying) {
            speechOutput = 'The ' + team.name + ' are currently playing against ' + results.nextGame.opponent;
        } else {
            const convertedTime = await convertTime(results.nextGame.time, null);
            const timeStr = moment(convertedTime).format('dddd, MMMM Do [at] h:mma');
            speechOutput = 'The ' + team.name + ' are not playing at the moment. ' + 'Their next game is on ' + timeStr + ' against the ' + results.nextGame.opponent;
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

async function convertTime(origTime: Date, userId: string): Promise<Date> {
    return origTime;
}

export function handler (event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context, callback: (err: any, response: any) => void) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
    //alexa.dynamoDBTableName = 'OverwatcherDB';
    alexa.registerHandlers(handlers);
    alexa.execute();
};