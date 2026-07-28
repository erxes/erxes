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

export const TaskRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: OperationActionConfigForm,
        actionNodeConfiguration: OperationActionNodeContent,
        historyActionResult: OperationActionHistoryResult,
        historyName: ({
          target,
        }: AutomationExecutionHistoryNameProps<Record<string, unknown>>) =>
          String(target?.number || target?.name || target?._id || ''),
      }}
    />
  );
};
