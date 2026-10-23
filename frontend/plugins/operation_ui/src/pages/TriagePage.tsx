import { PageContainer } from 'erxes-ui';
import { TriageLayout } from '@/triage/components/TriageLayout';
import { TaskDetailLink } from '@/task/components/TaskDetailLink';

export const TriagePage = () => {
  return (
    <PageContainer>
      <TaskDetailLink />
      <TriageLayout />
    </PageContainer>
  );
};
