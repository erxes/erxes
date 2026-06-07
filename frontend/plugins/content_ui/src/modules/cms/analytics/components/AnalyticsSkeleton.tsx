import { Card, Skeleton } from 'erxes-ui';

const ANALYTICS_SKELETON_CARD_KEYS = [
  'active-users',
  'new-users',
  'sessions',
  'views',
  'engagement-time',
  'engagement-rate',
];

export const AnalyticsSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ANALYTICS_SKELETON_CARD_KEYS.map((key) => (
          <Card key={key} className="rounded-lg border shadow-none">
            <Card.Content className="space-y-3 p-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-36" />
            </Card.Content>
          </Card>
        ))}
      </div>
      <Card className="rounded-lg border shadow-none">
        <Card.Content className="p-4">
          <Skeleton className="h-72 w-full" />
        </Card.Content>
      </Card>
    </div>
  );
};
