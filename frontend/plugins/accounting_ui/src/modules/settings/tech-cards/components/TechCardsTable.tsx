import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  MoreActionsCell,
  SettingsRowsTable,
  moreColumn,
} from '~/modules/settings/components/SettingsRowsTable';
import {
  RecordTable,
  RecordTableInlineCell,
  toast,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { ProductsInline } from 'ui-modules';
import { useTechCardRemove } from '../hooks/useTechCardMutations';
import { useTechCards } from '../hooks/useTechCards';
import { ITechCard, ITechCardItem } from '../types/TechCard';
import { TechCardListStatus } from './TechCardListStatus';

const ProductListCell = ({ items }: { items: ITechCardItem[] }) => {
  const productIds = items.map((item) => item.productId).filter(Boolean);

  if (!productIds.length) {
    return <RecordTableInlineCell>-</RecordTableInlineCell>;
  }

  return (
    <RecordTableInlineCell>
      <ProductsInline productIds={productIds} />
    </RecordTableInlineCell>
  );
};

const TechCardMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITechCard, unknown>;
}) => {
  const [, setOpen] = useQueryState('tech_card_id');
  const { confirm } = useConfirm();
  const { removeTechCard } = useTechCardRemove();

  const handleEdit = () => setOpen(cell.row.original._id);

  const handleDelete = () =>
    confirm({
      message: 'Энэ технологийн картыг устгах уу?',
      options: {
        okLabel: 'Устгах',
        cancelLabel: 'Болих',
      },
    }).then(() => {
      removeTechCard({
        variables: { _id: cell.row.original._id },
        onError: (error: Error) => {
          toast({
            title: 'Алдаа',
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    });

  return <MoreActionsCell onEdit={handleEdit} onDelete={handleDelete} />;
};

const techCardMoreColumn: ColumnDef<ITechCard> = {
  ...moreColumn,
  cell: TechCardMoreColumnCell,
};

const techCardColumns: ColumnDef<ITechCard>[] = [
  techCardMoreColumn,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Код" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Дамжлага" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'inputs',
    accessorKey: 'inputs',
    header: () => <RecordTable.InlineHead label="Орц бараа" />,
    cell: ({ row }) => <ProductListCell items={row.original.inputs} />,
    size: 260,
  },
  {
    id: 'outputs',
    accessorKey: 'outputs',
    header: () => <RecordTable.InlineHead label="Гарц бараа" />,
    cell: ({ row }) => <ProductListCell items={row.original.outputs} />,
    size: 260,
  },
  {
    id: 'duration',
    accessorKey: 'duration',
    header: () => <RecordTable.InlineHead label="Хугацаа" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {[row.original.duration, row.original.durationType]
          .filter(Boolean)
          .join(' ') || '-'}
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="Төлөв" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
    size: 120,
  },
];

const TechCardsCommandbar = () => null;

export const TechCardsTable = () => {
  const { techCards, loading, totalCount, handleFetchMore, error, refetch } =
    useTechCards();

  if (error || (!loading && !techCards.length))
    return <TechCardListStatus error={error} retry={() => void refetch()} />;

  return (
    <SettingsRowsTable
      columns={techCardColumns}
      data={techCards}
      loading={loading}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      Commandbar={TechCardsCommandbar}
      tableId="accounting_tech_cards_record_table"
    />
  );
};
