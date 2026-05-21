import { RecordTable } from 'erxes-ui';
import { useTagsColumns } from './TagsColumn';
import { TagsCommandBar } from './tags-command-bar/TagsCommandBar';
import { useTags } from '../../hooks/useTags';
import { TAGS_CURSOR_SESSION_KEY } from '../constants/tagsCursorSessionKey';

interface TagsRecordTableProps {
  clientPortalId: string;
  onEdit?: (tag: any) => void;
  onBulkDelete?: (ids: string[]) => Promise<void> | void;
}

export const TagsRecordTable = ({
  clientPortalId,
  onEdit,
  onBulkDelete,
}: TagsRecordTableProps) => {
  const { tags, loading, refetch, pageInfo, handleFetchMore } = useTags({
    clientPortalId,
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const columns = useTagsColumns(clientPortalId, onEdit, refetch);

  return (
    <RecordTable.Provider
      columns={columns}
      data={tags || []}
      className="h-full"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={tags?.length}
        sessionKey={TAGS_CURSOR_SESSION_KEY}
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
      {onBulkDelete && <TagsCommandBar onBulkDelete={onBulkDelete} />}
    </RecordTable.Provider>
  );
};
