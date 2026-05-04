import { atom } from 'jotai';
import { TStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/types';

export interface IStageInEbarimtConfigRow extends TStageInEbarimtConfig {
  _id: string;
  subId: string;
}

export const stageInEbarimtDetailAtom = atom<IStageInEbarimtConfigRow | null>(null);
