import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { IconEdit, IconRefresh, IconX } from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable, Spinner } from 'erxes-ui';
import { useFacebookBotMoreColumn } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotMoreColumn';
import { useTranslation } from 'react-i18next';

export const FacebookBotMoreColumnCell = ({
  cell,
}: {
  cell: CellContext<IFacebookBot, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const { _id } = cell.row.original;
  const {
    loadingRepair,
    loadingRemove,
    handleEdit,
    handleRepair,
    handleRemove,
  } = useFacebookBotMoreColumn(_id);

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="repair" onSelect={handleRepair}>
              {loadingRepair ? <Spinner size="sm" /> : <IconRefresh />} {t('repair')}
            </Command.Item>
            <Command.Item value="remove" onSelect={handleRemove}>
              {loadingRemove ? <Spinner size="sm" /> : <IconX />} {t('remove')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const facebookBotMoreColumn = (): ColumnDef<IFacebookBot> => ({
  id: 'more',
  cell: (cell: CellContext<IFacebookBot, unknown>) => (
    <FacebookBotMoreColumnCell cell={cell} />
  ),
  size: 56,
});
