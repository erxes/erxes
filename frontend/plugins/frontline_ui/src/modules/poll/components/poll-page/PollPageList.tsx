import { IconChartBar } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { Empty, RecordTable, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PollCommandBar } from '@/poll/components/poll-page/command-bar/poll-command-bar';
import { pollColumns } from '@/poll/components/poll-page/poll-columns';
import { PollsCreateButton } from '@/poll/components/poll-page/polls-create';
import { usePollList } from '@/poll/hooks/usePollList';
import { IPoll } from '@/poll/types/pollTypes';

export const PollPageList = ({ channelId }: { channelId?: string }) => {
  const { t } = useTranslation('frontline');
  const [{ status, searchValue }] = useMultiQueryState<{
    status?: string;
    searchValue?: string;
  }>(['status', 'searchValue']);

  const { polls, loading, handleFetchMore, pageInfo } = usePollList({
    variables: {
      status: status || undefined,
      searchValue: searchValue || undefined,
      channelId,
    },
  });

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (!loading && polls?.length === 0) {
    return (
      <Empty className="bg-sidebar rounded-lg m-3">
        <Empty.Header>
          <Empty.Media>
            <IconChartBar />
          </Empty.Media>
          <Empty.Title>{t('no-polls-found')}</Empty.Title>
          <Empty.Description>{t('polls-empty-description')}</Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <PollsCreateButton variant="outline" />
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={pollColumns as unknown as ColumnDef<IPoll>[]}
      data={polls || []}
      className="m-3"
      tableId="frontline_polls_record_table"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={polls?.length}
        sessionKey="polls_cursor"
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <PollCommandBar />
    </RecordTable.Provider>
  );
};
