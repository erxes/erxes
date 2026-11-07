import { TBroadcastStepsOptions } from '../../hooks/useBroadcastStepsState';
import { RecordSidePanel } from 'ui-modules';
import { usePagePanelContext } from '@/side-panel/hooks/usePagePanel';
import { Resizable, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  BroadcastStepsProvider,
  useBroadcastSteps,
} from '@/broadcast/context/BroadcastStepsContext';
import { BroadcastPreview } from '@/broadcast/components/BroadcastPreview';
import { BroadcastScheduleField } from '@/broadcast/components/steps/BroadcastScheduleField';
import { BroadcastStepActions } from '@/broadcast/components/steps/BroadcastStepActions';
import { BroadcastStepContent } from '@/broadcast/components/steps/BroadcastStepContent';
export const BroadcastSteps = (options: TBroadcastStepsOptions) => (
  <BroadcastStepsProvider {...options}>
    <BroadcastStepsHeader />
    <BroadcastStepsLayout />
  </BroadcastStepsProvider>
);
const BroadcastStepsHeader = () => {
  const { t } = useTranslation('broadcasts');
  const { messageId } = useBroadcastSteps();
  const pagePanel = usePagePanelContext();
  return (
    <RecordSidePanel.Header
      title={<>{t(messageId ? 'steps.edit-title' : 'steps.new-title')}</>}
      onBack={pagePanel.onBack}
      onClose={pagePanel.onClose}
      expanded={pagePanel.expanded}
      onExpand={pagePanel.onExpand}
      actions={
        <>
          <div className="ml-auto mr-2 flex items-center gap-2">
            <BroadcastScheduleField />
          </div>
        </>
      }
    />
  );
};
const BroadcastStepsLayout = () => {
  const { method, isWorkflow } = useBroadcastSteps();

  // Keyed by method: panel sizes are read once on mount, and the sheet can
  // open in the same tick the method lands in the query string. The canvas is
  // a workflow's content, so it takes most of the split.
  return (
    <Resizable.PanelGroup
      key={method || 'default'}
      direction="horizontal"
      className="bg-blue"
    >
      <Resizable.Panel
        className="flex flex-col"
        defaultSize={isWorkflow ? 26 : 40}
        minSize={isWorkflow ? 20 : 35}
      >
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-y-auto',
            'grow overflow-hidden flex flex-col',
          )}
        >
          <BroadcastStepContent />
        </div>
        <BroadcastStepActions />
      </Resizable.Panel>

      <Resizable.Handle />
      <Resizable.Panel
        className="flex flex-col h-full"
        defaultSize={isWorkflow ? 74 : 60}
        minSize={60}
      >
        <BroadcastPreview />
      </Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
