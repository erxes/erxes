import { Cell } from '@tanstack/react-table';
import { RecordTable, Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Can, ISegment } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useSegmentMoreColumn } from '../hooks/useSegmentMoreColumn';

export const SegmentMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ISegment, unknown>;
}) => {
  const { t } = useTranslation('segment');
  const { _id, name } = cell.row.original;
  const { edit, requestDelete } = useSegmentMoreColumn(_id, name);

  return (
    <Popover>
      <Can action="segmentsManage">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={edit}>
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={requestDelete}>
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const segmentMoreColumn = {
  id: 'more',
  cell: SegmentMoreColumnCell,
  size: 33,
};
