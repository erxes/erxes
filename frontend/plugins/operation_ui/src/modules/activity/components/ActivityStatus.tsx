import { useActivityListContext } from '@/activity/context/ActivityListContext';
import { IActivity } from '@/activity/types';
import { ITask } from '@/task/types';
import { IProject } from '@/project/types';
import { useGetStatusByTeam } from '@/task/hooks/useGetStatusByTeam';
import { Badge } from 'erxes-ui';
import {
  StatusInlineIcon,
  StatusInlineLabel,
} from '@/operation/components/StatusInline';

const isTask = (content: ITask | IProject): content is ITask => {
  return 'teamId' in content;
};

export const ActivityStatus = ({
  metadata,
}: {
  metadata: IActivity['metadata'];
}) => {
  const { previousValue, newValue } = metadata;
  const contentDetail = useActivityListContext();

  const { statuses } = useGetStatusByTeam({
    variables: { teamId: isTask(contentDetail) ? contentDetail.teamId : '' },
    skip: !isTask(contentDetail),
  });

  const getTaskStatus = (value?: string) => {
    return statuses?.find((status) => status.value === value);
  };

  const renderStatusBadge = (value?: string) => {
    if (isTask(contentDetail)) {
      const status = getTaskStatus(value);
      return (
        <Badge variant="secondary" className="capitalize">
          <StatusInlineIcon
            statusType={status?.type as number}
            color={status?.color}
          />
          {status?.label}
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="capitalize">
          <StatusInlineIcon statusType={value} />
          <StatusInlineLabel statusType={value} />
        </Badge>
      );
    }
  };

  return (
    <div className="flex items-center gap-1">
      changed status
      {renderStatusBadge(previousValue)}
      to
      {renderStatusBadge(newValue)}
    </div>
  );
};
