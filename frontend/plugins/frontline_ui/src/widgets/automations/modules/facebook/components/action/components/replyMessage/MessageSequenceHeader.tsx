import { Badge, Button, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useReplyMessageAction } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';
import { REPLY_MESSAGE_ACTION_BUTTONS } from '../../constants/ReplyMessage';

export const MessageSequenceHeader = () => {
  const { t } = useTranslation('frontline');
  const { messages, addMessage } = useReplyMessageAction();

  return (
    <>
      <div className="flex flex-row gap-2 items-center px-6 py-2">
        <Label>{t('message-sequence')}</Label>
        <Badge variant="secondary">{t('n-messages', { count: messages.length })}</Badge>
      </div>
      <div className="inline-flex gap-2 overflow-x-auto w-full p-2  ">
        {REPLY_MESSAGE_ACTION_BUTTONS.map(
          ({ title, type, icon: Icon, limit }) => (
            <Button
              key={type}
              variant="outline"
              disabled={
                messages.length >= 5 ||
                messages.filter((message) => message.type === type).length ===
                  limit
              }
              onClick={() => addMessage(type)}
            >
              <Icon />
              {`Add ${title}`}
            </Button>
          ),
        )}
      </div>
    </>
  );
};
