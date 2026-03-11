import { RecordTable } from 'erxes-ui';
import { createTagsColumns } from './TagsColumn';
import { TagsCommandBar } from './tags-command-bar/TagsCommandBar';
import { useTags } from '../../hooks/useTags';

interface TagsRecordTableProps {
  clientPortalId: string;
  onEdit?: (tag: any) => void;
  onRemove?: (tagId: string) => void;
  onBulkDelete?: (ids: string[]) => Promise<void> | void;
}

export const TagsRecordTable = ({
  clientPortalId,
  onEdit,
  onRemove,
  onBulkDelete,
}: TagsRecordTableProps) => {
  const { tags, loading, refetch } = useTags({
    clientPortalId,
  });

  const columns = createTagsColumns(
    clientPortalId,
    onEdit || (() => {}),
    refetch,
  );

  return (
    <RecordTable.Provider
      columns={columns}
      data={tags || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          {loading && <RecordTable.RowSkeleton rows={40} />}
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
      {onBulkDelete && <TagsCommandBar onBulkDelete={onBulkDelete} />}
    </RecordTable.Provider>
  );
};
