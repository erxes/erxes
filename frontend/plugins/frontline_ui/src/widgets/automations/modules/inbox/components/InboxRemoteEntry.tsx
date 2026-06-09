import { lazy } from 'react';
import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
} from 'ui-modules';
import { InboxMessageTriggerForm } from './trigger/InboxMessageTriggerForm';
import { InboxMessageActionForm } from './action/InboxMessageActionForm';
import { InboxMessageActionConfig } from './action/InboxMessageActionConfig';

const ConversationEventTriggerForm = lazy(() =>
  import('./trigger/ConversationEventTriggerForm').then((module) => ({
    default: module.ConversationEventTriggerForm,
  })),
);

const ConversationEventTriggerNodeContent = lazy(() =>
  import('./trigger/ConversationEventTriggerNodeContent').then((module) => ({
    default: module.ConversationEventTriggerNodeContent,
  })),
);

export const InboxRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        triggerForm: ConversationEventTriggerForm,
        triggerConfigContent: ConversationEventTriggerNodeContent,
        // triggerForm: InboxMessageTriggerForm,
        actionForm: renderActionForm,
        actionNodeConfiguration: InboxMessageActionConfig,
      }}
    />
  );
};

function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  return <InboxMessageActionForm {...props} />;
}
