import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/table-core';
import {
  IconBuildingBank,
  IconEdit,
  IconHash,
  IconId,
  IconTrash,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
  useConfirm,
} from 'erxes-ui';
import { IGolomtBankConfigsItem } from '../types/IConfigs';
import { GolomtConfigForm } from './GolomtConfigForm';
import { gatewayCheckboxColumn } from '~/modules/corporateGateway/components/checkboxColumn';

type Actions = {
  addConfig: (variables: Record<string, any>) => Promise<any>;
  editConfig: (variables: Record<string, any>) => Promise<any>;
  removeConfig: (_id: string) => Promise<any>;
};

export const golomtColumns = (
  actions: Actions,
): ColumnDef<IGolomtBankConfigsItem>[] => [
  {
    id: 'more',
    cell: ({ cell }) => {
      const { t } = useTranslation('payment');
      const config = cell.row.original;
      const [editOpen, setEditOpen] = useState(false);
      const { confirm } = useConfirm();

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <Popover>
            <Popover.Trigger asChild>
              <RecordTable.MoreButton className="w-full h-full" />
            </Popover.Trigger>
            <Combobox.Content className="w-30 min-w-30">
              <Command shouldFilter={false}>
                <Command.List>
                  <Command.Item value="edit" onSelect={() => setEditOpen(true)}>
                    <IconEdit className="w-4 h-4" />
                    {t('edit')}
                  </Command.Item>
                  <Command.Item
                    value="delete"
                    onSelect={() =>
                      confirm({ message: t('remove-config-confirm') }).then(
                        () => actions.removeConfig(config._id),
                      )
                    }
                  >
                    <IconTrash className="w-4 h-4" /> {t('delete')}
                  </Command.Item>
                </Command.List>
              </Command>
            </Combobox.Content>
          </Popover>

          <Sheet open={editOpen} onOpenChange={setEditOpen} modal>
            <Sheet.View className="p-0 sm:max-w-lg">
              <GolomtConfigForm
                config={config}
                addConfig={actions.addConfig}
                editConfig={actions.editConfig}
                onCancel={() => setEditOpen(false)}
              />
            </Sheet.View>
          </Sheet>
        </div>
      );
    },
    size: 33,
  },
  gatewayCheckboxColumn as ColumnDef<IGolomtBankConfigsItem>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => {
      const { t } = useTranslation('payment');
      return <RecordTable.InlineHead label={t('name')} icon={IconHash} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'organizationName',
    accessorKey: 'organizationName',
    header: () => {
      const { t } = useTranslation('payment');
      return (
        <RecordTable.InlineHead
          label={t('organization')}
          icon={IconBuildingBank}
        />
      );
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'clientId',
    accessorKey: 'clientId',
    header: () => {
      const { t } = useTranslation('payment');
      return <RecordTable.InlineHead label={t('client-id')} icon={IconId} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'accountId',
    accessorKey: 'accountId',
    header: () => {
      const { t } = useTranslation('payment');
      return <RecordTable.InlineHead label={t('account-id')} icon={IconId} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
  },
];
