import { IItem } from 'modules/boards/types';
import { IActivityLogForMonth } from '../activityLogs/types';

export type ITask = IItem;

export type EditMutationVariables = {
  _id: string;
  name?: string;
  assignedUserIds: string[];
  closeDate: Date;
  description: string;
  reminderMinute: number;
  isComplete: boolean;
};

export type EditMutationResponse = ({
  variables: EditMutationVariables
}) => Promise<any>;

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<void>;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export type TaskDetailQueryResponse = {
  taskDetail: ITask;
  loading: boolean;
  refetch: () => void;
};

export type TasksQueryResponse = {
  tasks: ITask[];
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};

export type TasksTotalCountQueryResponse = {
  tasksTotalCount: number;
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};
