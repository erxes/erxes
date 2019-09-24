import { IItem, IItemParams } from 'modules/boards/types';
import { IField } from 'modules/settings/properties/types';
import { IActivityLogForMonth } from '../activityLogs/types';

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export interface IGrowthHack extends IItem {
  hackStages?: string[];
  formId?: string;
  formSubmissions?: any;
  scoringType?: string;
  reach?: number;
  impact?: number;
  confidence?: number;
  formFields?: IField[];
  ease?: number;
}

export interface IGrowthHackParams extends IItemParams {
  hackStages?: string[];
  priority?: string;
  formId?: string;
  formSubmissions?: any;
  reach?: number;
  impact?: number;
  confidence?: number;
  ease?: number;
}

export interface IFormField {
  name: string;
  value: string;
}
