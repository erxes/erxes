import { Resizable, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  BroadcastStepsProvider,
  useBroadcastSteps,
} from '../../context/BroadcastStepsContext';
import { TBroadcastStepsOptions } from '../../hooks/useBroadcastStepsState';
import { BroadcastPreview } from '../BroadcastPreview';
import { BroadcastScheduleField } from './BroadcastScheduleField';
import { BroadcastStepActions } from './BroadcastStepActions';
import { BroadcastStepContent } from './BroadcastStepContent';

export const BroadcastSteps = (options: TBroadcastStepsOptions) => (
  <BroadcastStepsProvider {...options}>
    <BroadcastStepsHeader />
    <BroadcastStepsLayout />
  </BroadcastStepsProvider>
);

const BroadcastStepsHeader = () => {
  const { t } = useTranslation('broadcasts');
  const { messageId } = useBroadcastSteps();

  return (
    <Sheet.Header>
      <Sheet.Title>
        {t(messageId ? 'steps.edit-title' : 'steps.new-title')}
      </Sheet.Title>
      <div className="ml-auto mr-2 flex items-center gap-2">
        <BroadcastScheduleField />
      </div>
      <Sheet.Close />
    </Sheet.Header>
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
        <Sheet.Content className="grow overflow-hidden flex flex-col">
          <BroadcastStepContent />
        </Sheet.Content>
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
