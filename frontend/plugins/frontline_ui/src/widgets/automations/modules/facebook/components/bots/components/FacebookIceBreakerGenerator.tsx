import {
  closestCenter,
  DndContext,
  DragEndEvent,
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
import { IconGripVertical, IconPlus, IconX } from '@tabler/icons-react';
import { Button, Card, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { generateAutomationElementId } from 'ui-modules';
import { TFacebookBotForm } from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotForm';
import { FACEBOOK_ICE_BREAKER_QUESTION_LIMIT } from '~/widgets/automations/modules/facebook/components/bots/utils/buildMessengerProfilePreview';

type TIceBreaker = NonNullable<TFacebookBotForm['iceBreakers']>[number];

export const FacebookIceBreakerGenerator = ({
  iceBreakers = [],
  setIceBreakers,
  limit,
}: {
  iceBreakers: TIceBreaker[];
  setIceBreakers: (iceBreakers: TIceBreaker[]) => void;
  limit: number;
}) => {
  const { t } = useTranslation('frontline');
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    setIceBreakers(
      arrayMove(
        iceBreakers,
        iceBreakers.findIndex((item) => item._id === active.id),
        iceBreakers.findIndex((item) => item._id === over.id),
      ),
    );
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={iceBreakers.map((item) => item._id)}
          strategy={verticalListSortingStrategy}
        >
          {iceBreakers.map((iceBreaker) => (
            <FacebookIceBreakerRow
              key={iceBreaker._id}
              iceBreaker={iceBreaker}
              onChange={(updated) =>
                setIceBreakers(
                  iceBreakers.map((item) =>
                    item._id === updated._id ? updated : item,
                  ),
                )
              }
              onRemove={() =>
                setIceBreakers(
                  iceBreakers.filter((item) => item._id !== iceBreaker._id),
                )
              }
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button
        variant="secondary"
        className="w-full font-mono text-xs font-semibold uppercase text-accent-foreground"
        disabled={iceBreakers.length >= limit}
        onClick={() =>
          setIceBreakers([
            ...iceBreakers,
            { _id: generateAutomationElementId(), question: '' },
          ])
        }
      >
        <IconPlus />
        {t('add-ice-breaker', { defaultValue: 'Add ice breaker' })}
      </Button>
    </div>
  );
};

const FacebookIceBreakerRow = ({
  iceBreaker,
  onChange,
  onRemove,
}: {
  iceBreaker: TIceBreaker;
  onChange: (iceBreaker: TIceBreaker) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: iceBreaker._id });

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      className="flex flex-row items-center gap-2 rounded px-3 py-2"
    >
      <div
        {...listeners}
        role="button"
        aria-label="Drag to reorder ice breaker"
        tabIndex={0}
        className="cursor-grab rounded p-2 text-accent-foreground hover:bg-muted active:cursor-grabbing"
      >
        <IconGripVertical className="h-4 w-4" />
      </div>
      <Input
        maxLength={FACEBOOK_ICE_BREAKER_QUESTION_LIMIT}
        placeholder={t('ice-breaker-placeholder', {
          defaultValue: 'A question a visitor might tap',
        })}
        value={iceBreaker.question}
        onChange={(event) =>
          onChange({ ...iceBreaker, question: event.currentTarget.value })
        }
      />
      <Button
        size="icon"
        variant="destructive"
        aria-label={`Remove ice breaker: ${iceBreaker.question || 'untitled'}`}
        onClick={onRemove}
      >
        <IconX />
      </Button>
    </Card>
  );
};
