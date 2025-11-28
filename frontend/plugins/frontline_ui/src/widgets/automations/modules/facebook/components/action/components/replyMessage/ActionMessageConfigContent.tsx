import {
  TBotMessage,
  TMessageActionForm,
} from '../../states/replyMessageActionForm';
import { AutomationActionNodeConfigProps, TAutomationAction } from 'ui-modules';
import { TMessageTriggerForm } from '~/widgets/automations/modules/facebook/components/trigger/states/messageTriggerFormSchema';
import { ActionMessageCard } from './ActionMessageCard';

export const ActionMessageConfigContent = ({
  config,
  trigger,
  actionData,
}: AutomationActionNodeConfigProps<
  TMessageActionForm,
  TMessageTriggerForm
>) => {
  const { messages = [] } = config || {};

  const { botId } = trigger?.config || {};

  return (
    <>
      {messages.map((message: TBotMessage) => (
        <ActionConfigMessage
          actionData={actionData}
          key={message._id}
          botId={botId}
          message={message}
        />
      ))}
    </>
  );
};

const ActionConfigMessage = ({
  botId,
  message,
  actionData,
}: {
  botId?: string;
  message: TBotMessage;
  actionData: TAutomationAction<TMessageActionForm>;
}) => {
  const { _id, type } = message;
  switch (type) {
    case 'text':
      return (
        <ActionMessageCard
          _id={_id}
          type={type}
          text={message.text}
          buttons={message.buttons}
          actionData={actionData}
        />
      );
    case 'card':
      return (message?.cards || []).map((card) => (
        <ActionMessageCard
          key={card._id}
          type={type}
          actionData={actionData}
          _id={card._id}
          title={card.title}
          subtitle={card.subtitle}
          buttons={card.buttons}
        />
      ));
    case 'quickReplies':
      return (
        <ActionMessageCard
          _id={_id}
          type={type}
          actionData={actionData}
          text={message.text}
          buttons={message.quickReplies}
        />
      );
    // case 'image':
    //   return renderCard({ image });
    // case 'video':
    //   return renderCard({ video });
    // case 'audio':
    //   return renderCard({ audio });
    // case 'attachments':
    //   return renderCard({ attachments });
    case 'input':
      if (!botId) {
        return (
          <ActionMessageCard
            _id={_id}
            type={type}
            actionData={actionData}
            text="This action must be part of a chain that starts with a trigger"
          />
        );
      }
      return (
        <ActionMessageCard
          _id={_id}
          type={type}
          actionData={actionData}
          text={message.input?.text}
          subtitle={`Input expires in: ${message.input?.value || 0} ${
            message.input?.type || ''
          }`}
          buttons={[
            { _id: botId, text: 'If Reply' },
            { _id: 'ifNotReply', text: 'If Not Reply' },
          ]}
        />
      );

    default:
      return null;
  }
};
