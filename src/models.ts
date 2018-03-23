import { Moment } from 'moment-timezone';

export interface TeamPlayingResult {
    isPlaying: boolean,
    nextGame: GetNextGameResult
}

export interface GetNextGameResult {
    time: Date,
    opponent: string,
}

export interface OWLResponse<T> {
    data: T
}

export interface GetTeamResult {
    schedule: Array<Match>
}

export interface Match {
    state: string,
    startDate: number,
    competitors: Array<Team>
}

export interface Team {
    id: number,
    name: string
}