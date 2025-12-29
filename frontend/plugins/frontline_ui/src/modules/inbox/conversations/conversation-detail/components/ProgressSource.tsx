import { useGetConversationSourceProgress } from '@/inbox/conversations/conversation-detail/hooks/useProgressConversationSoure';
import { HoverCard, Button } from 'erxes-ui';
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { IConversationSourceProgress } from '@/inbox/types/Conversation';
import {
  IconPhone,
  IconBrandMessenger,
  IconBrandFacebook,
  IconUser,
} from '@tabler/icons-react';

const sourceIcons: Record<string, React.ReactNode> = {
  call: <IconPhone className="w-4 h-4" />,
  'erxes-messenger': <IconBrandMessenger className="w-4 h-4" />,
  'facebook-messenger': <IconBrandFacebook className="w-4 h-4" />,
  'facebook-post': <IconBrandFacebook className="w-4 h-4" />,
  default: <IconUser className="w-4 h-4" />,
};

const ALL_STATUSES = ['new', 'open', 'closed'];

export const ProgressSource = ({ customerId }: { customerId: string }) => {
  const { conversationSourceProgress } = useGetConversationSourceProgress({
    variables: { customerId },
    skip: !customerId,
  }) as {
    conversationSourceProgress?: IConversationSourceProgress['conversationSourceProgress'];
  };

  if (!conversationSourceProgress?.length) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No conversation source data available
      </div>
    );
  }

  const sourceStats = conversationSourceProgress.reduce((acc, progress) => {
    Object.entries(progress).forEach(([status, items]) => {
      items.forEach(({ source, count }) => {
        if (!acc[source]) {
          acc[source] = { statuses: {} as Record<string, number> };
          ALL_STATUSES.forEach((s) => (acc[source].statuses[s] = 0));
        }
        acc[source].statuses[status] =
          (acc[source].statuses[status] || 0) + count;
      });
    });
    return acc;
  }, {} as Record<string, { statuses: Record<string, number> }>);

  const getTotals = (statuses: Record<string, number>) => {
    const total = Object.values(statuses).reduce((sum, val) => sum + val, 0);
    const completed = (statuses['closed'] || 0) + (statuses['resolved'] || 0);
    return { total, completed };
  };

  return (
    <div className="space-y-2 p-2">
      {Object.entries(sourceStats).map(([source, { statuses }]) => {
        const { total, completed } = getTotals(statuses);
        const percentage =
          total === 0 ? 0 : Math.round((completed / total) * 100);

        const displayName = source
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return (
          <HoverCard key={source} openDelay={150} closeDelay={150}>
            <HoverCard.Trigger asChild>
              <Button
                variant="ghost"
                className="w-full h-12 flex items-center justify-between px-3 hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-accent">
                    {sourceIcons[source] || sourceIcons.default}
                  </div>
                  <span className="text-sm font-medium">{displayName}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8">
                    <RadialBarChart
                      width={24}
                      height={24}
                      cx={12}
                      cy={12}
                      innerRadius={6}
                      outerRadius={10}
                      data={[
                        {
                          name: 'Progress',
                          value: percentage,
                          fill: 'var(--primary)',
                        },
                      ]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        tick={false}
                      />
                      <RadialBar
                        background={{ fill: 'var(--border)' }}
                        dataKey="value"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </div>
                  <span className="text-sm text-accent-foreground">
                    {percentage}% of {total}
                  </span>
                </div>
              </Button>
            </HoverCard.Trigger>

            <HoverCard.Content
              side="right"
              className="w-56 p-4 bg-background rounded-lg shadow-lg border"
              align="start"
              sideOffset={8}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-accent">
                    {sourceIcons[source] || sourceIcons.default}
                  </div>
                  <h4 className="font-medium">{displayName}</h4>
                </div>

                <div className="space-y-2">
                  {ALL_STATUSES.map((status) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span className="font-medium">
                        {statuses[status] || 0}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>{total}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </HoverCard.Content>
          </HoverCard>
        );
      })}
    </div>
  );
};
