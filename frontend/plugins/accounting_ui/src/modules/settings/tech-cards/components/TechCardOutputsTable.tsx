import { IconEdit } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Button,
  RecordTable,
  RecordTableInlineCell,
  useQueryState,
} from 'erxes-ui';
import { ProductsInline } from 'ui-modules';
import { SettingsRowsTable } from '../../components/SettingsRowsTable';
import { useTechCardOutputs } from '../hooks/useTechCardOutputs';
import { ITechCardOutputRow } from '../types/TechCard';
import { TechCardListStatus } from './TechCardListStatus';

const EditOutputCard = ({ cardId }: { cardId: string }) => {
  const [, setOpen] = useQueryState<string>('tech_card_id');
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title="Технологийн карт засах"
      aria-label="Технологийн карт засах"
      onClick={() => setOpen(cardId)}
    >
      <IconEdit />
    </Button>
  );
};

const columns: ColumnDef<ITechCardOutputRow>[] = [
  {
    id: 'edit',
    size: 32,
    header: '',
    cell: ({ row }) => <EditOutputCard cardId={row.original.techCard._id} />,
  },
  {
    id: 'code',
    header: () => <RecordTable.InlineHead label="Код" />,
    size: 140,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.techCard.code || '-'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'name',
    header: () => <RecordTable.InlineHead label="Дамжлага" />,
    size: 220,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.techCard.name}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'output',
    header: () => <RecordTable.InlineHead label="Гарц бараа" />,
    size: 260,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <ProductsInline productIds={[row.original.output.productId]} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'uom',
    header: () => <RecordTable.InlineHead label="Нэгж" />,
    size: 100,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.output.uom || '-'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'quantity',
    header: () => <RecordTable.InlineHead label="Тоо хэмжээ" />,
    size: 120,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.output.quantity?.toLocaleString()}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'costRatio',
    header: () => <RecordTable.InlineHead label="Өртгийн харьцаа" />,
    size: 150,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.output.costRatio ?? 0}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'duration',
    header: () => <RecordTable.InlineHead label="Хугацаа" />,
    size: 150,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.techCard.durationType === 'real'
          ? 'real'
          : `${row.original.techCard.duration ?? '-'} ${
              row.original.techCard.durationType ?? ''
            }`}
      </RecordTableInlineCell>
    ),
  },
];

const Commandbar = () => null;

export const TechCardOutputsTable = () => {
  const { rows, loading, error, refetch, totalCount, handleFetchMore } =
    useTechCardOutputs();
  if (error || (!loading && !rows.length))
    return <TechCardListStatus error={error} retry={() => void refetch()} />;
  return (
    <SettingsRowsTable
      columns={columns}
      data={rows}
      loading={loading}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      Commandbar={Commandbar}
      tableId="accounting_tech_card_outputs_record_table"
      stickyColumns={['edit']}
    />
  );
};
