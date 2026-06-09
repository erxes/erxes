import { lazy } from 'react';
import {
  AutomationExecutionHistoryNameProps,
  AutomationRemoteEntryProps,
  AutomationRemoteEntryWrapper,
} from 'ui-modules';

const PosActionConfigForm = lazy(() =>
  import('./action/PosActionConfigForm').then((module) => ({
    default: module.PosActionConfigForm,
  })),
);

const PosActionNodeContent = lazy(() =>
  import('./action/PosActionNodeContent').then((module) => ({
    default: module.PosActionNodeContent,
  })),
);

const PosActionHistoryResult = lazy(() =>
  import('./action/PosActionHistoryResultColumn').then((module) => ({
    default: module.PosActionHistoryResult,
  })),
);

const PosOrderEventTriggerConfigForm = lazy(() =>
  import('./trigger/PosOrderEventTriggerConfigForm').then((module) => ({
    default: module.PosOrderEventTriggerConfigForm,
  })),
);

const PosOrderEventTriggerNodeContent = lazy(() =>
  import('./trigger/PosOrderEventTriggerNodeContent').then((module) => ({
    default: module.PosOrderEventTriggerNodeContent,
  })),
);

export const PosRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: PosActionConfigForm,
        triggerForm: PosOrderEventTriggerConfigForm,
        triggerConfigContent: PosOrderEventTriggerNodeContent,
        actionNodeConfiguration: PosActionNodeContent,
        historyActionResult: PosActionHistoryResult,
        historyName: ({
          target,
        }: AutomationExecutionHistoryNameProps<Record<string, unknown>>) =>
          String(target?.number || target?._id || ''),
      }}
    />
  );
};
