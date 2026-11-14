import type { UseQueryResult } from '@tanstack/react-query';
import { Button, cn, Spinner } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '~/lib/api';

type QueryStateProps<T> = {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  /** True when the loaded data has nothing to show. */
  isEmpty?: (data: T) => boolean;
  /** Shown when `isEmpty` says so. */
  empty?: ReactNode;
  /** Shown while loading; a spinner by default. */
  loading?: ReactNode;
  className?: string;
};

/**
 * Loading, failure and empty for one query, the same way everywhere. A failed
 * request shows its error with a retry, never an empty list.
 */
export const QueryState = <T,>({
  query,
  children,
  isEmpty,
  empty,
  loading,
  className,
}: QueryStateProps<T>) => {
  const { t } = useTranslation('common', { keyPrefix: 'query-state' });

  if (query.isPending) {
    return (
      loading ?? (
        <div className={cn('flex justify-center p-6', className)}>
          <Spinner />
        </div>
      )
    );
  }

  if (query.isError) {
    return (
      <div
        role="alert"
        className={cn('flex flex-col items-center gap-2 p-6 text-center text-sm', className)}
      >
        <p className="text-destructive">{messageOf(query.error)}</p>
        <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (isEmpty?.(query.data)) return empty ?? null;

  return children(query.data);
};
