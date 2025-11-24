import { ProgressDot } from '@/project/components/details/Progress';
import { useGetProjectProgressByMilestone } from '@/project/hooks/useGetProjectProgressByMilestone';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChartConfig, ChartContainer, HoverCard } from 'erxes-ui';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { z } from 'zod';
import { AddMilestone } from '../milestone/AddMilestone';
import { EditMilestone } from '../milestone/EditMilestone';

const milestoneSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  targetDate: z.date().optional().nullable(),
});

export type FormType = z.infer<typeof milestoneSchema>;

const ProjectMilestone = ({ projectId }: { projectId: string }) => {
  const [activeMilestone, setActiveMilestone] = useState<string | null>(null);

  const form = useForm<FormType>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      name: '',
      targetDate: undefined,
    },
  });

  const { projectProgressByMilestone } = useGetProjectProgressByMilestone({
    variables: { projectId },
    skip: !projectId,
  });

  const getProgress = (item: any) => {
    if (!item.totalScope || item.totalScope === 0) return 0;

    return Math.round(
      ((item.totalCompletedScope + item.totalStartedScope * 0.5) /
        item.totalScope) *
        100,
    );
  };

  const extraContent = (milestone: any) => {
    return (
      <>
        <ChartContainer
          config={chartConfig}
          className="aspect-square size-6 ml-auto"
        >
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
                value: getProgress(milestone),
                fill: 'var(--primary)',
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
              background={{ fill: 'var(--border)' }}
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ChartContainer>
        <span className="text-sm text-accent-foreground">
          {getProgress(milestone)}% of {milestone.totalScope || 0}
        </span>
      </>
    );
  };

  return (
    <FormProvider {...form}>
      <AddMilestone
        projectId={projectId}
        isActive={activeMilestone === ''}
        setActiveMilestone={setActiveMilestone}
      />

      {projectProgressByMilestone?.map((milestone) => (
        <HoverCard openDelay={150} closeDelay={150} key={milestone._id}>
          <HoverCard.Trigger asChild>
            <div>
              <EditMilestone
                projectId={projectId}
                milestone={milestone}
                extraContent={extraContent(milestone)}
                isActive={activeMilestone === milestone._id}
                setActiveMilestone={setActiveMilestone}
              />
            </div>
          </HoverCard.Trigger>

          {activeMilestone !== milestone._id && (
            <HoverCard.Content side="left" className="w-32 p-3">
              <div className="flex flex-col gap-1 text-muted-foreground">
                <p className="text-sm flex items-center gap-1">
                  <ProgressDot status="total" />
                  total:
                  <span className="text-foreground ml-auto">
                    {milestone.totalScope || 0}
                  </span>
                </p>
                <p className="text-sm flex items-center gap-1">
                  <ProgressDot status="completed" />
                  completed:
                  <span className="text-foreground ml-auto">
                    {milestone.totalCompletedScope || 0}
                  </span>
                </p>
                <p className="text-sm flex items-center gap-1">
                  <ProgressDot status="started" />
                  started:
                  <span className="text-foreground ml-auto">
                    {milestone.totalStartedScope || 0}
                  </span>
                </p>
              </div>
            </HoverCard.Content>
          )}
        </HoverCard>
      ))}
    </FormProvider>
  );
};

export default ProjectMilestone;

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  safari: {
    label: 'Done',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;
