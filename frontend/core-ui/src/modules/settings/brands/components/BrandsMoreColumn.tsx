import { Cell } from '@tanstack/react-table';
import { RecordTable, useQueryState, useConfirm, useToast } from 'erxes-ui';
import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { IBrand } from '../types';
import { renderingBrandDetailAtom } from '../state';
import { useBrandsRemove } from '../hooks/useBrandsRemove';

export const BrandsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IBrand, unknown>;
}) => {
  const [, setBrandDetail] = useQueryState('brand_id');
  const setRenderingBrandDetail = useSetAtom(renderingBrandDetailAtom);
  const { _id, name } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { brandsRemove } = useBrandsRemove();

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete "${name}"?`,
    }).then(async () => {
      try {
        await brandsRemove({ variables: { ids: [_id] } });
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
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => {
                setRenderingBrandDetail(true);
                setBrandDetail(_id);
              }}
            >
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const brandsMoreColumn = {
  id: 'more',
  cell: BrandsMoreColumnCell,
  size: 25,
};
