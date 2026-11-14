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
import { HandoffActionForm } from './action/HandoffActionForm';
import { HandoffActionConfig } from './action/HandoffActionConfig';
import { AutomationHistoryName } from './AutomationHistoryName';
import { AutomationHistoryResult } from './AutomationHistoryResult';

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
        actionNodeConfiguration: renderActionNodeConfiguration,
        historyName: AutomationHistoryName,
        historyActionResult: AutomationHistoryResult,
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

const isHandoffAction = (type?: string) =>
  splitAutomationNodeType(type || '')[2] === 'handoffs';

function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  if (isHandoffAction(props.currentAction?.type)) {
    return <HandoffActionForm {...props} />;
  }

  return <InboxMessageActionForm {...props} />;
}

function renderActionNodeConfiguration(
  props: AutomationRemoteEntryTypes['actionNodeConfiguration'],
) {
  if (isHandoffAction(props.actionData?.type)) {
    return <HandoffActionConfig {...props} />;
  }

  return <InboxMessageActionConfig {...props} />;
}
