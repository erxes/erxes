import { Skeleton } from 'erxes-ui';
import { useConversationOpen } from '../hooks/useConversationOpen';
import { FrontlineCard } from './frontline-card/FrontlineCard';
import { GroupSelect } from './frontline-card/GroupSelect';

interface FrontlineReportOpenProps {
  title: string;
  colSpan?: 1 | 2;
  onColSpanChange?: (span: 1 | 2) => void;
}

export const FrontlineReportOpen = ({
  title,
  colSpan = 2,
  onColSpanChange,
}: FrontlineReportOpenProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const { conversationOpen, loading } = useConversationOpen({
    variables: {
      filters: {
        limit: 10,
      },
    },
  });
  if (loading) return <Skeleton className="w-full h-48" />;

  return (
    <FrontlineCard
      id={id}
      title={title}
      description="Total conversations open in the last 30 days"
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={<GroupSelect />} />
      <FrontlineCard.Content>
        <div className="bg-sidebar w-full rounded-lg"></div>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};
