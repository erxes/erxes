import { Document } from 'mongoose';

export interface ICallAgentPauseInterval {
  start: Date;
  end: Date;
  durationSec: number;
}

export interface ICallAgentPauseStats {
  integrationId: string;
  queue: string;
  extension: string;
  date: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  answer: number;
  abandon: number;
  talktime: number;
  pauseReason?: string;
  currentPauseStartedAt?: Date | null;
  pauseIntervals: ICallAgentPauseInterval[];
  totalPausedSec: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICallAgentPauseStatsDocument
  extends ICallAgentPauseStats,
    Document {
  _id: string;
}
