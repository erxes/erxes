import { WorkflowTemplateEditView } from '@/automations/components/templates/WorkflowTemplateEditView';
import { AutomationBuilderDnDProvider } from '@/automations/context/AutomationBuilderDnDProvider';
import { PageContainer } from 'erxes-ui';
import { useParams } from 'react-router';

export const WorkflowTemplateDetailPage = () => {
  const { id } = useParams();

  return (
    <PageContainer>
      {/* The editor brings its own AutomationProvider/ReactFlowProvider; only
          the canvas drag-and-drop context has to be supplied from outside. */}
      <AutomationBuilderDnDProvider>
        <WorkflowTemplateEditView templateId={id} />
      </AutomationBuilderDnDProvider>
    </PageContainer>
  );
};
