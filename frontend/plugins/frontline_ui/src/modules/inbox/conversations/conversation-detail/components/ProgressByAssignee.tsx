import { useGetConversationMemberProgress } from '@/inbox/conversations/conversation-detail/hooks/useProgressConversationByMember';
import { IConversationMemberProgress } from '@/inbox/types/Conversation';
import { Button, ChartContainer, HoverCard } from 'erxes-ui';
import { MembersInline } from 'ui-modules';
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { ProgressDot } from '@/inbox/conversations/conversation-detail/components/Progress';

export const ProgressByAssignee = ({ customerId }: { customerId: string }) => {
  const { conversationMemberProgress = [] } = useGetConversationMemberProgress({
    variables: { customerId },
    skip: !customerId,
  });

  const getTotals = ({
    new: newCount,
    open,
    closed,
  }: IConversationMemberProgress) => {
    const total = newCount + open + closed;
    const completed = closed;

    return { total, completed };
  };

  const getProgressPercent = (item: IConversationMemberProgress): number => {
    const { total, completed } = getTotals(item);
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-1">
      {conversationMemberProgress.map((item: IConversationMemberProgress) => {
        const { total, completed } = getTotals(item);
        const progress = getProgressPercent(item);

        return (
          <HoverCard openDelay={150} closeDelay={150} key={item.assigneeId}>
            <HoverCard.Trigger asChild>
              <Button
                className="flex justify-start gap-2 items-center text-sm font-normal h-10 py-1"
                asChild
                variant="ghost"
                size="lg"
              >
                <div className="flex items-center gap-2 w-full">
                  <MembersInline
                    memberIds={[item.assigneeId]}
                    placeholder="No Assignee"
                  />

                  <ChartContainer config={{}} className="aspect-square size-6">
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
                          value: progress,
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
                  </ChartContainer>

                  <span className="text-sm text-accent-foreground">
                    {progress}% of ({completed}/{total})
                  </span>
                </div>
              </Button>
            </HoverCard.Trigger>

            <HoverCard.Content side="left" className="w-40 p-3">
              <div className="flex flex-col gap-1 text-muted-foreground">
                <p className="text-sm flex items-center gap-1">
                  <ProgressDot status="open" />
                  open:
                  <span className="text-foreground ml-auto">{item.open}</span>
                </p>
                <p className="text-sm flex items-center gap-1">
                  <ProgressDot status="new" />
                  new:
                  <span className="text-foreground ml-auto">{item.new}</span>
                </p>

                <p className="text-sm flex items-center gap-1">
                  <ProgressDot status="closed" />
                  closed:
                  <span className="text-foreground ml-auto">{item.closed}</span>
                </p>
              </div>
            </HoverCard.Content>
          </HoverCard>
        );
      })}
    </div>
  );
};
