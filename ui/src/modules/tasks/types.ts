import { IItem } from 'modules/boards/types';
import { IActivityLogForMonth } from '../activityLogs/types';

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
  taskDetail: IItem;
  loading: boolean;
  refetch: () => void;
};
