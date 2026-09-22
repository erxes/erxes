import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
  splitAutomationNodeType,
} from 'ui-modules';
import { DiscordActionForm } from './action/DiscordActionForm';
import { DiscordTriggerForm } from './trigger/DiscordTriggerForm';

/** Remote entry that routes Discord automation trigger/action forms. */
export const DiscordRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: renderActionForm,
        triggerForm: renderTriggerForm,
      }}
    />
  );
};

/** Render the Discord action form for a "messages" content type. */
function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  const actionType = props.currentAction?.type || '';
  const [, , contentType] = splitAutomationNodeType(actionType);

  return contentType === 'messages' ? <DiscordActionForm {...props} /> : null;
}

/** Render the Discord trigger form for a "messages" content type. */
function renderTriggerForm(props: AutomationRemoteEntryTypes['triggerForm']) {
  const triggerType = props.activeTrigger?.type || '';
  const [, , contentType] = splitAutomationNodeType(triggerType);

  return contentType === 'messages' ? <DiscordTriggerForm {...props} /> : null;
}
