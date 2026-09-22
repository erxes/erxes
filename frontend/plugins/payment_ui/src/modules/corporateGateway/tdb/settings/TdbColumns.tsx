import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/table-core';
import { IconEdit, IconHash, IconTrash, IconUser } from '@tabler/icons-react';
import {
  Badge,
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
  useConfirm,
} from 'erxes-ui';
import { ITdbConfig } from '../configs/types';
import { TdbConfigForm } from './TdbConfigForm';
import { gatewayCheckboxColumn } from '~/modules/corporateGateway/components/checkboxColumn';

type Actions = {
  addConfig: (variables: Record<string, any>) => Promise<any>;
  editConfig: (variables: Record<string, any>) => Promise<any>;
  removeConfig: (_id: string) => Promise<any>;
};

export const tdbColumns = (actions: Actions): ColumnDef<ITdbConfig>[] => [
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
              <TdbConfigForm
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
  gatewayCheckboxColumn as ColumnDef<ITdbConfig>,
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
    id: 'username',
    accessorKey: 'username',
    header: () => {
      const { t } = useTranslation('payment');
      return <RecordTable.InlineHead label={t('username')} icon={IconUser} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'apiUrl',
    accessorKey: 'apiUrl',
    header: () => {
      const { t } = useTranslation('payment');
      return <RecordTable.InlineHead label={t('api-url')} icon={IconHash} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'testMode',
    accessorKey: 'testMode',
    header: () => {
      const { t } = useTranslation('payment');
      return (
        <RecordTable.InlineHead label={t('environment')} icon={IconHash} />
      );
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('payment');
      const isTest = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <Badge variant={isTest ? 'secondary' : 'default'}>
            {isTest ? t('test-mode') : t('production-mode')}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
];
