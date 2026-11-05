import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { ColumnDef } from '@tanstack/react-table';
import {
  SettingsRowsTable,
  moreColumn,
} from '~/modules/settings/components/SettingsRowsTable';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { ProductsInline } from 'ui-modules';
import { useJobs } from '../hooks/useJobs';
import { IJob } from '@/settings/jobs/types/Job';
import { JobListStatus } from './JobListStatus';
import { JobActions } from './JobActions';
import { JobDuration } from '@/settings/jobs/components/JobDuration';

const ProductListCell = ({ items }: { items: IJob['inputs'] }) => {
  const productIds = (items ?? []).flatMap((item) =>
    item?.productId ? [item.productId] : [],
  );

  if (!productIds.length) {
    return <RecordTableInlineCell>-</RecordTableInlineCell>;
  }

  return (
    <RecordTableInlineCell>
      <ProductsInline productIds={productIds} />
    </RecordTableInlineCell>
  );
};

const jobMoreColumn: ColumnDef<IJob> = {
  ...moreColumn,
  cell: ({ row }) => <JobActions cardId={row.original._id} />,
};

const getJobColumns = (t: TFunction<'accounting'>): ColumnDef<IJob>[] => [
  jobMoreColumn,
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
    header: () => <RecordTable.InlineHead label={t('job-production-stage')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue<string>()}</RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'inputs',
    accessorKey: 'inputs',
    header: () => <RecordTable.InlineHead label={t('job-input-products')} />,
    cell: ({ row }) => <ProductListCell items={row.original.inputs} />,
    size: 260,
  },
  {
    id: 'outputs',
    accessorKey: 'outputs',
    header: () => <RecordTable.InlineHead label={t('job-output-products')} />,
    cell: ({ row }) => <ProductListCell items={row.original.outputs} />,
    size: 260,
  },
  {
    id: 'duration',
    accessorKey: 'duration',
    header: () => <RecordTable.InlineHead label={t('job-duration')} />,
    cell: ({ row }) => <JobDuration {...row.original} />,
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

const JobsCommandbar = () => null;

export const JobsTable = () => {
  const { t } = useTranslation('accounting');
  const { jobs, loading, totalCount, handleFetchMore, error, refetch } =
    useJobs();

  if (error || (!loading && !jobs.length))
    return <JobListStatus error={error} retry={() => void refetch()} />;

  return (
    <SettingsRowsTable
      columns={getJobColumns(t)}
      data={jobs}
      loading={loading}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      Commandbar={JobsCommandbar}
      tableId="accounting_jobs_record_table"
    />
  );
};
