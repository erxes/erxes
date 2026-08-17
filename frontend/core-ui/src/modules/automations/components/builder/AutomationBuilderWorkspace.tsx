import { AutomationBuilderCanvas } from '@/automations/components/builder/AutomationBuilderCanvas';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationsHotKeyScope } from '@/automations/types';
import { Icon, IconProps } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Command,
  Resizable,
  Spinner,
  Tooltip,
  useScopedHotkeys,
} from 'erxes-ui';
import { useAutomationBilderWorkSpace } from '@/automations/components/builder/hooks/useAutomationBilderWorkSpace';
import { WorkflowEditView } from '@/automations/components/builder/nodes/components/WorkflowEditView';
import { AutomationBuilderSidebar } from './sidebar/components/AutomationBuilderSidebar';

export const AutomationBuilderWorkspace = () => {
  const { loading, editingWorkflowId } = useAutomation();

  const {
    onOpen,
    // isMac,
    // isPanelOpen,
  } = useAutomationBilderWorkSpace();

  useScopedHotkeys(`mod+i`, () => onOpen(), AutomationsHotKeyScope.Builder);
  if (loading) {
    return <Spinner />;
  }

  if (editingWorkflowId) {
    return <WorkflowEditView workflowId={editingWorkflowId} />;
  }

  return (
    <div className="h-full relative flex min-h-0 w-full flex-row overflow-hidden">
      <AutomationBuilderCanvas />
      <AutomationBuilderSidebar />
    </div>
  );
};
