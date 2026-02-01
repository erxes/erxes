import { Cell } from '@tanstack/react-table';
import { RecordTable, useQueryState } from 'erxes-ui';
import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { IBrand } from '../types';
import { renderingBrandDetailAtom } from '../state';

export const BrandsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IBrand, unknown>;
}) => {
  const [, setBrandDetail] = useQueryState('brand_id');
  const setRenderingBrandDetail = useSetAtom(renderingBrandDetailAtom);
  const { _id } = cell.row.original;

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
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const brandsMoreColumn = {
  id: 'more',
  cell: BrandsMoreColumnCell,
  size: 33,
};
