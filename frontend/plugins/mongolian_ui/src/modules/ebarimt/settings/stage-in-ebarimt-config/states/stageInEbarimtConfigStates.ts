import { TStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/types';

export interface IStageInEbarimtConfigRow extends TStageInEbarimtConfig {
  _id: string;
  subId: string;
}
