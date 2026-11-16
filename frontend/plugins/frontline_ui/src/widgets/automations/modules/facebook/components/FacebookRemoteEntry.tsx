import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
  splitAutomationNodeType,
} from 'ui-modules';
import { ActionMessageConfigContent } from './action/components/replyMessage/ActionMessageConfigContent';
import { MessageActionForm } from './action/components/replyMessage/MessageActionForm';
import { MessageTriggerForm } from './trigger/components/message/MessageTriggerForm';
import { TriggerConfigContent } from './trigger/components/summary/TriggerConfigContent';
import { AutomationBotsRecordTable } from './bots/components/automationBotsRecordTable';
import { AutomationHistoryName } from '~/widgets/automations/modules/facebook/components/AutomationHistoryName';
import { AutomationHistoryResult } from '~/widgets/automations/modules/facebook/components/AutomationHistoryResult';
import { CommentTriggerForm } from '~/widgets/automations/modules/facebook/components/trigger/components/comment/CommentTriggerForm';
import { CommentActionForm } from '~/widgets/automations/modules/facebook/components/action/components/replyComment/CommentActionForm';
import { ActionCommentConfigContent } from '~/widgets/automations/modules/facebook/components/action/components/replyComment/ActionCommentConfigContent';
import { FacebookTemplateRequirement } from '~/widgets/automations/modules/facebook/components/template/FacebookTemplateRequirement';

export const FacebookRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: renderActionForm,
        triggerForm: renderTriggerForm,
        triggerConfigContent: TriggerConfigContent,
        actionNodeConfiguration: renderActionNodeContent,
        automationBotsContent: AutomationBotsRecordTable,
        historyName: AutomationHistoryName,
        historyActionResult: AutomationHistoryResult,
        templateRequirement: FacebookTemplateRequirement,
      }}
    />
  );
};

function renderActionNodeContent(
  props: AutomationRemoteEntryTypes['actionNodeConfiguration'],
) {
  const actionType = props?.type || '';
  const [_pluginName, _moduleName, contentType] =
    splitAutomationNodeType(actionType);

  switch (contentType) {
    // Messaging a record's customer edits and reads like a Messenger reply
    case 'messages':
    case 'customerMessages':
      return <ActionMessageConfigContent {...props} />;
    case 'comments':
      return <ActionCommentConfigContent {...props} />;
    default:
      return null;
  }
}

function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  const actionType = props.currentAction?.type || '';
  const [_pluginName, _moduleName, contentType] =
    splitAutomationNodeType(actionType);

  switch (contentType) {
    case 'messages':
    case 'customerMessages':
      return <MessageActionForm {...props} />;
    case 'comments':
      return <CommentActionForm {...props} />;
    default:
      return null;
  }
}

function renderTriggerForm(props: AutomationRemoteEntryTypes['triggerForm']) {
  const triggerType = props.activeTrigger?.type || '';
  const [_pluginName, _moduleName, contentType] =
    splitAutomationNodeType(triggerType);

  switch (contentType) {
    case 'messages':
      return <MessageTriggerForm {...props} />;
    case 'comments':
      return <CommentTriggerForm {...props} />;
    default:
      return null;
  }
}
