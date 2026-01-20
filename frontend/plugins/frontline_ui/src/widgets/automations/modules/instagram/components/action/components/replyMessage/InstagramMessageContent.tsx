import { FieldPath } from 'react-hook-form';
import { InstagramInputMessage } from '~/widgets/automations/modules/instagram/components/action/components/replyMessage/InstagramInputMessage';
import { TBotMessage } from '../../states/replyMessageActionForm';
import { InstagramCardsMessage } from './InstagramCardsMessage';
import { InstagramQuickRepliesMessage } from './InstagramQuickRepliesMessage';
import { InstagramTextMessage } from './InstagramTextMessage';
import { InstagramMessageProps } from '~/widgets/automations/modules/instagram/components/action/types/messageActionForm';

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
export const InstagramMessageContent = ({
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
    text: InstagramTextMessage,
    card: InstagramCardsMessage,
    quickReplies: InstagramQuickRepliesMessage,
    input: InstagramInputMessage,
    image: ({}: InstagramMessageProps<{ type: 'image' }>) => null,
    audio: ({}: InstagramMessageProps<{ type: 'audio' }>) => null,
    video: ({}: InstagramMessageProps<{ type: 'video' }>) => null,
    attachments: ({}: InstagramMessageProps<{ type: 'attachments' }>) => null,
  };

  const MessageComponent = componentMap[
    message.type
  ] as MessageComponents[TBotMessage['type']];

  return MessageComponent ? <MessageComponent {...updatedProps} /> : null;
};
