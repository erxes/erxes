import { Spinner } from 'erxes-ui';

export function ActivityLogLoading() {
  return (
    <div
      className="flex items-center justify-center h-full min-h-[200px]"
      role="status"
      aria-label="Loading activity logs"
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-sm text-muted-foreground">
          Loading activity logs...
        </p>
      </div>
    </div>
  );
}
