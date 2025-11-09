import { lazy } from 'react';
import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryWrapper,
  AutomationExecutionHistoryNameProps,
} from 'ui-modules';
import { IDeal } from '@/deals/types/deals';

const SalesActionConfigForm = lazy(() =>
  import('./SalesActionConfigForm').then((module) => ({
    default: module.SalesActionConfigForm,
  })),
);

const SalesActionNodeContent = lazy(() =>
  import('./SalesActionNodeContent').then((module) => ({
    default: module.SalesActionNodeContent,
  })),
);

const SalesActionHistoryResult = lazy(() =>
  import('./SalesActionHistoryResultColumn').then((module) => ({
    default: module.SalesActionHistoryResult,
  })),
);

export const SalesRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: SalesActionConfigForm,
        actionNodeConfiguration: SalesActionNodeContent,
        historyActionResult: SalesActionHistoryResult,
        historyName: ({ target }: AutomationExecutionHistoryNameProps<IDeal>) =>
          target?.name,
      }}
    />
  );
};
