import { useTranslation } from 'react-i18next';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { fmtNum } from '../../utils';

export function CallHistoryPager({
  page,
  pageSize,
  totalCount,
  callerCount,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  callerCount: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation('frontline');

  const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3 text-sm text-muted-foreground">
      <span>
        {t('call-history-count', {
          defaultValue: '{{total}} calls from {{callers}} callers',
          total: fmtNum(totalCount),
          callers: fmtNum(callerCount),
        })}
      </span>

      <span className="text-xs">
        {t('showing-range', {
          defaultValue: 'showing {{from}}–{{to}}',
          from,
          to,
        })}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t('previous-page', { defaultValue: 'Previous page' })}
        >
          <IconChevronLeft />
        </Button>

        <span className="font-mono text-xs tabular-nums">
          {page} / {lastPage}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('next-page', { defaultValue: 'Next page' })}
        >
          <IconChevronRight />
        </Button>
      </div>
    </div>
  );
}
