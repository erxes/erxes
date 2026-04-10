import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, CommandBar, RecordTable, Separator, useConfirm, useToast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { IAssignmentItem } from '../types/assignment';
import { ASSIGNMENTS_REMOVE_MUTATION } from '../graphql/mutations';

const AssignmentRemove = ({
  ids,
  rows,
}: {
  ids: string[];
  rows: Row<IAssignmentItem>[];
}) => {
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const [removeAssignments] = useMutation(ASSIGNMENTS_REMOVE_MUTATION, {
    refetchQueries: ['AssignmentsMain'],
  });

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete ${ids.length} selected assignment(s)?`,
        }).then(async () => {
          try {
            await removeAssignments({ variables: { _ids: ids } });
            rows.forEach((row) => row.toggleSelected(false));
            toast({
              title: 'Success',
              variant: 'success',
              description: `${ids.length} assignment(s) deleted successfully`,
            });
          } catch (e: unknown) {
            toast({
              title: 'Error',
              description: e instanceof Error ? e.message : String(e),
              variant: 'destructive',
            });
          }
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};

export const AssignmentCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows as Row<IAssignmentItem>[];
  const ids = selectedRows.map((row) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <AssignmentRemove ids={ids} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
