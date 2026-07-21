import { IconArchive } from '@tabler/icons-react';
import {
  Label,
  PageSubHeader,
  RecordTable,
  Skeleton,
  ToggleGroup,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPROVAL_REQUESTS_CURSOR_SESSION_KEY,
  ApprovalRequestStatusFilter,
  useApprovalRequests,
} from '../hooks/useApprovalRequests';
import { approvalRequestColumns } from './ApprovalRequestColumns';

const statusFilters: ApprovalRequestStatusFilter[] = [
  'all',
  'pending',
  'approved',
  'rejected',
  'cancelled',
];

export const ApprovalRequestsRecordTable = () => {
  const { t } = useTranslation('approval');
  const [status, setStatus] = useState<ApprovalRequestStatusFilter>('pending');
  const {
    list,
    totalCount,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
    refetch,
  } = useApprovalRequests({ status });
  const columns = useMemo(
    () =>
      approvalRequestColumns({
        t,
        onCompleted: () => refetch(),
      }),
    [refetch, t],
  );
  const isEmpty = !loading && !error && totalCount === 0;

  return (
    <div className="flex h-full flex-col pt-0">
      <PageSubHeader>
        <ToggleGroup
          type="single"
          value={status}
          onValueChange={(value) =>
            value && setStatus(value as ApprovalRequestStatusFilter)
          }
          variant="outline"
          className="h-8"
        >
          {statusFilters.map((filter) => (
            <ToggleGroup.Item key={filter} value={filter}>
              {t(`status-filter-${filter}`)}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
        <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground ml-auto">
          {loading && !totalCount ? (
            <Skeleton className="mt-1.5 inline-block h-4 w-20" />
          ) : (
            t('requests-found', '{{count}} requests found', { count: totalCount })
          )}
        </div>
      </PageSubHeader>

      <RecordTable.Provider
        columns={columns}
        data={list}
        className="m-3"
        stickyColumns={['details']}
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={list.length}
          sessionKey={APPROVAL_REQUESTS_CURSOR_SESSION_KEY}
        >
          <RecordTable className="w-full">
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.CursorBackwardSkeleton
                handleFetchMore={handleFetchMore}
              />
              {loading && <RecordTable.RowSkeleton rows={20} />}
              {error && (
                <tr>
                  <td colSpan={columns.length} className="py-10 text-center">
                    <div className="text-sm text-destructive">
                      {error.message}
                    </div>
                  </td>
                </tr>
              )}
              <RecordTable.RowList />
              <RecordTable.CursorForwardSkeleton
                handleFetchMore={handleFetchMore}
              />
              {isEmpty && (
                <tr className="h-[60vh]">
                  <td colSpan={columns.length} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <IconArchive className="mb-2 size-8" />
                      <Label>{t('no-requests', 'No approval requests')}</Label>
                    </div>
                  </td>
                </tr>
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </div>
  );
};
