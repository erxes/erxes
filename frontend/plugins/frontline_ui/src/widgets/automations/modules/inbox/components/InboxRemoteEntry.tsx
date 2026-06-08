import { lazy } from 'react';
import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryWrapper,
} from 'ui-modules';

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
      }}
    />
  );
};
