import { useTranslation } from 'react-i18next';
import { Cell } from '@tanstack/table-core';
import { IAdjustClosing } from '../types/AdjustClosing';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { ADJUST_CLOSING_CONTENT_TYPE } from '@/adjustments/constants/adjustmentPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

export const AdjustClosingMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAdjustClosing, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const { openDetail } = useSettingsPanel(ADJUST_CLOSING_CONTENT_TYPE);
  const { _id } = cell.row.original;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => openDetail(_id)}>
              <IconEdit /> {t('edit')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const AdjustClosingMoreColumn = {
  id: 'more',
  cell: AdjustClosingMoreColumnCell,
  size: 33,
};
