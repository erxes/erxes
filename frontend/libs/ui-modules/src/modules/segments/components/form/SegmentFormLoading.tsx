import { Spinner } from 'erxes-ui';

export function SegmentFormLoading() {
  return (
    <div
      className="flex items-center justify-center h-full min-h-[400px]"
      role="status"
      aria-label="Loading segment form"
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
