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
import { IconClipboardList, IconCode, IconEdit, IconTag, IconTrash } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { useQuery } from '@apollo/client';
import { GET_MN_CONFIGS } from '@/ebarimt/settings/pos-in-ebarimt-config/graphql/mnConfigs';
import {
  posInEbarimtDetailAtom,
  IPosInEbarimtConfigRow,
} from '@/ebarimt/settings/pos-in-ebarimt-config/states/posInEbarimtConfigStates';
import { useRemovePosInEbarimtConfig } from '@/ebarimt/settings/pos-in-ebarimt-config/hooks/useRemovePosInEbarimtConfig';
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
      message: 'Are you sure you want to delete this config?',
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
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

const posInEbarimtMoreColumn = {
  id: 'more',
  cell: PosInEBarimtConfigMoreCell,
  size: 33,
};

const posInEbarimtColumns: ColumnDef<IPosInEbarimtConfigRow>[] = [
  posInEbarimtMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IPosInEbarimtConfigRow>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead label="Title" icon={IconCode} />,
    cell: ({ cell }) => <PosInEBarimtConfigTitleCell cell={cell} />,
    size: 200,
  },
  {
    id: 'posId',
    accessorKey: 'posId',
    header: () => <RecordTable.InlineHead label="POS" icon={IconTag} />,
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
    header: () => <RecordTable.InlineHead label="POS No" icon={IconCode} />,
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
      <RecordTable.InlineHead label="Company Name" icon={IconCode} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
];

export const PosInEBarimtConfigTable = () => {
  const { rows, loading } = usePosInEbarimtConfigRows();

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
                No Pos in ebarimt config yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Get started by creating your first Pos in ebarimt config.
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
