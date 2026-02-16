import { IconArchive, IconChartPie, IconInfoCircle } from '@tabler/icons-react';
import {
  Label,
  PageSubHeader,
  RecordTable,
  Skeleton,
  Breadcrumb,
  Button,
  Separator,
  Tooltip,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';

import { LOGS_CURSOR_SESSION_KEY } from '../constants/logFilter';
import { useLogs } from '../hooks/useLogs';
import { logColumns } from './LogColumns';
import { LogsRecordTableFilter } from './filters/LogsRecordTableFilter';
import { LogDetailSheet } from '@/logs/components/LogDetailSheet';
import { Link } from 'react-router';

export const LogsRecordTable = () => {
  const guideUrl =
    'https://erxes.io/guides/68ef769c1a9ddbd30aec6c35/6992b26b5cac46b2ff76b1c6';
  const {
    loading,
    totalCount,
    list,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
  } = useLogs();

  return (
    <div className="flex flex-col h-full pt-0">
      <LogDetailSheet />
      <PageHeader className="p-3 mx-0" separatorClassName="mb-0">
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost">
                  <IconChartPie className="w-5 h-5" />
                  System Logs
                </Button>
              </Breadcrumb.Item>
              <Tooltip>
                <Tooltip.Trigger>
                  <Link to={guideUrl} target="_blank">
                    <IconInfoCircle className="size-4 text-accent-foreground" />
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>View audit trails and system activity history</p>
                </Tooltip.Content>
              </Tooltip>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
      </PageHeader>
      <PageSubHeader>
        <LogsRecordTableFilter />
        <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
          {totalCount
            ? `${totalCount} records found`
            : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
        </div>
      </PageSubHeader>
      <RecordTable.Provider
        columns={logColumns}
        data={list}
        stickyColumns={['detail']}
        className="m-3"
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={list?.length}
          sessionKey={LOGS_CURSOR_SESSION_KEY}
        >
          <RecordTable className="w-full">
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.CursorBackwardSkeleton
                handleFetchMore={handleFetchMore}
              />
              {loading && <RecordTable.RowSkeleton rows={40} />}
              {!totalCount && !loading && (
                <tr className="h-[80vh]">
                  <td colSpan={6} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <IconArchive className="w-8 h-8 mb-2" />
                      <Label>No results</Label>
                    </div>
                  </td>
                </tr>
              )}

              <RecordTable.RowList />
              <RecordTable.CursorForwardSkeleton
                handleFetchMore={handleFetchMore}
              />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </div>
  );
};
