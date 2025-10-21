import { IconChevronDown, IconLink } from '@tabler/icons-react';
import { Button, Collapsible, readImage } from 'erxes-ui';
import { Link } from 'react-router';
import { REPLY_MESSAGE_ACTION_BUTTONS } from '../../constants/ReplyMessage';
import {
  TBotMessage,
  TMessageActionForm,
} from '../../states/replyMessageActionForm';
import { AutomationActionNodeConfigProps, TAutomationAction } from 'ui-modules';
import { TMessageTriggerForm } from '~/widgets/automations/modules/facebook/components/trigger/states/messageTriggerFormSchema';
import { useAutomationOptionalConnect } from 'ui-modules/modules/automations/hooks/useAutomationOptionalConnect';

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
  if (message.type === 'text') {
  }
  const { _id, type } = message;
  switch (type) {
    case 'text':
      return (
        <ActionConfigMessageCard
          _id={_id}
          type={type}
          text={message.text}
          buttons={message.buttons}
          actionData={actionData}
        />
      );
    case 'card':
      return message.cards.map((card) => (
        <ActionConfigMessageCard
          key={card._id}
          type={type}
          actionData={actionData}
          {...card}
        />
      ));
    case 'quickReplies':
      return (
        <ActionConfigMessageCard
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
          <ActionConfigMessageCard
            _id={_id}
            type={type}
            actionData={actionData}
            text="This action must be part of a chain that starts with a trigger"
          />
        );
      }
      return (
        <ActionConfigMessageCard
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

const ActionConfigMessageCard = ({
  _id,
  type,
  actionData,
  text = '',
  title = '',
  subtitle = '',
  buttons = [],
}: // image = '',
// audio = '',
// video = '',
// attachments = [],
{
  _id: string;
  type: string;
  text?: string;
  title?: string;
  subtitle?: string;
  buttons?: any[];
  image?: string;
  audio?: string;
  video?: string;
  attachments?: any[];
  actionData: TAutomationAction<TMessageActionForm>;
}) => {
  const OptionConnectHandle = useAutomationOptionalConnect({
    id: actionData.id,
  });
  const { title: actionButtonTitle, icon: ActionButtonIcon } =
    REPLY_MESSAGE_ACTION_BUTTONS.find(
      ({ type: btnType }) => btnType === type,
    ) || {};

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Collapsible onClick={(e) => e.stopPropagation()}>
        <Collapsible.Trigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2 items-center">
              {ActionButtonIcon && <ActionButtonIcon />}
              {actionButtonTitle}
            </div>
            <IconChevronDown />
          </Button>
        </Collapsible.Trigger>
        <Collapsible.Content className="px-6">
          <p>{text || title}</p>
          <span>{subtitle}</span>
        </Collapsible.Content>
      </Collapsible>
      {buttons.map(({ _id, text, link, image_url }) => (
        <div
          key={`${_id}-right`}
          className="relative bg-background shadow text-xs font-semibold rounded-xs m-2 p-2 text-mono"
        >
          {image_url ? (
            <img
              className="w-6 h-6 rounded-full mr-2"
              src={readImage(image_url)}
              alt={image_url}
            />
          ) : null}
          {text}
          {link ? (
            <Link to={link} target="_blank">
              <IconLink />
            </Link>
          ) : (
            <OptionConnectHandle optionalId={_id} />
          )}
        </div>
      ))}
    </div>
  );
};
