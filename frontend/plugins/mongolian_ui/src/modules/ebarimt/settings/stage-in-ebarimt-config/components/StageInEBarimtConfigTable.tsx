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
import { GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';
import {
  stageInEbarimtDetailAtom,
  IStageInEbarimtConfigRow,
} from '@/ebarimt/settings/stage-in-ebarimt-config/states/stageInEbarimtConfigStates';
import { useRemoveStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useRemoveStageInEbarimtConfig';
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
      message: 'Are you sure you want to delete this config?',
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
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

const moreColumn = {
  id: 'more',
  cell: StageInEBarimtConfigMoreCell,
  size: 33,
};

const columns: ColumnDef<IStageInEbarimtConfigRow>[] = [
  moreColumn,
  RecordTable.checkboxColumn as ColumnDef<IStageInEbarimtConfigRow>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead label="Title" icon={IconCode} />,
    cell: ({ cell }) => <StageInEBarimtConfigTitleCell cell={cell} />,
    size: 200,
  },
  {
    id: 'companyName',
    accessorKey: 'companyName',
    header: () => <RecordTable.InlineHead label="Company Name" icon={IconCode} />,
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
    header: () => <RecordTable.InlineHead label="Pos No" icon={IconCode} />,
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
    header: () => <RecordTable.InlineHead label="Has VAT" icon={IconToggleLeft} />,
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
    header: () => <RecordTable.InlineHead label="Has Citytax" icon={IconToggleLeft} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() ? 'Yes' : 'No'} />
      </RecordTableInlineCell>
    ),
    size: 100,
  },
];

export const StageInEBarimtConfigTable = () => {
  const { rows, loading } = useStageInEbarimtConfigRows();

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
                No Stage In Ebarimt config yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Get started by creating your first Stage In Ebarimt config.
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
