import { IItem } from 'modules/boards/types';
import { IActivityLogForMonth } from '../activityLogs/types';

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export type TaskDetailQueryResponse = {
  taskDetail: IItem;
  loading: boolean;
  refetch: () => void;
};
