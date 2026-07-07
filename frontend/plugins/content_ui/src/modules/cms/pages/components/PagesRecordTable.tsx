import { IconArticle } from '@tabler/icons-react';
import { RecordTable, useFilterQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePagesColumns } from './PagesColumn';

import { PagesCommandbar } from './pages-command-bar/PagesCommandBar';
import { PAGES_CURSOR_SESSION_KEY } from '../constants/pagesCursorSessionKey';
import { usePages } from '../hooks/usePages';
import { IPage } from '../types/pageTypes';
import { EmptyState } from '../../shared/components/EmptyState';

interface PagesRecordTableProps {
  clientPortalId: string;
  onEditPage?: (page: IPage) => void;
  onAdd?: () => void;
}

export const PagesRecordTable = ({
  clientPortalId,
  onEditPage,
  onAdd,
}: PagesRecordTableProps) => {
  const { t } = useTranslation('content');
  const [searchValue] = useFilterQueryState<string>('searchValue');
  const { pages, loading, refetch, pageInfo, handleFetchMore } = usePages({
    variables: {
      clientPortalId,
    },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const columns = usePagesColumns(onEditPage, refetch, pages);

  if (!loading && (!pages || pages.length === 0)) {
    return (
      <div className="rounded-lg overflow-hidden">
        {searchValue ? (
          <EmptyState icon={IconArticle} title={t('no-pages-found')} />
        ) : (
          <EmptyState
            icon={IconArticle}
            title={t('no-pages-yet')}
            description={t('no-pages-yet-desc')}
            actionLabel={t('add-page')}
            onAction={onAdd}
          />
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden flex-auto p-3">
      <div className="h-full">
        <RecordTable.Provider
          columns={columns}
          data={pages || []}
          className="h-full"
          stickyColumns={['more', 'checkbox', 'name']}
        >
          <RecordTable.CursorProvider
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            dataLength={pages?.length}
            sessionKey={PAGES_CURSOR_SESSION_KEY}
          >
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.CursorBackwardSkeleton
                  handleFetchMore={handleFetchMore}
                />
                {loading && <RecordTable.RowSkeleton rows={40} />}
                <RecordTable.RowList />
                <RecordTable.CursorForwardSkeleton
                  handleFetchMore={handleFetchMore}
                />
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.CursorProvider>
          <PagesCommandbar clientPortalId={clientPortalId} refetch={refetch} />
        </RecordTable.Provider>
      </div>
    </div>
  );
};
