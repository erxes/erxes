import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { ColumnDef } from '@tanstack/react-table';
import {
  SettingsRowsTable,
  moreColumn,
} from '~/modules/settings/components/SettingsRowsTable';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { ProductsInline } from 'ui-modules';
import { useTechCards } from '../hooks/useTechCards';
import { ITechCard, ITechCardItem } from '../types/TechCard';
import { TechCardListStatus } from './TechCardListStatus';
import { TechCardActions } from './TechCardActions';

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

const techCardMoreColumn: ColumnDef<ITechCard> = {
  ...moreColumn,
  cell: ({ row }) => <TechCardActions cardId={row.original._id} />,
};

const getTechCardColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<ITechCard>[] => [
  techCardMoreColumn,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label={t('code')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.getValue<string>() || '-'}
      </RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead label={t('tech-card-production-stage')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue<string>()}</RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'inputs',
    accessorKey: 'inputs',
    header: () => (
      <RecordTable.InlineHead label={t('tech-card-input-products')} />
    ),
    cell: ({ row }) => <ProductListCell items={row.original.inputs} />,
    size: 260,
  },
  {
    id: 'outputs',
    accessorKey: 'outputs',
    header: () => (
      <RecordTable.InlineHead label={t('tech-card-output-products')} />
    ),
    cell: ({ row }) => <ProductListCell items={row.original.outputs} />,
    size: 260,
  },
  {
    id: 'duration',
    accessorKey: 'duration',
    header: () => <RecordTable.InlineHead label={t('tech-card-duration')} />,
    cell: ({ row }) => {
      const { duration, durationType } = row.original;
      const unitLabel = durationType
        ? t(`tech-card-duration-${durationType}`)
        : '';
      const durationLabel =
        durationType === 'real'
          ? t('tech-card-duration-real')
          : `${duration ?? '-'} ${unitLabel}`;
      return <RecordTableInlineCell>{durationLabel}</RecordTableInlineCell>;
    },
    size: 150,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label={t('status')} />,
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
  const { t } = useTranslation('accounting');
  const { techCards, loading, totalCount, handleFetchMore, error, refetch } =
    useTechCards();

  if (error || (!loading && !techCards.length))
    return <TechCardListStatus error={error} retry={() => void refetch()} />;

  return (
    <SettingsRowsTable
      columns={getTechCardColumns(t)}
      data={techCards}
      loading={loading}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      Commandbar={TechCardsCommandbar}
      tableId="accounting_tech_cards_record_table"
    />
  );
};
