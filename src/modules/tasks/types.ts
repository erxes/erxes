import { IItem } from 'modules/boards/types';
import { IActivityLogForMonth } from '../activityLogs/types';

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export interface ITask extends IItem {
  channel?: string;
}
