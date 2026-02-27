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
import { useNavigate } from 'react-router-dom';
import { useRemovePage } from '../hooks/useRemovePage';
import { ApolloError } from '@apollo/client';

interface PageMoreColumnCellProps {
  cell: CellContext<any, unknown>;
  onEdit?: (page: any) => void;
  onDelete?: (pageId: string) => void;
  onRefetch?: () => void;
}

export const PageMoreColumnCell = ({
  cell,
  onEdit,
  onDelete,
  onRefetch,
}: PageMoreColumnCellProps) => {
  const { _id } = cell.row.original;
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removePage, loading } = useRemovePage();

  const handleEdit = () => {
    const page = cell.row.original;
    if (onEdit) {
      onEdit(page);
    } else {
      navigate(`/content/cms/pages/edit/${_id}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(_id);
    } else {
      confirm({
        message: 'Are you sure you want to delete this page?',
      }).then(() => {
        removePage(_id)
          .then(() => {
            toast({
              title: 'Success',
              variant: 'success',
              description: 'Page deleted successfully',
            });
            onRefetch?.();
          })
          .catch((e: ApolloError) => {
            toast({
              title: 'Error',
              description: e.message,
              variant: 'destructive',
            });
          });
      });
    }
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

export const pageMoreColumn = (
  onEdit?: (page: any) => void,
  onDelete?: (pageId: string) => void,
  onRefetch?: () => void,
) => ({
  id: 'more',
  cell: (cell: CellContext<any, unknown>) => (
    <PageMoreColumnCell
      cell={cell}
      onEdit={onEdit}
      onDelete={onDelete}
      onRefetch={onRefetch}
    />
  ),
  size: 20,
});
