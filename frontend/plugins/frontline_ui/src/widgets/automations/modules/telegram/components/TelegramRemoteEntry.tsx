import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
  splitAutomationNodeType,
} from 'ui-modules';
import { TelegramActionForm } from './action/TelegramActionForm';
import { TelegramTriggerForm } from './trigger/TelegramTriggerForm';

/** Remote entry that routes Telegram automation trigger/action forms. */
export const TelegramRemoteEntry = (props: AutomationRemoteEntryProps) => {
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

/** Render the Telegram action form for a "messages" content type. */
function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  const actionType = props.currentAction?.type || '';
  const [, , contentType] = splitAutomationNodeType(actionType);

  return contentType === 'messages' ? <TelegramActionForm {...props} /> : null;
}

/** Render the Telegram trigger form for a "messages" content type. */
function renderTriggerForm(props: AutomationRemoteEntryTypes['triggerForm']) {
  const triggerType = props.activeTrigger?.type || '';
  const [, , contentType] = splitAutomationNodeType(triggerType);

  return contentType === 'messages' ? <TelegramTriggerForm {...props} /> : null;
}
