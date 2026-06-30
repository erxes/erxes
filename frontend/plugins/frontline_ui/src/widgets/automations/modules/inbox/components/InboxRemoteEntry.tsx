import { lazy } from 'react';
import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
  splitAutomationNodeType,
} from 'ui-modules';
import { InboxMessageTriggerForm } from './trigger/InboxMessageTriggerForm';
import { MessengerMessageTriggerNodeContent } from './trigger/MessengerMessageTriggerNodeContent';
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
        triggerForm: renderTriggerForm,
        triggerConfigContent: renderTriggerConfigContent,
        actionForm: renderActionForm,
        actionNodeConfiguration: InboxMessageActionConfig,
      }}
    />
  );
};

function renderTriggerForm(props: AutomationRemoteEntryTypes['triggerForm']) {
  const triggerType = props.activeTrigger?.type || '';
  const [, , collectionType] = splitAutomationNodeType(triggerType);

  if (collectionType === 'messages') {
    return <InboxMessageTriggerForm {...props} />;
  }

  return <ConversationEventTriggerForm {...props} />;
}

function renderTriggerConfigContent(
  props: AutomationRemoteEntryTypes['triggerConfigContent'],
) {
  const [, , collectionType] = splitAutomationNodeType(props.type || '');

  if (collectionType === 'messages') {
    return <MessengerMessageTriggerNodeContent {...props} />;
  }

  return <ConversationEventTriggerNodeContent {...props} />;
}

function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  return <InboxMessageActionForm {...props} />;
}
