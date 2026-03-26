import { memo, useMemo, useState, useCallback } from 'react';
import { Button } from 'erxes-ui';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

const DEFAULT_PAGE_SIZE = 10;

export function useChartPagination<T>(data: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const handlePrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const handleNext = useCallback(() => setPage((p) => Math.min(totalPages, p + 1)), [totalPages]);

  const reset = useCallback(() => setPage(1), []);

  return {
    pagedData,
    page: safePage,
    totalPages,
    totalCount: data.length,
    handlePrev,
    handleNext,
    reset,
    hasMultiplePages: totalPages > 1,
  };
}

export const ChartPagination = memo(function ChartPagination({
  page,
  totalPages,
  totalCount,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t">
      <span className="text-xs text-muted-foreground">{totalCount} items</span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1}>
          <IconChevronLeft className="size-4" />
        </Button>
        <span className="text-xs text-muted-foreground px-2">
          {page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages}>
          <IconChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
});
