import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FieldPath } from 'react-hook-form';
import { useReplyMessageAction } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';
import { TBotMessage } from '../states/replyMessageActionForm';
import { FacebookBotMessage } from '~/widgets/automations/modules/facebook/components/action/components/FacebookBotMessage';

export const FacebookMessages = () => {
  const { setValue, messages } = useReplyMessageAction();
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = messages.findIndex(
        (message) => message._id === active.id,
      );
      const newIndex = messages.findIndex(
        (message) => message._id === over?.id,
      );

      setValue('messages', arrayMove(messages, oldIndex, newIndex));
    }
  };

  const onRemove = (index: number) => {
    setValue(
      'messages',
      messages.filter((_, messageIndex) => messageIndex !== index),
    );
  };

  const handleMessageChange = (
    messageIndex: number,
    field: FieldPath<TBotMessage>,
    newData: any,
  ) => {
    setValue(`messages.${messageIndex}.${field}`, newData);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={messages.map((message) => message._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="px-4">
          {messages.map((message, index) => (
            <FacebookBotMessage
              key={message._id}
              index={index}
              message={message}
              onRemove={onRemove}
              handleMessageChange={handleMessageChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
