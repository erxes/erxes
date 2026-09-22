import { useTagsColumns } from '@/settings/tags/components/TagsColumns';
import { TagsCommandBar } from '@/settings/tags/components/TagsCommandBar';
import { useTagsView } from '@/settings/tags/hooks/useTagsView';
import { IconTagsOff } from '@tabler/icons-react';
import { RecordTable, RecordTableTree } from 'erxes-ui';

export const TagsRecordTable = () => {
  const columns = useTagsColumns();
  const { rows, loading } = useTagsView();

  if (!loading && rows.length === 0) {
    return (
      <div className="m-3 flex h-full flex-col items-center justify-center rounded-lg border border-dashed bg-sidebar p-8 text-center">
        <IconTagsOff className="mb-4 size-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No tags yet</h3>
        <p className="text-sm text-muted-foreground">
          Create a group or tag to organize your workspace.
        </p>
      </div>
    );
  }

  return (
    <RecordTable.Provider
      data={rows}
      columns={columns}
      stickyColumns={['more', 'checkbox', 'name']}
      className="m-3 h-full"
      tableId="settings-tags"
    >
      <RecordTableTree id="settings-tags-tree" ordered length={rows.length}>
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList Row={RecordTableTree.Row} />
              {loading && <RecordTable.RowSkeleton rows={20} />}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTableTree>
      <TagsCommandBar />
    </RecordTable.Provider>
  );
};
