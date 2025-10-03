import { useGetProjectProgressByMember } from '@/project/hooks/useGetProjectProgressByMember';
import { Button, ChartContainer, HoverCard } from 'erxes-ui';
import { MembersInline } from 'ui-modules';

import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { IProjectProgressByMember } from '@/project/types';
import { ProgressDot } from '@/project/components/details/Progress';

export const ProgressByMember = ({ projectId }: { projectId: string }) => {
  const { projectProgressByMember } = useGetProjectProgressByMember({
    variables: { _id: projectId },
    skip: !projectId,
  });

  const getProgress = (item: IProjectProgressByMember) => {
    return Math.round(
      ((item.totalCompletedScope + item.totalStartedScope * 0.5) /
        item.totalScope) *
        100,
    );
  };

  return (
    <div className="space-y-1">
      {projectProgressByMember?.map((item) => (
        <HoverCard openDelay={150} closeDelay={150} key={item.assigneeId}>
          <HoverCard.Trigger asChild>
            <Button
              className="flex justify-start gap-2 items-center text-sm font-normal h-10 py-1"
              asChild
              variant="ghost"
              size="lg"
            >
              <div>
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
                        value: getProgress(item),
                        fill: 'hsl(var(--primary))',
                      },
                    ]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background={{ fill: 'hsl(var(--border))' }}
                      dataKey="value"
                      cornerRadius={10}
                    />
                  </RadialBarChart>
                </ChartContainer>
                <span className="text-sm text-accent-foreground">
                  {getProgress(item)}% of {item.totalScope}
                </span>
              </div>
            </Button>
          </HoverCard.Trigger>
          <HoverCard.Content side="left" className="w-32 p-3">
            <div className="flex flex-col gap-1 text-muted-foreground">
              <p className="text-sm flex items-center gap-1">
                <ProgressDot status="total" />
                total:
                <span className="text-foreground ml-auto">
                  {item.totalScope}
                </span>
              </p>
              <p className="text-sm flex items-center gap-1 ">
                <ProgressDot status="completed" />
                completed:
                <span className="text-foreground ml-auto">
                  {item.totalCompletedScope}
                </span>
              </p>
              <p className="text-sm flex items-center gap-1 ">
                <ProgressDot status="started" />
                started:
                <span className="text-foreground ml-auto">
                  {item.totalStartedScope}
                </span>
              </p>
            </div>
          </HoverCard.Content>
        </HoverCard>
      ))}
    </div>
  );
};
