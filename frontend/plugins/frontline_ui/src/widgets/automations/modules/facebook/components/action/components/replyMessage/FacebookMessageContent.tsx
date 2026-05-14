import { FieldPath } from 'react-hook-form';
import { FacebookInputMessage } from '~/widgets/automations/modules/facebook/components/action/components/replyMessage/FacebookInputMessage';
import { TBotMessage } from '../../states/replyMessageActionForm';
import { FacebookCardsMessage } from './FacebookCardsMessage';
import { FacebookQuickRepliesMessage } from './FacebookQuickRepliesMessage';
import { FacebookTextMessage } from './FacebookTextMessage';
import { FacebookMessageProps } from '~/widgets/automations/modules/facebook/components/action/types/messageActionForm';

type MessageComponents = {
  [M in TBotMessage as M['type']]: React.ComponentType<{
    index: number;
    message: M;
    handleMessageChange: (
      messageIndex: number,
      field: FieldPath<M>,
      newData: any,
    ) => void;
  }>;
};
export const FacebookMessageContent = ({
  index,
  message,
  handleMessageChange,
}: {
  index: number;
  message: TBotMessage;
  handleMessageChange: (
    messageIndex: number,
    field: FieldPath<TBotMessage>,
    newData: any,
  ) => void;
}) => {
  const updatedProps = {
    index,
    message,
    handleMessageChange,
  } as any;

  const componentMap: MessageComponents = {
    text: FacebookTextMessage,
    card: FacebookCardsMessage,
    quickReplies: FacebookQuickRepliesMessage,
    input: FacebookInputMessage,
    image: ({}: FacebookMessageProps<{ type: 'image' }>) => null,
    audio: ({}: FacebookMessageProps<{ type: 'audio' }>) => null,
    video: ({}: FacebookMessageProps<{ type: 'video' }>) => null,
    attachments: ({}: FacebookMessageProps<{ type: 'attachments' }>) => null,
  };

  const MessageComponent = componentMap[
    message.type
  ] as MessageComponents[TBotMessage['type']];

  return MessageComponent ? <MessageComponent {...updatedProps} /> : null;
};
