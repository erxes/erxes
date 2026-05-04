import { IconCircleFilled } from '@tabler/icons-react';
import { cn, Tooltip } from 'erxes-ui';
import { useConversationProgressChart } from '@/inbox/conversations/conversation-detail/hooks/useConversationProgressChart';
import {
  CONVERSATION_STATUS_TEXT_CLASSES,
  ConversationStatus,
} from '@/inbox/conversations/conversation-detail/constants/conversationStatusColors';

interface ProgressProps {
  customerId: string;
}

export const ProgressDot = ({ status }: { status: ConversationStatus }) => (
  <Tooltip.Provider>
    <Tooltip delayDuration={0}>
      <Tooltip.Trigger>
        <IconCircleFilled
          className={cn('size-2', CONVERSATION_STATUS_TEXT_CLASSES[status])}
        />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p className="capitalize">{status}</p>
      </Tooltip.Content>
    </Tooltip>
  </Tooltip.Provider>
);

const DISPLAY_STATUSES: ConversationStatus[] = ['new', 'open', 'closed', 'resolved'];

export const Progress = ({ customerId }: ProgressProps) => {
  const { conversationProgressChart, loading } = useConversationProgressChart({
    variables: { customerId },
    skip: !customerId,
  });

  const totals = conversationProgressChart?.chartData.reduce(
    (acc, item) => {
      acc.new += item.new || 0;
      acc.open += item.open || 0;
      acc.closed += item.closed || 0;
      acc.resolved += item.resolved || 0;
      return acc;
    },
    { new: 0, open: 0, closed: 0, resolved: 0 },
  ) ?? { new: 0, open: 0, closed: 0, resolved: 0 };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex justify-between w-full my-4 px-2">
      {DISPLAY_STATUSES.map((status) => (
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
