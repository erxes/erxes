import { CellContext, ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconTrash, IconCopy } from '@tabler/icons-react';
import {
  RecordTable,
  Combobox,
  Popover,
  Command,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { ITour } from '../types/tour';
import { useRemoveTours } from '../hooks/useRemoveTours';

interface TourMoreCellProps extends CellContext<ITour, unknown> {
  onEdit?: (tourId: string) => void;
  onDuplicate?: (tourId: string, dateType?: 'fixed' | 'flexible') => void;
}

export const TourMoreColumn = ({
  onEdit,
  onDuplicate,
  ...props
}: TourMoreCellProps) => {
  const tour = props.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeTours } = useRemoveTours();

  const handleDuplicate = () => {
    onDuplicate?.(tour._id, tour.dateType);
  };

  const handleEdit = () => {
    onEdit?.(tour._id);
  };

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete this tour?',
      options: { confirmationValue: 'delete' },
    }).then(() => {
      removeTours({
        variables: { ids: [tour._id] },
        onCompleted: () => {
          toast({
            title: 'Success',
            variant: 'success',
            description: 'Tour deleted successfully',
          });
        },
        onError: (e) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    });
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit className="w-4 h-4" />
              Edit
            </Command.Item>
            <Command.Item value="duplicate" onSelect={handleDuplicate}>
              <IconCopy className="w-4 h-4" />
              Duplicate
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash className="w-4 h-4" />
              Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const tourMoreColumn = (
  onEdit?: (tourId: string) => void,
  onDuplicate?: (tourId: string, dateType?: 'fixed' | 'flexible') => void,
): ColumnDef<ITour> => ({
  id: 'more',
  cell: (props) => (
    <TourMoreColumn {...props} onEdit={onEdit} onDuplicate={onDuplicate} />
  ),
  size: 33,
});
