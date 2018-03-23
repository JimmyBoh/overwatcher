import * as moment from 'moment-timezone';
const OWL = require('overwatchleague.js');

import {
    TeamPlayingResult,
    GetNextGameResult,
    OWLResponse,
    GetTeamResult
} from './models';

export async function isTeamPlaying(teamId: number): Promise<TeamPlayingResult> {
    const nextGame = await getNextGame(teamId);

    let isPlaying = nextGame.time < new Date();

    return {
        isPlaying,
        nextGame
    };
}

export function getNextGame(teamId: number): Promise<GetNextGameResult> {
    return OWL.getTeam(teamId).then((res: OWLResponse<GetTeamResult>) => {
        const nextGame = res.data.schedule.filter(x => x.state !== 'CONCLUDED').sort((a, b) => a.startDate - b.startDate)[0];

        if (!nextGame) return null;

        const start = new Date(nextGame.startDate);
        const team = nextGame.competitors.find(x => x.id === teamId);
        const opponent = nextGame.competitors.find(x => x.id !== teamId);

        return {
            time: start,
            team: team.name,
            opponent: opponent.name || 'TBD'
        };
    });
}
