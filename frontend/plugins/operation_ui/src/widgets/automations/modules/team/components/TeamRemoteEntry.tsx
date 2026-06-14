import { lazy } from 'react';
import {
  AutomationExecutionHistoryNameProps,
  AutomationRemoteEntryProps,
  AutomationRemoteEntryWrapper,
} from 'ui-modules';

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

export const TeamRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        triggerForm: OperationCompletionTriggerConfigForm,
        triggerConfigContent: OperationCompletionTriggerNodeContent,
        historyName: ({
          target,
        }: AutomationExecutionHistoryNameProps<Record<string, unknown>>) =>
          String(target?.name || target?._id || ''),
      }}
    />
  );
};
