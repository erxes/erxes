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
import {
  IconClipboardList,
  IconCode,
  IconEdit,
  IconTag,
  IconTrash,
} from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { useQuery } from '@apollo/client';
import { GET_MN_CONFIGS } from '@/ebarimt/settings/pos-in-ebarimt-config/graphql/mnConfigs';
import {
  posInEbarimtDetailAtom,
  IPosInEbarimtConfigRow,
} from '@/ebarimt/settings/pos-in-ebarimt-config/states/posInEbarimtConfigStates';
import { useRemovePosInEbarimtConfig } from '@/ebarimt/settings/pos-in-ebarimt-config/hooks/useRemovePosInEbarimtConfig';
import { normalizeRuleIds } from '@/ebarimt/settings/pos-in-ebarimt-config/types';
import { AddPosInEBarimtConfig } from './AddPosInEBarimtConfig';
import { PosInEBarimtConfigCommandbar } from './PosInEBarimtConfigCommandbar';

const usePosInEbarimtConfigRows = () => {
  const { data, loading } = useQuery(GET_MN_CONFIGS, {
    variables: { code: 'posInEbarimt' },
    fetchPolicy: 'network-only',
  });

  const rows: IPosInEbarimtConfigRow[] = (data?.mnConfigs || []).map(
    (config: any) => {
      const value =
        typeof config.value === 'string'
          ? JSON.parse(config.value)
          : config.value || {};
      return {
        _id: config._id,
        subId: config.subId,
        ...value,
        reverseVatRules: normalizeRuleIds(value.reverseVatRules),
        reverseCtaxRules: normalizeRuleIds(value.reverseCtaxRules),
      };
    },
  );

  return { rows, loading };
};

export const PosInEBarimtConfigTitleCell = ({
  cell,
}: {
  cell: Cell<IPosInEbarimtConfigRow, unknown>;
}) => {
  const [, setOpen] = useQueryState('pos_in_ebarimt_id');
  const setDetail = useSetAtom(posInEbarimtDetailAtom);
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

export const PosInEBarimtConfigMoreCell = ({
  cell,
}: {
  cell: Cell<IPosInEbarimtConfigRow, unknown>;
}) => {
  const { t } = useTranslation('mongolian');
  const [, setOpen] = useQueryState('pos_in_ebarimt_id');
  const setDetail = useSetAtom(posInEbarimtDetailAtom);
  const { removePosInEbarimtConfig } = useRemovePosInEbarimtConfig();
  const { confirm } = useConfirm();

  const handleEdit = () => {
    setDetail(cell.row.original);
    setOpen(cell.row.original._id);
  };

  const handleDelete = () => {
    confirm({
      message: t('delete-this-config-confirm'),
      options: { okLabel: t('delete'), cancelLabel: t('cancel') },
    }).then(() => removePosInEbarimtConfig(cell.row.original._id));
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

const posInEbarimtMoreColumn = {
  id: 'more',
  cell: PosInEBarimtConfigMoreCell,
  size: 33,
};

const usePosInEbarimtColumns = (): ColumnDef<IPosInEbarimtConfigRow>[] => {
  const { t } = useTranslation('mongolian');
  return [
    posInEbarimtMoreColumn,
    RecordTable.checkboxColumn as ColumnDef<IPosInEbarimtConfigRow>,
    {
      id: 'title',
      accessorKey: 'title',
      header: () => <RecordTable.InlineHead label={t('title')} icon={IconCode} />,
      cell: ({ cell }) => <PosInEBarimtConfigTitleCell cell={cell} />,
      size: 200,
    },
    {
      id: 'posId',
      accessorKey: 'posId',
      header: () => <RecordTable.InlineHead label={t('pos')} icon={IconTag} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      ),
      size: 200,
    },
    {
      id: 'posNo',
      accessorKey: 'posNo',
      header: () => <RecordTable.InlineHead label={t('pos-no')} icon={IconCode} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      ),
      size: 120,
    },
    {
      id: 'companyName',
      accessorKey: 'companyName',
      header: () => (
        <RecordTable.InlineHead label={t('company-name')} icon={IconCode} />
      ),
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      ),
      size: 200,
    },
  ];
};

export const PosInEBarimtConfigTable = () => {
  const { t } = useTranslation('mongolian');
  const { rows, loading } = usePosInEbarimtConfigRows();
  const posInEbarimtColumns = usePosInEbarimtColumns();

  return (
    <RecordTable.Provider columns={posInEbarimtColumns} data={rows}>
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
                {t('no-pos-in-ebarimt-config-yet')}
              </h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                {t('create-first-pos-in-ebarimt-config')}
              </p>
              <AddPosInEBarimtConfig />
            </div>
          </div>
        )}
      </RecordTable.Scroll>
      <PosInEBarimtConfigCommandbar />
    </RecordTable.Provider>
  );
};
