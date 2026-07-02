import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  useConfirm,
  useQueryState,
  Popover,
  Combobox,
  Command,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IconClipboardList, IconCode, IconEdit, IconToggleLeft, IconTrash } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { useQuery } from '@apollo/client';
import { GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-return-ebarimt-config/graphql/queries/mnConfigs';
import {
  returnEbarimtDetailAtom,
  IReturnEbarimtConfigRow,
} from '@/ebarimt/settings/stage-in-return-ebarimt-config/states/returnEbarimtConfigStates';
import { useRemoveEbarimtReturnConfig } from '@/ebarimt/settings/stage-in-return-ebarimt-config/hooks/useRemoveEbarimtReturnConfig';
import { AddReturnEBarimtConfig } from './AddReturnEBarimtConfig';
import { ReturnEBarimtConfigCommandbar } from './ReturnEBarimtConfigCommandbar';

const useReturnEbarimtConfigRows = () => {
  const { data, loading } = useQuery(GET_MN_CONFIGS, {
    variables: { code: 'returnStageInEbarimt' },
    fetchPolicy: 'network-only',
  });

  const rows: IReturnEbarimtConfigRow[] = (data?.mnConfigs || []).map(
    (config: any) => {
      const value =
        typeof config.value === 'string'
          ? JSON.parse(config.value)
          : config.value || {};
      return {
        _id: config._id,
        subId: config.subId,
        ...value,
      };
    },
  );

  return { rows, loading };
};

export const ReturnEBarimtConfigTitleCell = ({
  cell,
}: {
  cell: Cell<IReturnEbarimtConfigRow, unknown>;
}) => {
  const [, setOpen] = useQueryState('return_ebarimt_id');
  const setDetail = useSetAtom(returnEbarimtDetailAtom);
  return (
    <RecordTableInlineCell
      className="cursor-pointer"
      onClick={() => {
        setDetail(cell.row.original);
        setOpen(cell.row.original._id);
      }}
    >
      <TextOverflowTooltip value={cell.getValue() as string} />
    </RecordTableInlineCell>
  );
};

export const ReturnEBarimtConfigMoreCell = ({
  cell,
}: {
  cell: Cell<IReturnEbarimtConfigRow, unknown>;
}) => {
  const { t } = useTranslation('mongolian');
  const [, setOpen] = useQueryState('return_ebarimt_id');
  const setDetail = useSetAtom(returnEbarimtDetailAtom);
  const { removeEbarimtReturnConfig } = useRemoveEbarimtReturnConfig();
  const { confirm } = useConfirm();

  const handleEdit = () => {
    setDetail(cell.row.original);
    setOpen(cell.row.original._id);
  };

  const handleDelete = () => {
    confirm({
      message: t('delete-this-config-confirm'),
      options: { okLabel: t('delete'), cancelLabel: t('cancel') },
    }).then(() => removeEbarimtReturnConfig(cell.row.original._id));
  };

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
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const returnEbarimtMoreColumn = {
  id: 'more',
  cell: ReturnEBarimtConfigMoreCell,
  size: 33,
};

const returnEbarimtColumns: ColumnDef<IReturnEbarimtConfigRow>[] = [
  returnEbarimtMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IReturnEbarimtConfigRow>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead label={t('title')} icon={IconCode} />;
    },
    cell: ({ cell }) => <ReturnEBarimtConfigTitleCell cell={cell} />,
    size: 200,
  },
  {
    id: 'stageId',
    accessorKey: 'stageId',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead label={t('stage')} icon={IconCode} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'hasVat',
    accessorKey: 'hasVat',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead label={t('has-vat')} icon={IconToggleLeft} />;
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('mongolian');
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() ? t('yes') : t('no')} />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'hasCitytax',
    accessorKey: 'hasCitytax',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead label={t('has-citytax')} icon={IconToggleLeft} />;
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('mongolian');
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() ? t('yes') : t('no')} />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
];

export const ReturnEBarimtConfigTable = () => {
  const { t } = useTranslation('mongolian');
  const { rows, loading } = useReturnEbarimtConfigRows();

  return (
    <RecordTable.Provider columns={returnEbarimtColumns} data={rows}>
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={4} />}
          </RecordTable.Body>
        </RecordTable>
        {!loading && rows?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <IconClipboardList size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t('no-return-ebarimt-config-yet')}
              </h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                {t('create-first-return-ebarimt-config')}
              </p>
              <AddReturnEBarimtConfig />
            </div>
          </div>
        )}
      </RecordTable.Scroll>
      <ReturnEBarimtConfigCommandbar />
    </RecordTable.Provider>
  );
};
