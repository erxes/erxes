import { FacebookInputMessage } from '~/widgets/automations/modules/facebook/components/action/components/replyMessage/FacebookInputMessage';
import { TBotMessage } from '../../states/replyMessageActionForm';
import { FacebookCardsMessage } from './FacebookCardsMessage';
import { FacebookMediaMessage } from './FacebookMediaMessage';
import { FacebookQuickRepliesMessage } from './FacebookQuickRepliesMessage';
import { FacebookTextMessage } from './FacebookTextMessage';

export const FacebookMessageContent = ({
  index,
  message,
}: {
  index: number;
  message: TBotMessage;
}) => {
  switch (message.type) {
    case 'text':
      return <FacebookTextMessage index={index} message={message} />;
    case 'card':
      return <FacebookCardsMessage index={index} message={message} />;
    case 'quickReplies':
      return <FacebookQuickRepliesMessage index={index} message={message} />;
    case 'input':
      return <FacebookInputMessage index={index} message={message} />;
    case 'image':
    case 'audio':
    case 'video':
    case 'attachments':
      return <FacebookMediaMessage index={index} message={message} />;
    default:
      return null;
  }
};
