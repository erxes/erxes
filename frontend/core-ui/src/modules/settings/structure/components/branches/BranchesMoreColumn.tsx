import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { IconEdit, IconClock, IconTrash } from '@tabler/icons-react';
import { Can } from 'ui-modules';
import {
    Combobox,
    Command,
    Popover,
    RecordTable,
    toast,
    useConfirm,
    useQueryState,
} from 'erxes-ui';
import { IBranchListItem } from '../../types/branch';
import { renderingBranchDetailAtom } from '../../states/renderingBranchDetail';
import { useRemoveBranch } from '../../hooks/useBranchActions';

export const BranchesMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IBranchListItem, unknown>;
}) => {
  const { _id, title } = cell.row.original;
  const [, setOpenBranch] = useQueryState('branch_id');
  const [, setOpenWorkingHours] = useQueryState('workingHoursId');
  const setRenderingBranchDetail = useSetAtom(renderingBranchDetailAtom);
  const { confirm } = useConfirm();
  const { handleRemove } = useRemoveBranch();

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete "${title}"?`,
    }).then(async () => {
      try {
        await handleRemove({ variables: { ids: [_id] } });
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };
  return (
    <Popover>
      <Can actions={['branchesManage']}>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command>
          <Command.List>
            <Can action="branchesManage">
              <Command.Item
                value="edit"
                onSelect={() => {
                  setOpenBranch(_id);
                  setRenderingBranchDetail(false);
                }}
              >
                <IconEdit /> Edit
              </Command.Item>
            </Can>
            <Can action="branchesManage">
              <Command.Item
                value="workingHours"
                onSelect={() => {
                  setOpenWorkingHours(_id);
                  setRenderingBranchDetail(false);
                }}
              >
                <IconClock /> Working Hours
              </Command.Item>
            </Can>
            <Can action="branchesManage">
              <Command.Item value="delete" onSelect={handleDelete}>
                <IconTrash /> Delete
              </Command.Item>
            </Can>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const BranchesMoreColumn = {
  id: 'more',
  cell: BranchesMoreColumnCell,
  size: 25,
};
