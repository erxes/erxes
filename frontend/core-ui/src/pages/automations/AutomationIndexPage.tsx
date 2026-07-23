import { AutomationsRecordTable } from '@/automations/components/list/AutomationsRecordTable';
import { useAutomationsListView } from '@/automations/components/list/AutomationsViewToggle';
import { WorkflowTemplatesList } from '@/automations/components/templates/WorkflowTemplatesList';
import { PageContainer } from 'erxes-ui';

export const AutomationsIndexPage = () => {
  const { view } = useAutomationsListView();

  return (
    <PageContainer>
      {view === 'templates' ? (
        <WorkflowTemplatesList />
      ) : (
        <AutomationsRecordTable />
      )}
    </PageContainer>
  );
};
