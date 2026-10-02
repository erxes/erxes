import { useActivityListContext } from '@/activity/context/ActivityListContext';
import { IActivity } from '@/activity/types';
import { ITaskDetail } from '@/task/types';
import { IProject } from '@/project/types';
import { ITriageDetail } from '@/triage/types/triage';
import { useGetStatusByTeam } from '@/task/hooks/useGetStatusByTeam';
import { Badge } from 'erxes-ui';
import {
  StatusInlineIcon,
  StatusInlineLabel,
} from '@/operation/components/StatusInline';
import { useTranslation } from 'react-i18next';

const isTask = (
  content: ITaskDetail | IProject | ITriageDetail,
): content is ITaskDetail => {
  return (
    'teamId' in content &&
    'status' in content &&
    typeof content.status === 'string'
  );
};

export const ActivityStatus = ({
  metadata,
}: {
  metadata: IActivity['metadata'];
}) => {
  const { t } = useTranslation('operation');
  const { previousValue, newValue } = metadata ?? {};
  const contentDetail = useActivityListContext();

  const { statuses } = useGetStatusByTeam({
    variables:
      isTask(contentDetail) && contentDetail.teamId
        ? { teamId: contentDetail.teamId }
        : undefined,
    skip: !isTask(contentDetail) || !contentDetail.teamId,
  });

  const getTaskStatus = (value?: string | null) => {
    return statuses?.find((status) => status.value === value);
  };

  const renderStatusBadge = (value?: string | null) => {
    if (isTask(contentDetail)) {
      const status = getTaskStatus(value);
      return (
        <Badge variant="secondary" className="capitalize">
          <StatusInlineIcon
            statusType={status?.type}
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
      {t('changed-status')}
      {renderStatusBadge(previousValue)}
      {t('to')}
      {renderStatusBadge(newValue)}
    </div>
  );
};
