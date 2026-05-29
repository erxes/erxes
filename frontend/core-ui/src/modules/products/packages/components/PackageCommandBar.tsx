import { IconChevronUp, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Command,
  CommandBar,
  Popover,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import {
  useChangePackageStatus,
  useRemovePackages,
} from '../hooks/usePackageMutations';

export const PackageCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { removePackages, loading: archiving } = useRemovePackages();
  const { changeStatus, loading: statusLoading } = useChangePackageStatus();
  const { confirm } = useConfirm();
  const [statusOpen, setStatusOpen] = useState(false);

  const selectedIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original._id);

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete the ${selectedIds.length} selected package${selectedIds.length === 1 ? '' : 's'}?`,
      options: { confirmationValue: 'delete' },
    }).then(async () => {
      try {
        await removePackages({ variables: { _ids: selectedIds } });
        toast({ variant: 'success', title: 'Packages deleted' });
        table.resetRowSelection();
      } catch (e: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to delete packages',
          description: e?.message,
        });
      }
    });
  };

  const handleChangeStatus = async (status: 'active' | 'draft') => {
    setStatusOpen(false);
    try {
      await changeStatus({ variables: { _ids: selectedIds, status } });
      toast({ variant: 'success', title: `Packages set to ${status}` });
      table.resetRowSelection();
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update status',
        description: e?.message,
      });
    }
  };

  const busy = archiving || statusLoading;

  return (
    <CommandBar open={selectedIds.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedIds.length} selected</CommandBar.Value>
        <Separator.Inline />
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <Popover.Trigger asChild>
            <Button variant="secondary" disabled={busy}>
              <IconChevronUp />
              Status
            </Button>
          </Popover.Trigger>
          <Popover.Content
            className="min-w-[160px] p-0"
            align="center"
            side="top"
            sideOffset={10}
          >
            <Command>
              <Command.List className="p-1">
                <Command.Item onSelect={() => handleChangeStatus('active')}>
                  Set Active
                </Command.Item>
                <Command.Item onSelect={() => handleChangeStatus('draft')}>
                  Set Draft
                </Command.Item>
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          onClick={handleDelete}
          disabled={busy}
        >
          <IconTrash />
          Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
