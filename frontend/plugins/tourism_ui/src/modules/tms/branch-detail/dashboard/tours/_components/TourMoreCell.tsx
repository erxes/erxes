import { useState } from 'react';
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
import { TourDuplicateSheet } from './TourDuplicateSheet';

interface TourMoreCellProps extends CellContext<ITour, unknown> {
  onEdit?: (tourId: string) => void;
  branchId?: string;
}

export const TourMoreColumn = ({
  onEdit,
  branchId,
  ...props
}: TourMoreCellProps) => {
  const tour = props.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeTours } = useRemoveTours();
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  const handleDuplicate = () => {
    setDuplicateOpen(true);
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
    <>
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
      <TourDuplicateSheet
        tourId={tour._id}
        dateType={tour.dateType}
        branchId={branchId}
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
      />
    </>
  );
};

export const tourMoreColumn = (
  onEdit?: (tourId: string) => void,
  branchId?: string,
): ColumnDef<ITour> => ({
  id: 'more',
  cell: (props) => (
    <TourMoreColumn {...props} onEdit={onEdit} branchId={branchId} />
  ),
  size: 33,
});
