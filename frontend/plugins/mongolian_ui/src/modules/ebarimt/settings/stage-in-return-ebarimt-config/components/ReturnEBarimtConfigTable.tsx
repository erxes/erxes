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
      message: 'Are you sure you want to delete this config?',
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
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
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> Delete
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
    header: () => <RecordTable.InlineHead label="Title" icon={IconCode} />,
    cell: ({ cell }) => <ReturnEBarimtConfigTitleCell cell={cell} />,
    size: 200,
  },
  {
    id: 'stageId',
    accessorKey: 'stageId',
    header: () => <RecordTable.InlineHead label="Stage" icon={IconCode} />,
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
    header: () => (
      <RecordTable.InlineHead label="Has VAT" icon={IconToggleLeft} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() ? 'Yes' : 'No'} />
      </RecordTableInlineCell>
    ),
    size: 100,
  },
  {
    id: 'hasCitytax',
    accessorKey: 'hasCitytax',
    header: () => (
      <RecordTable.InlineHead label="Has Citytax" icon={IconToggleLeft} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() ? 'Yes' : 'No'} />
      </RecordTableInlineCell>
    ),
    size: 100,
  },
];

export const ReturnEBarimtConfigTable = () => {
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
                No Return Ebarimt config yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Get started by creating your first Return Ebarimt config.
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
