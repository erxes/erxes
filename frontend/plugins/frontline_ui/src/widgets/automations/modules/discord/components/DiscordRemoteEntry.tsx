import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
  splitAutomationNodeType,
} from 'ui-modules';
import { DiscordActionForm } from './action/DiscordActionForm';
import { DiscordTriggerForm } from './trigger/DiscordTriggerForm';

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

function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  const actionType = props.currentAction?.type || '';
  const [, , contentType] = splitAutomationNodeType(actionType);

  return contentType === 'messages' ? <DiscordActionForm {...props} /> : null;
}

function renderTriggerForm(props: AutomationRemoteEntryTypes['triggerForm']) {
  const triggerType = props.activeTrigger?.type || '';
  const [, , contentType] = splitAutomationNodeType(triggerType);

  return contentType === 'messages' ? <DiscordTriggerForm {...props} /> : null;
}
