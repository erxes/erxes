import { CellContext } from '@tanstack/react-table';
import {
  RecordTable,
  Button,
  Popover,
  Combobox,
  Command,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useRemoveCustomType } from '../hooks/useRemoveCustomType';

interface CustomTypeMoreColumnCellProps {
  cell: CellContext<any, unknown>;
  onEdit?: (customType: any) => void;
  onRefetch?: () => void;
}

export const CustomTypeMoreColumnCell = ({
  cell,
  onEdit,
  onRefetch,
}: CustomTypeMoreColumnCellProps) => {
  const { _id } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeType, loading } = useRemoveCustomType(onRefetch);

  const handleEdit = () => {
    const customType = cell.row.original;
    if (onEdit) {
      onEdit(customType);
    }
  };

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete this custom type?',
    }).then(() => {
      removeType(_id)
        .then(() => {
          toast({
            title: 'Success',
            variant: 'success',
            description: 'Custom type deleted successfully',
          });
        })
        .catch((e: any) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        });
    });
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content
        align="start"
        className="w-[280px] min-w-0 [&>button]:cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <Command.List>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                onClick={handleEdit}
              >
                <IconEdit className="size-4" />
                Edit
              </Button>
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive h-8"
                onClick={handleDelete}
                disabled={loading}
              >
                <IconTrash className="size-4" />
                Delete
              </Button>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const customTypeMoreColumn = (
  onEdit?: (customType: any) => void,
  onRefetch?: () => void,
) => ({
  id: 'more',
  cell: (cell: CellContext<any, unknown>) => (
    <CustomTypeMoreColumnCell
      cell={cell}
      onEdit={onEdit}
      onRefetch={onRefetch}
    />
  ),
  size: 20,
});
