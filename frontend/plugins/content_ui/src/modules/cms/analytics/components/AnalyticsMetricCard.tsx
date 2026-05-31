import { Card } from 'erxes-ui';
import { ComponentType } from 'react';

type AnalyticsMetricCardProps = {
  description?: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

export const AnalyticsMetricCard = ({
  description,
  icon: Icon,
  label,
  value,
}: AnalyticsMetricCardProps) => {
  return (
    <Card className="rounded-lg border shadow-none">
      <Card.Content className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">
              {value}
            </div>
            {description ? (
              <div className="mt-1 truncate text-xs text-muted-foreground">
                {description}
              </div>
            ) : null}
          </div>
          <div className="flex size-9 flex-none items-center justify-center rounded-md bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};
