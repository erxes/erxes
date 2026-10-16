import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
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
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState<string>('tech_card_id');
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={t('tech-card-edit')}
      aria-label={t('tech-card-edit')}
      onClick={() => setOpen(cardId)}
    >
      <IconEdit />
    </Button>
  );
};

const getColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<ITechCardOutputRow>[] => [
  {
    id: 'edit',
    size: 32,
    header: '',
    cell: ({ row }) => <EditOutputCard cardId={row.original.techCard._id} />,
  },
  {
    id: 'code',
    header: () => <RecordTable.InlineHead label={t('code')} />,
    size: 140,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.techCard.code || '-'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'name',
    header: () => (
      <RecordTable.InlineHead label={t('tech-card-production-stage')} />
    ),
    size: 220,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.techCard.name}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'output',
    header: () => (
      <RecordTable.InlineHead label={t('tech-card-output-products')} />
    ),
    size: 260,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <ProductsInline productIds={[row.original.output.productId]} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'uom',
    header: () => <RecordTable.InlineHead label={t('tech-card-unit')} />,
    size: 100,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.output.uom || '-'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'quantity',
    header: () => <RecordTable.InlineHead label={t('quantity')} />,
    size: 120,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.output.quantity?.toLocaleString()}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'costRatio',
    header: () => <RecordTable.InlineHead label={t('tech-card-cost-ratio')} />,
    size: 150,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.output.costRatio ?? 0}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'duration',
    header: () => <RecordTable.InlineHead label={t('tech-card-duration')} />,
    size: 150,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.techCard.durationType === 'real'
          ? t('tech-card-duration-real')
          : `${row.original.techCard.duration ?? '-'} ${
              row.original.techCard.durationType
                ? t(`tech-card-duration-${row.original.techCard.durationType}`)
                : ''
            }`}
      </RecordTableInlineCell>
    ),
  },
];

const Commandbar = () => null;

export const TechCardOutputsTable = () => {
  const { t } = useTranslation('accounting');
  const { rows, loading, error, refetch, totalCount, handleFetchMore } =
    useTechCardOutputs();
  if (error || (!loading && !rows.length))
    return <TechCardListStatus error={error} retry={() => void refetch()} />;
  return (
    <SettingsRowsTable
      columns={getColumns(t)}
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
