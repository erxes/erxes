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
import { IElement } from '../types/element';
import { useRemoveElements } from '../hooks/useRemoveElements';
import { ElementEditSheet } from './ElementEditSheet';
import { ElementDuplicate } from './ElementDuplicate';

interface ElementMoreCellProps extends CellContext<IElement, unknown> {
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}

export const ElementMoreColumn = ({
  branchId,
  branchLanguages,
  mainLanguage,
  ...props
}: ElementMoreCellProps) => {
  const element = props.row.original;
  const [editOpen, setEditOpen] = useState(false);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeElements } = useRemoveElements();

  const handleEdit = () => {
    setEditOpen(true);
  };

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete this element?',
      options: { confirmationValue: 'delete' },
    }).then(() => {
      removeElements([element._id])
        .then(() => {
          toast({
            title: 'Success',
            variant: 'success',
            description: 'Element deleted successfully',
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
              <ElementDuplicate element={element} branchId={branchId}>
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
              </ElementDuplicate>
              <Command.Item value="delete" onSelect={handleDelete}>
                <IconTrash className="w-4 h-4" />
                Delete
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <ElementEditSheet
        element={element}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
        open={editOpen}
        onOpenChange={setEditOpen}
        showTrigger={false}
      />
    </>
  );
};

export const elementMoreColumn = (
  branchId?: string,
  branchLanguages?: string[],
  mainLanguage?: string,
): ColumnDef<IElement> => ({
  id: 'more',
  cell: (props) => (
    <ElementMoreColumn
      {...props}
      branchId={branchId}
      branchLanguages={branchLanguages}
      mainLanguage={mainLanguage}
    />
  ),
  size: 33,
});
