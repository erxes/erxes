import { lazy } from 'react';
import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryWrapper,
} from 'ui-modules/modules';

const SalesActionConfigForm = lazy(() =>
  import('./SalesActionConfigForm').then((module) => ({
    default: module.SalesActionConfigForm,
  })),
);

export const SalesRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: SalesActionConfigForm,
        // triggerForm: renderTriggerForm,
      }}
    />
  );
};
