import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { Button, Card, Collapsible, Separator } from 'erxes-ui';
import { FieldPath } from 'react-hook-form';
import { REPLY_MESSAGE_ACTION_BUTTONS } from '../constants/ReplyMessage';
import { TBotMessage } from '../states/replyMessageActionForm';
import { FacebookMessageContent } from '~/widgets/automations/modules/facebook/components/action/components/FacebookMessageContent';

export const FacebookBotMessage = ({
  index,
  message,
  onRemove,
  handleMessageChange,
}: {
  index: number;
  message: TBotMessage;
  onRemove: (index: number) => void;
  handleMessageChange: (
    messageIndex: number,
    field: FieldPath<TBotMessage>,
    newData: any,
  ) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: message._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { title = '', icon: Icon = () => null } =
    REPLY_MESSAGE_ACTION_BUTTONS.find(({ type }) => message.type === type) ||
    {};

  return (
    <Card ref={setNodeRef} style={style} {...attributes} className="mt-4 ">
      <Collapsible>
        <Collapsible.Trigger asChild>
          <Card.Title className="flex flex-row gap-2 p-4 text-lg items-center cursor-ns-resize">
            <div
              {...listeners}
              className="cursor-grab hover:bg-gray-100 active:cursor-grabbing p-2 rounded text-accent-foreground"
            >
              <IconGripVertical className="w-4 h-4" />
            </div>
            <div className="flex-1 flex flex-row gap-2 items-center">
              {Icon && <Icon />} {`${title} Message`}
            </div>
            <div className="flex flex-row gap-2">
              <Button
                size="icon"
                variant="destructive"
                onClick={() => onRemove(index)}
              >
                <IconTrash />
              </Button>
            </div>
          </Card.Title>
        </Collapsible.Trigger>
        <Separator />
        <Collapsible.Content>
          <Card.Content className="pt-4">
            <FacebookMessageContent
              index={index}
              message={message}
              handleMessageChange={handleMessageChange}
            />
          </Card.Content>
        </Collapsible.Content>
      </Collapsible>
    </Card>
  );
};
