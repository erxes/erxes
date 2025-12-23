import { IconCircleFilled } from '@tabler/icons-react';
import { cn, Tooltip } from 'erxes-ui';
import { useGetConversationMemberProgress } from '@/inbox/conversations/conversation-detail/hooks/useProgressConversationByMember';

interface ProgressProps {
  customerId: string;
}

type StatusType = 'new' | 'open' | 'closed' | 'resolved';

export const ProgressDot = ({ status }: { status: StatusType }) => {
  const colorClass = {
    new: 'text-muted-foreground',
    open: 'text-warning',
    closed: 'text-primary',
    resolved: 'text-success',
  }[status];

  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger>
          <IconCircleFilled className={cn('size-2', colorClass)} />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p className="capitalize">{status}</p>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const Progress = ({ customerId }: ProgressProps) => {
  const { conversationMemberProgress, loading } =
    useGetConversationMemberProgress({
      variables: { customerId },
      skip: !customerId,
    });

  const totals = conversationMemberProgress?.reduce(
    (acc, item) => {
      acc.new += item.new || 0;
      acc.open += item.open || 0;
      acc.closed += item.closed || 0;
      acc.resolved += item.resolved || 0;
      return acc;
    },
    { new: 0, open: 0, closed: 0, resolved: 0 },
  ) || { new: 0, open: 0, closed: 0, resolved: 0 };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex justify-between w-full my-4 px-2">
      {(['new', 'open', 'closed', 'resolved'] as StatusType[]).map((status) => (
        <span key={status} className="flex flex-col items-center gap-1">
          <span className="flex items-center gap-2">
            <ProgressDot status={status} />
            <p className="text-xs font-medium text-muted-foreground capitalize">
              {status}:
            </p>
          </span>
          <p className="text-xs font-medium">{totals[status]}</p>
        </span>
      ))}
    </div>
  );
};
