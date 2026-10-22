import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { ColumnDef } from '@tanstack/react-table';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { ProductsInline } from 'ui-modules';
import {
  moreColumn,
  SettingsRowsTable,
} from '../../components/SettingsRowsTable';
import { useJobOutputs } from '../hooks/useJobOutputs';
import { IJobOutputRow } from '../types/Job';
import { JobListStatus } from './JobListStatus';
import { JobActions } from './JobActions';
import { JobDuration } from '@/settings/jobs/components/JobDuration';

const getColumns = (t: TFunction<'accounting'>): ColumnDef<IJobOutputRow>[] => [
  {
    ...moreColumn,
    cell: ({ row }) => <JobActions cardId={row.original.job._id} />,
  },
  {
    id: 'code',
    header: () => <RecordTable.InlineHead label={t('code')} />,
    size: 140,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.job.code || '-'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'name',
    header: () => <RecordTable.InlineHead label={t('job-production-stage')} />,
    size: 220,
    cell: ({ row }) => (
      <RecordTableInlineCell>{row.original.job.name}</RecordTableInlineCell>
    ),
  },
  {
    id: 'output',
    header: () => <RecordTable.InlineHead label={t('job-output-products')} />,
    size: 260,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <ProductsInline
          productIds={
            row.original.output.productId ? [row.original.output.productId] : []
          }
        />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'uom',
    header: () => <RecordTable.InlineHead label={t('job-unit')} />,
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
    header: () => <RecordTable.InlineHead label={t('job-cost-ratio')} />,
    size: 150,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.output.costRatio ?? 0}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'duration',
    header: () => <RecordTable.InlineHead label={t('job-duration')} />,
    size: 150,
    cell: ({ row }) => <JobDuration {...row.original.job} />,
  },
];

const Commandbar = () => null;

export const JobOutputsTable = () => {
  const { t } = useTranslation('accounting');
  const { rows, loading, error, refetch, totalCount, handleFetchMore } =
    useJobOutputs();
  if (error || (!loading && !rows.length))
    return <JobListStatus error={error} retry={() => void refetch()} />;
  return (
    <SettingsRowsTable
      columns={getColumns(t)}
      data={rows}
      loading={loading}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      Commandbar={Commandbar}
      tableId="accounting_job_outputs_record_table"
      stickyColumns={['more']}
    />
  );
};
