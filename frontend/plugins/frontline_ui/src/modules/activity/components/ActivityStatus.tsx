import { useActivityListContext } from '@/activity/context/ActivityListContext';
import { IActivity } from '@/activity/types';
import {
  StatusInlineIcon,
  StatusInlineLabel,
} from '@/status/components/StatusInline';
import { ITicket } from '@/ticket/types';
import { Badge } from 'erxes-ui';
import { useGetTicketStatusesByPipeline } from '@/status/hooks/useGetTicketStatus';
import { ITicketStatusChoice } from '@/status/types';

const isTicket = (content: ITicket): content is ITicket => {
  return 'pipelineId' in content;
};

export const ActivityStatus = ({
  metadata,
}: {
  metadata: IActivity['metadata'];
}) => {
  const { previousValue, newValue } = metadata;
  const contentDetail = useActivityListContext();

  const { statuses } = useGetTicketStatusesByPipeline({
    variables: {
      pipelineId: isTicket(contentDetail) ? contentDetail.pipelineId : '',
    },
    skip: !isTicket(contentDetail),
  });

  const getTicketStatus = (value?: string) => {
    return statuses?.find(
      (status: ITicketStatusChoice) => status.value === value,
    );
  };

  const renderStatusBadge = (value?: string) => {
    if (isTicket(contentDetail)) {
      const status = getTicketStatus(value);
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
