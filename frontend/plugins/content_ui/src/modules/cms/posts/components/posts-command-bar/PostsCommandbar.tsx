import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { PostsDelete } from './delete/RemovePosts';

export const PostsCommandbar = ({ refetch }: { refetch?: () => void }) => {
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <PostsDelete
          postsIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id)}
          rows={table.getFilteredSelectedRowModel().rows}
          onRefetch={refetch}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
