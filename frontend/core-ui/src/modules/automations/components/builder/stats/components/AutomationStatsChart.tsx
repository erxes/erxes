import { TAutomationStatsBucket } from '@/automations/types';
import { ChartContainer, ChartTooltipContent } from 'erxes-ui';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

// Status colours follow STATUSES_BADGE_VARIABLES so the chart and the badges
// tell the same story.
const CHART_CONFIG = {
  complete: { label: 'Complete', color: 'var(--success)' },
  error: { label: 'Error', color: 'var(--destructive)' },
  waiting: { label: 'Waiting', color: 'var(--warning)' },
};

export const AutomationStatsChart = ({
  timeSeries,
}: {
  timeSeries: TAutomationStatsBucket[];
}) => {
  if (!timeSeries.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border bg-background text-sm text-muted-foreground">
        No runs in this range
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background p-4">
      <span className="text-xs font-medium text-muted-foreground">
        Runs per day
      </span>
      <ChartContainer config={CHART_CONFIG} className="mt-2 h-72 w-full">
        <BarChart data={timeSeries} margin={{ top: 8, right: 8, left: -16 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="complete"
            stackId="runs"
            fill="var(--success)"
            name="Complete"
          />
          <Bar
            dataKey="waiting"
            stackId="runs"
            fill="var(--warning)"
            name="Waiting"
          />
          <Bar
            dataKey="error"
            stackId="runs"
            fill="var(--destructive)"
            name="Error"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
