import { Badge, Button, Label } from 'erxes-ui';
import { useReplyMessageAction } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';
import { REPLY_MESSAGE_ACTION_BUTTONS } from '../constants/ReplyMessage';
import { MessageActionTypeNames } from '../types/messageActionForm';
export const MessageSequenceHeader = () => {
  const { messages, addMessage } = useReplyMessageAction();

  return (
    <>
      <div className="flex flex-row gap-2 items-center px-6 py-2">
        <Label>Message Sequence</Label>
        <Badge variant="secondary">{`${messages.length} messages`}</Badge>
      </div>
      <div className="inline-flex gap-2 overflow-x-auto w-full p-2  ">
        {REPLY_MESSAGE_ACTION_BUTTONS.map(
          ({ title, type, icon: Icon, inProgress, limit }) => (
            <Button
              key={type}
              variant="outline"
              disabled={
                messages.length >= 5 ||
                inProgress ||
                messages.filter((message) => message.type === type).length ===
                  limit
              }
              onClick={() => addMessage(type as MessageActionTypeNames)}
            >
              <Icon />
              {`Add ${title} ${inProgress ? '( Work in progress )' : ''}`}
            </Button>
          ),
        )}
      </div>
    </>
  );
};
