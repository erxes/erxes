import { IItem, IItemParams } from 'modules/boards/types';
import { IActivityLogForMonth } from '../activityLogs/types';

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export interface IGrowthHack extends IItem {
  hackDescription?: string;
  goal?: string;
}

export interface IGrowthHackParams extends IItemParams {
  hackDescription?: string;
  goal?: string;
}
