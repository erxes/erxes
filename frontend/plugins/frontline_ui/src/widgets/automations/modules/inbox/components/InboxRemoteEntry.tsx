import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
} from 'ui-modules';
import { InboxMessageTriggerForm } from './trigger/InboxMessageTriggerForm';
import { InboxMessageActionForm } from './action/InboxMessageActionForm';
import { InboxMessageActionConfig } from './action/InboxMessageActionConfig';

export const InboxRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        triggerForm: InboxMessageTriggerForm,
        actionForm: renderActionForm,
        actionNodeConfiguration: InboxMessageActionConfig,
      }}
    />
  );
};

function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  return <InboxMessageActionForm {...props} />;
}
