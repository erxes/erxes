import { Button, Skeleton } from 'erxes-ui';
import { dataModelErrorMessage } from '../errorMessage';

export const DataModelLoading = () => (
  <div className="space-y-3 p-6" role="status" aria-label="Loading data models">
    {[0, 1, 2, 3].map((row) => (
      <Skeleton key={row} className="h-10 w-full" />
    ))}
  </div>
);

export const DataModelError = ({
  error,
  onRetry,
}: {
  error: { message: string };
  onRetry: () => void;
}) => (
  <div className="space-y-3 p-6" role="alert">
    <p className="text-sm text-destructive">
      {dataModelErrorMessage(error.message)}
    </p>
    <Button variant="outline" onClick={onRetry}>
      Try again
    </Button>
  </div>
);

export const DataModelPagination = ({
  offset,
  total,
  pageSize,
  onChange,
  disabled,
}: {
  offset: number;
  total: number;
  pageSize: number;
  onChange: (offset: number) => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
    <span className="text-muted-foreground">
      {total === 0
        ? '0 results'
        : `${offset + 1}–${Math.min(offset + pageSize, total)} of ${total}`}
    </span>
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || offset === 0}
        onClick={() => onChange(Math.max(0, offset - pageSize))}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || offset + pageSize >= total}
        onClick={() => onChange(offset + pageSize)}
      >
        Next
      </Button>
    </div>
  </div>
);
