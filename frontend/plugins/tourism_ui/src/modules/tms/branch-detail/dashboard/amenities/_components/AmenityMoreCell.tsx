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
import { IAmenity } from '../types/amenity';
import { useRemoveAmenities } from '../hooks/useRemoveAmenities';
import { AmenityEditSheet } from './AmenityEditSheet';
import { AmenityDuplicate } from './AmenityDuplicate';

interface AmenityMoreCellProps extends CellContext<IAmenity, unknown> {
  branchId?: string;
}

export const AmenityMoreColumn = ({
  branchId,
  ...props
}: AmenityMoreCellProps) => {
  const amenity = props.row.original;
  const [editOpen, setEditOpen] = useState(false);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const removeAmenities = useRemoveAmenities();

  const handleEdit = () => {
    setEditOpen(true);
  };

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete this amenity?',
      options: { confirmationValue: 'delete' },
    })
      .then(() => {
        removeAmenities({ variables: { ids: [amenity._id] } })
          .then(() => {
            toast({
              title: 'Success',
              variant: 'success',
              description: 'Amenity deleted successfully',
            });
          })
          .catch((e: any) => {
            toast({
              title: 'Error',
              description: e.message,
              variant: 'destructive',
            });
          });
      })
      .catch((e: unknown) => {
        if (e instanceof Error) {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        }
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
              <AmenityDuplicate amenity={amenity} branchId={branchId}>
                {({ onClick, disabled }) => (
                  <Command.Item
                    value="duplicate"
                    onSelect={onClick}
                    disabled={disabled}
                  >
                    <IconCopy className="w-4 h-4" />
                    Duplicate
                  </Command.Item>
                )}
              </AmenityDuplicate>
              <Command.Item value="delete" onSelect={handleDelete}>
                <IconTrash className="w-4 h-4" />
                Delete
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <AmenityEditSheet
        amenity={amenity}
        open={editOpen}
        onOpenChange={setEditOpen}
        showTrigger={false}
      />
    </>
  );
};

export const amenityMoreColumn = (branchId?: string): ColumnDef<IAmenity> => ({
  id: 'more',
  cell: (props) => <AmenityMoreColumn {...props} branchId={branchId} />,
  size: 33,
});
