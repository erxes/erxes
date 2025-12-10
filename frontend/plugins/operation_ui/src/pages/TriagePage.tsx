import { PageContainer } from 'erxes-ui';
import { TriageLayout } from '@/triage/components/TriageLayout';
import { TaskDetailSheet } from '@/task/components/TaskDetailSheet';

export const TriagePage = () => {
  return (
    <PageContainer>
      <TaskDetailSheet />
      <TriageLayout />
    </PageContainer>
  );
};
