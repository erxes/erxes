import { IconCircleFilled } from '@tabler/icons-react';
import { Button, ChartContainer, HoverCard, Tooltip, cn } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';

// The scope counts every progress query returns, for a project, a cycle, or
// one member / team / project within them.
export type TScopeProgress = {
  totalScope: number;
  totalStartedScope: number;
  totalCompletedScope: number;
};

// Started work counts half.
export const getScopeProgressPercent = (item: TScopeProgress) =>
  item.totalScope
    ? Math.round(
        ((item.totalCompletedScope + item.totalStartedScope * 0.5) /
          item.totalScope) *
          100,
      )
    : 0;

export const ProgressDot = ({
  status,
}: {
  status: 'started' | 'completed' | 'total';
}) => (
  <Tooltip.Provider>
    <Tooltip delayDuration={0}>
      <Tooltip.Trigger>
        <IconCircleFilled
          className={cn('size-2', {
            'text-warning': status === 'started',
            'text-success': status === 'completed',
            'text-primary': status === 'total',
          })}
        />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p className="capitalize">{status}</p>
      </Tooltip.Content>
    </Tooltip>
  </Tooltip.Provider>
);

const ProgressSummaryItem = ({
  status,
  label,
  value,
}: {
  status: 'started' | 'completed' | 'total';
  label: string;
  value?: number | null;
}) => (
  <span className="flex flex-col items-center gap-1">
    <span className="flex items-center gap-2">
      <ProgressDot status={status} />
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </span>
    <p className="text-xs font-medium">{value || 0}</p>
  </span>
);

/** Total, started and completed scope side by side. */
export const ProgressSummary = ({
  progress,
}: {
  progress?: Partial<TScopeProgress> | null;
}) => {
  const { t } = useTranslation('operation');

  return (
    <div className="flex justify-between w-full my-4">
      <ProgressSummaryItem
        status="total"
        label={t('total-colon')}
        value={progress?.totalScope}
      />
      <ProgressSummaryItem
        status="started"
        label={t('started-colon')}
        value={progress?.totalStartedScope}
      />
      <ProgressSummaryItem
        status="completed"
        label={t('completed-colon')}
        value={progress?.totalCompletedScope}
      />
    </div>
  );
};

export const ProgressRing = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <ChartContainer config={{}} className={cn('aspect-square size-6', className)}>
    <RadialBarChart
      width={24}
      height={24}
      cx={12}
      cy={12}
      innerRadius={6}
      outerRadius={10}
      data={[{ name: 'Progress', value, fill: 'var(--primary)' }]}
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
);

export const ProgressPercentLabel = ({ item }: { item: TScopeProgress }) => (
  <span className="text-sm text-accent-foreground">
    {getScopeProgressPercent(item)}% of {item.totalScope}
  </span>
);

/** The hover card body of a breakdown row: each count on its own line. */
export const ProgressBreakdownDetails = ({
  item,
}: {
  item: TScopeProgress;
}) => {
  const { t } = useTranslation('operation');

  return (
    <HoverCard.Content side="left" className="w-32 p-3">
      <div className="flex flex-col gap-1 text-muted-foreground">
        <p className="text-sm flex items-center gap-1">
          <ProgressDot status="total" />
          {t('total')}
          <span className="text-foreground ml-auto">{item.totalScope}</span>
        </p>
        <p className="text-sm flex items-center gap-1">
          <ProgressDot status="completed" />
          {t('completed-label')}
          <span className="text-foreground ml-auto">
            {item.totalCompletedScope}
          </span>
        </p>
        <p className="text-sm flex items-center gap-1">
          <ProgressDot status="started" />
          {t('started-label')}
          <span className="text-foreground ml-auto">
            {item.totalStartedScope}
          </span>
        </p>
      </div>
    </HoverCard.Content>
  );
};

/** One member / team / project line: its label, a ring and the percent. */
export const ProgressBreakdownRow = ({
  label,
  item,
  ringClassName,
}: {
  label: ReactNode;
  item: TScopeProgress;
  ringClassName?: string;
}) => (
  <HoverCard openDelay={150} closeDelay={150}>
    <HoverCard.Trigger asChild>
      <Button
        className="flex justify-start gap-2 items-center text-sm font-normal h-10 py-1"
        asChild
        variant="ghost"
        size="lg"
      >
        <div>
          {label}
          <ProgressRing
            value={getScopeProgressPercent(item)}
            className={ringClassName}
          />
          <ProgressPercentLabel item={item} />
        </div>
      </Button>
    </HoverCard.Trigger>
    <ProgressBreakdownDetails item={item} />
  </HoverCard>
);
