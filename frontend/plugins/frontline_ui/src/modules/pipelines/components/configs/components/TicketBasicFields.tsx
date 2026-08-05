import { TPipelineConfig } from '@/pipelines/types';
import { Control, Path, UseFormReturn, useWatch } from 'react-hook-form';
import { cn, Form, Input, Label, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TICKET_FORM_FIELDS } from '../constant';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import { IconGripVertical } from '@tabler/icons-react';

type TicketFormField = (typeof TICKET_FORM_FIELDS)[number];

const SortableFieldRow = ({
  control,
  ticketField,
}: {
  control: Control<TPipelineConfig>;
  ticketField: TicketFormField;
}) => {
  const { t } = useTranslation('frontline');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticketField.key });

  const isShown = useWatch({
    control,
    name: `formFields.${ticketField.key}.isShow` as Path<TPipelineConfig>,
  });

  return (
    <div
      className={cn(
        'flex flex-col gap-2 py-2.5 first:pt-0 last:pb-0',
        isDragging && 'opacity-50',
      )}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="flex items-center gap-2">
        <button
          aria-label={t(ticketField.label)}
          className="cursor-grab rounded text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
          type="button"
          {...attributes}
          {...listeners}
        >
          <IconGripVertical className="size-4" stroke={1.5} />
        </button>
        <Form.Field
          control={control}
          name={`formFields.${ticketField.key}.isShow` as Path<TPipelineConfig>}
          render={({ field }) => (
            <Form.Item className="flex flex-1 flex-row items-center justify-between gap-4 space-y-0">
              <Form.Label
                className="text-sm font-normal text-foreground"
                variant="peer"
              >
                {t(ticketField.showLabel)}
              </Form.Label>
              <Form.Control>
                <Switch
                  checked={Boolean(field.value)}
                  className="flex-none"
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>

      {Boolean(isShown) && (
        <div className="grid gap-2 pl-6 sm:grid-cols-2">
          <Form.Field
            control={control}
            name={
              `formFields.${ticketField.key}.label` as Path<TPipelineConfig>
            }
            render={({ field }) => (
              <Form.Item className="space-y-0">
                <Form.Label className="sr-only">
                  {t('label-attribute')}
                </Form.Label>
                <Form.Control>
                  <Input
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    placeholder={t('label-attribute')}
                    value={(field.value as string) ?? ''}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name={
              `formFields.${ticketField.key}.placeholder` as Path<TPipelineConfig>
            }
            render={({ field }) => (
              <Form.Item className="space-y-0">
                <Form.Label className="sr-only">
                  {t('placeholder-attribute')}
                </Form.Label>
                <Form.Control>
                  <Input
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    placeholder={t('placeholder-attribute')}
                    value={(field.value as string) ?? ''}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};

type Props = {
  form: UseFormReturn<TPipelineConfig>;
};

export const TicketBasicFields = ({ form }: Props) => {
  const { t } = useTranslation('frontline');
  const { control, setValue } = form;
  const formFields = useWatch({
    control,
    name: 'formFields',
  });

  const [orderedFields, setOrderedFields] = useState(TICKET_FORM_FIELDS);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (formFields) {
      const fieldsWithOrder = TICKET_FORM_FIELDS.map((field) => ({
        ...field,
        order: formFields[field.key as keyof typeof formFields]?.order || 0,
      })).sort((a, b) => a.order - b.order);
      setOrderedFields(fieldsWithOrder);
    }
  }, [formFields]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = orderedFields.findIndex((f) => f.key === active.id);
    const newIndex = orderedFields.findIndex((f) => f.key === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedFields, oldIndex, newIndex);
    setOrderedFields(reordered);

    reordered.forEach((field, index) => {
      setValue(
        `formFields.${field.key}.order` as Path<TPipelineConfig>,
        index + 1,
      );
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Label>{t('edit-fields')}</Label>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedFields.map((field) => field.key)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col divide-y">
            {orderedFields.map((ticketField) => (
              <SortableFieldRow
                control={control}
                key={ticketField.key}
                ticketField={ticketField}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
