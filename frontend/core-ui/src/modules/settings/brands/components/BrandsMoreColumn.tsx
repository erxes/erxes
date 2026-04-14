import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable, useConfirm, useQueryState, useToast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { Can } from 'ui-modules';
import { useBrandsRemove } from '../hooks/useBrandsRemove';
import { renderingBrandDetailAtom } from '../state';
import { IBrand } from '../types';

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
      <Can actions={['brandsUpdate', 'brandsDelete']}>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Can action="brandsUpdate">
              <Command.Item
                value="edit"
                onSelect={() => {
                  setRenderingBrandDetail(true);
                  setBrandDetail(_id);
                }}
              >
                <IconEdit /> Edit
              </Command.Item>
            </Can>
            <Can action="brandsDelete">
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

export const brandsMoreColumn = {
  id: 'more',
  cell: BrandsMoreColumnCell,
  size: 25,
};
