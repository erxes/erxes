import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { IconPlus } from '@tabler/icons-react';
import { Button, PageSubHeader, Sheet } from 'erxes-ui';
import { Can } from 'ui-modules';
import { AccountingLayout } from '@/layout/components/Layout';
import { AccountingHeader } from '@/layout/components/Header';
import { AccountingSheet } from '@/layout/components/Sheet';
import { SettingsRowsTable } from '@/settings/components/SettingsRowsTable';
import { JobListStatus } from '@/settings/jobs/components/JobListStatus';
import { JobExecutionEditor } from '@/inventories/job-executions/JobExecutionEditor';
import { JobExecutionFilters } from '@/inventories/job-executions/JobExecutionFilters';
import { useJobExecutionFilters } from '@/inventories/job-executions/useJobExecutionFilters';
import { GET_EXECUTIONS } from '@/inventories/job-executions/graphql';
import { ExecutionCommandbar } from '@/inventories/job-executions/ExecutionCommandbar';
import {
  ExecutionTableProvider,
  jobExecutionColumns,
} from '@/inventories/job-executions/JobExecutionColumns';
import { JobExecution } from '@/inventories/job-executions/types';

export const JobExecutionsPage = () => {
  const { t } = useTranslation('accounting');
  const filters = useJobExecutionFilters();
  const [editor, setEditor] = useState<JobExecution | 'new' | null>(null);
  const { data, loading, error, refetch, fetchMore } = useQuery(
    GET_EXECUTIONS,
    {
      variables: {
        ...filters,
        page: 1,
        perPage: 20,
      },
      notifyOnNetworkStatusChange: true,
    },
  );
  const rows = data?.jobExecutions.rows ?? [];
  const totalCount = data?.jobExecutions.totalCount ?? 0;
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/inventories/job-executions"
        returnText={t('production-executions')}
        skipSettings
      >
        <Can action="manageJobExecutions">
          <Button onClick={() => setEditor('new')}>
            <IconPlus />
            {t('production-add')}
          </Button>
        </Can>
      </AccountingHeader>
      <PageSubHeader>
        <JobExecutionFilters />
      </PageSubHeader>
      {error || (!loading && !rows.length) ? (
        <JobListStatus error={error} retry={() => void refetch()} />
      ) : (
        <ExecutionTableProvider onEdit={setEditor}>
          <SettingsRowsTable
            columns={jobExecutionColumns}
            data={rows}
            loading={loading}
            totalCount={totalCount}
            tableId="accounting_job_executions"
            className="m-3"
            Commandbar={ExecutionCommandbar}
            stickyColumns={['more']}
            handleFetchMore={() => {
              if (loading || rows.length >= totalCount) return;
              void fetchMore({
                variables: { page: Math.ceil(rows.length / 20) + 1 },
                updateQuery: (previous, { fetchMoreResult }) => ({
                  jobExecutions: {
                    ...fetchMoreResult.jobExecutions,
                    rows: [
                      ...previous.jobExecutions.rows,
                      ...fetchMoreResult.jobExecutions.rows,
                    ],
                  },
                }),
              });
            }}
          />
        </ExecutionTableProvider>
      )}
      <Sheet
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <AccountingSheet
          title={t('production-executions')}
          className="sm:max-w-5xl"
        >
          {editor && (
            <JobExecutionEditor
              key={editor === 'new' ? 'new' : editor._id}
              execution={editor === 'new' ? undefined : editor}
              onSaved={() => setEditor(null)}
            />
          )}
        </AccountingSheet>
      </Sheet>
    </AccountingLayout>
  );
};
