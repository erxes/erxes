import { atom } from 'jotai';

export interface IReturnEbarimtConfigRow {
  _id: string;
  subId: string;
  title: string;
  destinationStageBoard: string;
  pipelineId: string;
  stageId: string;
  userEmail?: string;
  hasVat?: boolean;
  hasCitytax?: boolean;
}

export const returnEbarimtDetailAtom = atom<IReturnEbarimtConfigRow | null>(null);
