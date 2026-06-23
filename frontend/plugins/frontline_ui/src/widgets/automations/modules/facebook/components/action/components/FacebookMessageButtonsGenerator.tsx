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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconGripVertical,
  IconLink,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { Button, Card, cn, Input, Popover } from 'erxes-ui';
import React from 'react';
import { generateAutomationElementId } from 'ui-modules';
import { TBotMessageButton } from '../states/replyMessageActionForm';

const renderButtonContent = (
  button: { disableRemoveButton?: boolean } & TBotMessageButton,
  onSave: (e: React.FocusEvent<HTMLInputElement>) => void,
  onChangeButtonText: (e: React.ChangeEvent<HTMLInputElement>) => void,
): React.ReactNode => {
  if (button?.isEditing) {
    return (
      <Input
        autoFocus
        maxLength={20}
        placeholder="Enter button text"
        value={button.text || button.link}
        onBlur={onSave}
        onChange={onChangeButtonText}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
      />
    );
  }
  if (button.link) {
    return (
      <a
        href={button.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-500/70 transition ease-in-out"
      >
        {button.text || button.link}
      </a>
    );
  }
  return (
    <span className="font-mono font-medium text-foreground text-sm">
      {button.text || 'Type a button label'}
    </span>
  );
};

export const FacebookMessageButtonsGenerator = ({
  buttons = [],
  setButtons,
  addButtonContent = (
    <>
      <IconPlus />
      add button
    </>
  ),
  limit,
  ContentBeforeInput,
}: {
  buttons: { disableRemoveButton?: boolean } & TBotMessageButton[];
  setButtons: (buttons: TBotMessageButton[]) => void;
  addButtonContent?: React.ReactNode;
  limit: number;
  ContentBeforeInput?: ({
    button,
    handleChangeButton,
  }: {
    button: {
      disableRemoveButton?: boolean;
      image_url?: string;
    } & TBotMessageButton;
    handleChangeButton: (button: TBotMessageButton) => void;
  }) => React.ReactNode;
}) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = buttons.findIndex((button) => button._id === active.id);
      const newIndex = buttons.findIndex((button) => button._id === over?.id);

      setButtons(arrayMove(buttons, oldIndex, newIndex));
    }
  };

  const handleChangeButton = (btn: TBotMessageButton) => {
    const updatedButtons = buttons.map((button) =>
      button._id === btn._id ? { ...button, ...btn } : button,
    );

    setButtons(updatedButtons);
  };

  const onAddButton = () =>
    setButtons([
      ...buttons,
      {
        _id: generateAutomationElementId(),
        text: '',
        type: 'button',
        isEditing: true,
      },
    ]);

  const onRemovButton = (index: number) => {
    setButtons(buttons.filter((_, buttonIndex) => buttonIndex !== index));
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={buttons.map((button) => button._id)}
          strategy={verticalListSortingStrategy}
        >
          {buttons.map((button: TBotMessageButton, index: number) => (
            <FacebookMessageButton
              key={index}
              button={button}
              handleChangeButton={handleChangeButton}
              onRemovButton={() => onRemovButton(index)}
              ContentBeforeInput={ContentBeforeInput}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button
        variant="secondary"
        className="w-full font-mono uppercase font-semibold text-xs text-accent-foreground"
        disabled={buttons.length >= limit}
        onClick={onAddButton}
      >
        {addButtonContent}
      </Button>
    </>
  );
};

const FacebookMessageButton = ({
  button,
  handleChangeButton,
  onRemovButton,
  ContentBeforeInput,
}: {
  button: { disableRemoveButton?: boolean } & TBotMessageButton;
  handleChangeButton: (button: TBotMessageButton) => void;
  onRemovButton: () => void;
  ContentBeforeInput?: ({
    button,
    handleChangeButton,
  }: {
    button: {
      disableRemoveButton?: boolean;
      image_url?: string;
    } & TBotMessageButton;
    handleChangeButton: (button: TBotMessageButton) => void;
  }) => React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: button._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const onSave = (e: React.FocusEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget as HTMLInputElement;

    e.preventDefault();

    handleChangeButton({ ...button, text: value, isEditing: false });
  };

  const onChangeButtonText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    handleChangeButton({ ...button, text: value });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...(button.isEditing ? {} : { ...attributes })}
      className={
        'px-3 py-2 flex flex-row gap-2 items-center justify-between rounded'
      }
      onDoubleClick={() => handleChangeButton({ ...button, isEditing: true })}
    >
      <div
        {...listeners}
        role="button"
        aria-label="Drag to reorder button"
        tabIndex={button.isEditing ? -1 : 0}
        className={cn(
          'p-2 rounded hover:bg-muted text-accent-foreground',
          button.isEditing
            ? 'cursor-auto'
            : 'cursor-grab  active:cursor-grabbing',
        )}
      >
        <IconGripVertical className="w-4 h-4" />
      </div>
      {ContentBeforeInput ? (
        <ContentBeforeInput
          button={button}
          handleChangeButton={handleChangeButton}
        />
      ) : null}
      <div className="flex-1 border rounded p-2 flex items-center">
        {renderButtonContent(button, onSave, onChangeButtonText)}
      </div>
      <Popover>
        <Popover.Trigger asChild>
          <Button size="icon" variant="link">
            <IconLink />
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <Input
            type="url"
            placeholder="Enter URL"
            value={button.link}
            onChange={(e) =>
              handleChangeButton({ ...button, link: e.target.value })
            }
          />
        </Popover.Content>
      </Popover>
      <Button
        size="icon"
        variant="destructive"
        disabled={button.disableRemoveButton}
        aria-label={`Remove button: ${button.text || 'untitled'}`}
        onClick={onRemovButton}
      >
        <IconX />
      </Button>
    </Card>
  );
};
