import { Card } from 'erxes-ui';
import { CmsAnalyticsBreakdownItem } from '../types';
import { formatAnalyticsNumber } from '../utils/formatAnalytics';

type AnalyticsBreakdownListProps = {
  items: CmsAnalyticsBreakdownItem[];
  title: string;
};

export const AnalyticsBreakdownList = ({
  items,
  title,
}: AnalyticsBreakdownListProps) => {
  const maxSessions = Math.max(...items.map((item) => item.sessions), 0);

  return (
    <Card className="rounded-lg border shadow-none">
      <Card.Header className="p-4 pb-2">
        <Card.Title className="text-base">{title}</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-3 p-4 pt-0">
        {items.map((item) => {
          const width =
            maxSessions > 0 ? `${Math.max((item.sessions / maxSessions) * 100, 4)}%` : '0%';

          return (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium">
                  {item.name}
                </span>
                <span className="flex-none tabular-nums text-muted-foreground">
                  {formatAnalyticsNumber(item.sessions)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-sm bg-muted">
                <div
                  className="h-full rounded-sm bg-primary"
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </Card.Content>
    </Card>
  );
};
