import { TPipelineConfig } from '@/pipelines/types';
import { Path, useFieldArray, UseFormReturn, useWatch } from 'react-hook-form';
import { Card, cn, Form, InfoCard, Input, Label, Switch } from 'erxes-ui';
import { TICKET_FORM_FIELDS } from '../constant';
import { AnimatePresence } from 'framer-motion';
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

type Props = {
  form: UseFormReturn<TPipelineConfig>;
};

export const TicketBasicFields = ({ form }: Props) => {
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

  const hasSomeTrue = Object.values(formFields || {}).some(
    (value) => value?.isShow === true,
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
    <>
      <InfoCard
        title="Select Ticket Basic Fields"
        description="Select the fields from the ticket to show in the pipeline form"
      >
        <InfoCard.Content>
          {TICKET_FORM_FIELDS.map((basicField) => (
            <div key={`formFields.${basicField.key}.isShow`}>
              <Form.Field
                control={control}
                name={
                  `formFields.${basicField.key}.isShow` as Path<TPipelineConfig>
                }
                render={({ field }) => {
                  return (
                    <Form.Item className="flex items-center gap-2">
                      <Form.Control>
                        <Switch
                          id={`formFields.${basicField.key}.isShow`}
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </Form.Control>
                      <Label
                        variant="peer"
                        htmlFor={`formFields.${basicField.key}.isShow`}
                      >
                        {basicField.label}
                      </Label>
                    </Form.Item>
                  );
                }}
              />
              {/* Under construction */}
            </div>
          ))}
        </InfoCard.Content>
      </InfoCard>
      <AnimatePresence mode="popLayout">
        {hasSomeTrue && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Edit Fields</h2>
            <p className="text-sm text-muted-foreground">
              Design the fields to show in the pipeline form. Drag to reorder.
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedFields
                  .filter(
                    (f) =>
                      formFields?.[f.key as keyof typeof formFields]?.isShow ===
                      true,
                  )
                  .map((f) => f.key)}
                strategy={verticalListSortingStrategy}
              >
                <div data-container="true" className="flex flex-col gap-4">
                  {orderedFields
                    .filter(
                      (f) =>
                        formFields?.[f.key as keyof typeof formFields]
                          ?.isShow === true,
                    )
                    .map((ticketField) => (
                      <SortableFieldCard
                        key={`formFields.${ticketField.key}`}
                        ticketField={ticketField}
                        control={control}
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

interface SortableFieldCardProps {
  ticketField: { key: string; label: string; path: string };
  control: any;
}

function SortableFieldCard({ ticketField, control }: SortableFieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticketField.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} title={ticketField.label}>
      <Card.Content className="space-y-4">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <IconGripVertical size={20} className="text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold">{ticketField.label}</h3>
        </div>
        <Form.Field
          control={control}
          name={
            `formFields.${ticketField.key}.placeholder` as Path<TPipelineConfig>
          }
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Placeholder attribute</Form.Label>
              <Form.Control>
                <Input
                  name={field.name}
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name={`formFields.${ticketField.key}.label` as Path<TPipelineConfig>}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Label attribute</Form.Label>
              <Form.Control>
                <Input
                  name={field.name}
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </Card.Content>
    </Card>
  );
}
