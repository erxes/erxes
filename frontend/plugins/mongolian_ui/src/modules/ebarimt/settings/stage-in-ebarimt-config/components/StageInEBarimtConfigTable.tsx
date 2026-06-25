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
  IconToggleLeft,
  IconTrash,
} from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { useQuery } from '@apollo/client';
import { GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';
import {
  stageInEbarimtDetailAtom,
  IStageInEbarimtConfigRow,
} from '@/ebarimt/settings/stage-in-ebarimt-config/states/stageInEbarimtConfigStates';
import { useRemoveStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useRemoveStageInEbarimtConfig';
import { normalizeRuleIds } from '@/ebarimt/settings/stage-in-ebarimt-config/types';
import { AddStageInEBarimtConfig } from './AddStageInEBarimtConfig';
import { StageInEBarimtConfigCommandbar } from './StageInEBarimtConfigCommandbar';

const useStageInEbarimtConfigRows = () => {
  const { data, loading } = useQuery(GET_MN_CONFIGS, {
    variables: { code: 'stageInEbarimt' },
    fetchPolicy: 'network-only',
  });

  const rows: IStageInEbarimtConfigRow[] = (data?.mnConfigs || []).map(
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

const StageInEBarimtConfigTitleCell = ({
  cell,
}: {
  cell: Cell<IStageInEbarimtConfigRow, unknown>;
}) => {
  const [, setOpen] = useQueryState('stage_in_ebarimt_id');
  const setDetail = useSetAtom(stageInEbarimtDetailAtom);
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

const StageInEBarimtConfigMoreCell = ({
  cell,
}: {
  cell: Cell<IStageInEbarimtConfigRow, unknown>;
}) => {
  const { t } = useTranslation('mongolian');
  const [, setOpen] = useQueryState('stage_in_ebarimt_id');
  const setDetail = useSetAtom(stageInEbarimtDetailAtom);
  const { removeStageInEbarimtConfig } = useRemoveStageInEbarimtConfig();
  const { confirm } = useConfirm();

  const handleEdit = () => {
    setDetail(cell.row.original);
    setOpen(cell.row.original._id);
  };

  const handleDelete = () => {
    confirm({
      message: t('delete-this-config-confirm'),
      options: { okLabel: t('delete'), cancelLabel: t('cancel') },
    }).then(() => removeStageInEbarimtConfig(cell.row.original._id));
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

const moreColumn = {
  id: 'more',
  cell: StageInEBarimtConfigMoreCell,
  size: 33,
};

const useStageInEbarimtColumns = (): ColumnDef<IStageInEbarimtConfigRow>[] => {
  const { t } = useTranslation('mongolian');
  return [
    moreColumn,
    RecordTable.checkboxColumn as ColumnDef<IStageInEbarimtConfigRow>,
    {
      id: 'title',
      accessorKey: 'title',
      header: () => <RecordTable.InlineHead label={t('title')} icon={IconCode} />,
      cell: ({ cell }) => <StageInEBarimtConfigTitleCell cell={cell} />,
      size: 200,
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
      id: 'hasVat',
      accessorKey: 'hasVat',
      header: () => (
        <RecordTable.InlineHead label={t('has-vat')} icon={IconToggleLeft} />
      ),
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() ? t('yes') : t('no')} />
        </RecordTableInlineCell>
      ),
      size: 100,
    },
    {
      id: 'hasCitytax',
      accessorKey: 'hasCitytax',
      header: () => (
        <RecordTable.InlineHead label={t('has-citytax')} icon={IconToggleLeft} />
      ),
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() ? t('yes') : t('no')} />
        </RecordTableInlineCell>
      ),
      size: 100,
    },
  ];
};

export const StageInEBarimtConfigTable = () => {
  const { t } = useTranslation('mongolian');
  const { rows, loading } = useStageInEbarimtConfigRows();
  const columns = useStageInEbarimtColumns();

  return (
    <RecordTable.Provider columns={columns} data={rows}>
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
                {t('no-stage-in-ebarimt-config-yet')}
              </h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                {t('create-first-stage-in-ebarimt-config')}
              </p>
              <AddStageInEBarimtConfig />
            </div>
          </div>
        )}
      </RecordTable.Scroll>
      <StageInEBarimtConfigCommandbar />
    </RecordTable.Provider>
  );
};
