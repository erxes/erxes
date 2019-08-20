import { IItem, IItemParams } from 'modules/boards/types';
import { IActivityLogForMonth } from '../activityLogs/types';

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export interface IGrowthHack extends IItem {
  hackDescription?: string;
  goal?: string;
  hackStages?: string[];
  formId?: string;
  formFields?: any;
  scoringType?: string;
  reach?: number;
  impact?: number;
  confidence?: number;
  ease?: number;
}

export interface IGrowthHackParams extends IItemParams {
  hackDescription?: string;
  goal?: string;
  hackStages?: string[];
  formId?: string;
  formFields?: any;
}

export interface IFormField {
  name: string;
  value: string;
}
