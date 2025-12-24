import { useGetConversationTagProgress } from '@/inbox/conversations/conversation-detail/hooks/useProgressConversationTag';
import { Button, HoverCard } from 'erxes-ui';
import { SelectTags } from 'ui-modules';
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';

type Status = 'new' | 'open' | 'closed' | 'resolved';

interface TagStats {
  statuses: Record<Status, number>;
}

interface ProgressItem {
  tagId: string;
  count: number;
}

type ConversationTagProgress = {
  [K in Status]: ProgressItem[];
};

export const ProgressTags = ({ customerId }: { customerId: string }) => {
  const { conversationTagProgress = [] } = useGetConversationTagProgress({
    variables: { customerId },
    skip: !customerId,
  });

  const tagsStats = (
    conversationTagProgress as ConversationTagProgress[]
  ).reduce<Record<string, TagStats>>((acc, progress) => {
    (Object.entries(progress) as [Status, ProgressItem[]][]).forEach(
      ([status, items]) => {
        items?.forEach(({ tagId, count }) => {
          if (!acc[tagId]) {
            acc[tagId] = {
              statuses: {
                new: 0,
                open: 0,
                closed: 0,
                resolved: 0,
              },
            };
          }
          acc[tagId].statuses[status] += count;
        });
      },
    );
    return acc;
  }, {});

  const getTotals = (statuses: TagStats['statuses']) => {
    const total = Object.values(statuses).reduce(
      (sum, count) => sum + count,
      0,
    );
    const completed = statuses.closed + statuses.resolved;
    return { total, completed };
  };

  const getProgressPercentage = (statuses: TagStats['statuses']) => {
    const { total, completed } = getTotals(statuses);
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  if (Object.keys(tagsStats).length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No tag data available
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {Object.entries(tagsStats).map(([tagId, { statuses }]) => {
        const { total } = getTotals(statuses);
        const percentage = getProgressPercentage(statuses);

        return (
          <HoverCard key={tagId} openDelay={150} closeDelay={150}>
            <HoverCard.Trigger asChild>
              <Button
                variant="ghost"
                className="w-full h-12 flex items-center justify-between px-3 hover:bg-accent/50"
              >
                <SelectTags tagType="inbox:tag" value={[tagId]} />
                <div className="flex items-center gap-2">
                  <ProgressChart percentage={percentage} />
                  <span className="text-sm text-accent-foreground">
                    {percentage}%
                  </span>
                </div>
              </Button>
            </HoverCard.Trigger>
            <HoverCard.Content
              side="right"
              align="start"
              sideOffset={8}
              className="w-56 p-4 bg-background rounded-lg shadow-lg border"
            >
              <StatusDetails
                statuses={statuses}
                total={total}
                percentage={percentage}
              />
            </HoverCard.Content>
          </HoverCard>
        );
      })}
    </div>
  );
};

const ProgressChart = ({ percentage }: { percentage: number }) => (
  <div className="relative w-6 h-6">
    <RadialBarChart
      width={24}
      height={24}
      cx={12}
      cy={12}
      innerRadius={6}
      outerRadius={10}
      data={[{ value: percentage }]}
      startAngle={90}
      endAngle={-270}
    >
      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
      <RadialBar
        dataKey="value"
        background={{ fill: 'var(--border)' }}
        cornerRadius={10}
        fill="var(--primary)"
      />
    </RadialBarChart>
  </div>
);

interface StatusDetailsProps {
  statuses: TagStats['statuses'];
  total: number;
  percentage: number;
}

const StatusDetails = ({ statuses, total, percentage }: StatusDetailsProps) => (
  <div className="space-y-3">
    {Object.entries(statuses).map(([status, count]) => (
      <div key={status} className="flex justify-between text-sm">
        <span className="text-muted-foreground capitalize">{status}</span>
        <span className="font-medium">{count}</span>
      </div>
    ))}
    <div className="flex justify-between text-sm font-medium border-t pt-2">
      <span>Total</span>
      <span>{total}</span>
    </div>
    <div className="pt-2">
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  </div>
);
