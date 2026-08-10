import { lazy } from 'react';
import {
  AutomationExecutionHistoryNameProps,
  AutomationRemoteEntryProps,
  AutomationRemoteEntryWrapper,
} from 'ui-modules';

const OperationActionConfigForm = lazy(() =>
  import('../../common/components/action/OperationActionConfigForm').then(
    (module) => ({
      default: module.OperationActionConfigForm,
    }),
  ),
);

const OperationActionNodeContent = lazy(() =>
  import('../../common/components/action/OperationActionNodeContent').then(
    (module) => ({
      default: module.OperationActionNodeContent,
    }),
  ),
);

const OperationActionHistoryResult = lazy(() =>
  import('../../common/components/action/OperationActionHistoryResult').then(
    (module) => ({
      default: module.OperationActionHistoryResult,
    }),
  ),
);

const OperationCompletionTriggerConfigForm = lazy(() =>
  import('../../common/components/trigger/OperationCompletionTriggerConfigForm').then(
    (module) => ({
      default: module.OperationCompletionTriggerConfigForm,
    }),
  ),
);

const OperationCompletionTriggerNodeContent = lazy(() =>
  import('../../common/components/trigger/OperationCompletionTriggerNodeContent').then(
    (module) => ({
      default: module.OperationCompletionTriggerNodeContent,
    }),
  ),
);

export const ProjectRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: OperationActionConfigForm,
        triggerForm: OperationCompletionTriggerConfigForm,
        triggerConfigContent: OperationCompletionTriggerNodeContent,
        actionNodeConfiguration: OperationActionNodeContent,
        historyActionResult: OperationActionHistoryResult,
        historyName: ({
          target,
        }: AutomationExecutionHistoryNameProps<Record<string, unknown>>) =>
          String(target?.name || target?._id || ''),
      }}
    />
  );
};
