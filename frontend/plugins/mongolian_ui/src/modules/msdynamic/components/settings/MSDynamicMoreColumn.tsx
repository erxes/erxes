import { Cell } from '@tanstack/react-table';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';

import { useMSDynamicConfigActions } from '../../hooks/useMSDynamicConfigActions';
import { useMSDynamicConfigs } from '../../hooks/useMSDynamicConfigs';
import { msDynamicConfigDetailAtom } from '../../states/msDynamicConfigStates';
import { MSMDynamicConfigRow } from '../../types';

export const MSDynamicMoreColumnCell = ({
  cell,
}: {
  cell: Cell<MSMDynamicConfigRow, unknown>;
}) => {
  const row = cell.row.original;
  const setEditDetail = useSetAtom(msDynamicConfigDetailAtom);
  const { configsMap, saveConfigs } = useMSDynamicConfigs();
  const { removeConfig } = useMSDynamicConfigActions({ configsMap, saveConfigs });

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="h-full w-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => setEditDetail(row)}>
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item value="delete" onSelect={() => removeConfig(row)}>
              <IconTrash /> Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const msDynamicMoreColumn = {
  id: 'more',
  cell: ({ cell }: { cell: Cell<MSMDynamicConfigRow, unknown> }) => (
    <MSDynamicMoreColumnCell cell={cell} />
  ),
  size: 33,
};
