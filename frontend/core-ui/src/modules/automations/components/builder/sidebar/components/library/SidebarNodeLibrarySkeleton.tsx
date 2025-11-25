import { Card, Skeleton } from 'erxes-ui';

export const LoadingSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <LoadingRow key={index} />
      ))}
    </div>
  );
};

const LoadingRow = () => {
  return (
    <Card className="flex flex-col  gap-2 space-x-4 border rounded-xl p-3 cursor-wait">
      <Card.Title className="flex flex-row w-full items-center gap-3">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-4 w-2/3" />
      </Card.Title>
      <Card.Description>
        <Skeleton className="h-4 w-4/5" />
      </Card.Description>
    </Card>
  );
};
