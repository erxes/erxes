import { Cell } from '@tanstack/react-table';
import { RecordTable, useQueryState, useConfirm, useToast } from 'erxes-ui';
import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { IBrand } from '../types';
import { renderingBrandDetailAtom } from '../state';
import { useBrandsRemove } from '../hooks/useBrandsRemove';
import { Can } from 'ui-modules';

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
    <Can actions={['brandsUpdate', 'brandsDelete']}>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
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
    </Can>
  );
};

export const brandsMoreColumn = {
  id: 'more',
  cell: BrandsMoreColumnCell,
  size: 25,
};
