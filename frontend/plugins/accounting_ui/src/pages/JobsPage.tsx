import { EditJob } from '@/settings/jobs/components/EditJob';
import { JobsTable } from '@/settings/jobs/components/JobsTable';
import { JobOutputsTable } from '@/settings/jobs/components/JobOutputsTable';
import { JobFilters } from '@/settings/jobs/components/JobFilters';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const JobsPage = ({
  unwindOutputs = false,
}: {
  unwindOutputs?: boolean;
}) => {
  return (
    <PageContainer className="flex-1 min-w-0">
      <PageSubHeader>
        <JobFilters unwindOutputs={unwindOutputs} />
      </PageSubHeader>
      {unwindOutputs ? <JobOutputsTable /> : <JobsTable />}
      <EditJob />
    </PageContainer>
  );
};
