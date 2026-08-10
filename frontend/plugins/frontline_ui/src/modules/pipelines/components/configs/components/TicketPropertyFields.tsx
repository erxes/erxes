import { TPipelineConfig } from '@/pipelines/types';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Card,
  Collapsible,
  Form,
  InfoCard,
  Input,
  Label,
  Spinner,
  Switch,
} from 'erxes-ui';
import { useState } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IField, useFieldGroups, useFields } from 'ui-modules';
import { TICKET_PROPERTY_CONTENT_TYPE } from '../constant';

type Props = {
  form: UseFormReturn<TPipelineConfig>;
};

// The properties list is a picker, the platform cursor pagination caps at 100.
const PROPERTY_FIELDS_LIMIT = 100;

export const TicketPropertyFields = ({ form }: Props) => {
  const { t } = useTranslation('frontline');
  const { control } = form;

  const { fieldGroups, loading: fieldGroupsLoading } = useFieldGroups({
    contentType: TICKET_PROPERTY_CONTENT_TYPE,
    limit: PROPERTY_FIELDS_LIMIT,
  });
  const { fields, loading: fieldsLoading } = useFields({
    contentType: TICKET_PROPERTY_CONTENT_TYPE,
    limit: PROPERTY_FIELDS_LIMIT,
  });

  const {
    fields: selectedFields,
    append,
    remove,
    move,
  } = useFieldArray({
    control,
    name: 'propertyFields',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const loading = fieldGroupsLoading || fieldsLoading;

  const groups = fieldGroups
    .map((group) => ({
      ...group,
      groupFields: fields.filter((field) => field.groupId === group._id),
    }))
    .filter((group) => group.groupFields.length > 0)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const toggleField = (field: IField, checked: boolean) => {
    const index = selectedFields.findIndex(
      (selected) => selected.fieldId === field._id,
    );

    if (!checked) {
      if (index > -1) {
        remove(index);
      }
      return;
    }

    if (index > -1) {
      return;
    }

    append({
      fieldId: field._id,
      groupId: field.groupId ?? null,
      label: field.name,
      placeholder: '',
      isRequired: !!field.isRequired,
      order: selectedFields.length + 1,
      type: field.type ?? null,
      options: (field.options ?? []).map(({ label, value }) => ({
        label,
        value,
      })),
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = selectedFields.findIndex((f) => f.id === active.id);
    const newIndex = selectedFields.findIndex((f) => f.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    move(oldIndex, newIndex);
  };

  const getFieldName = (fieldId: string) =>
    fields.find((field) => field._id === fieldId)?.name || fieldId;

  return (
    <>
      <InfoCard
        title={t('select-ticket-property-fields')}
        description={t('select-ticket-property-fields-description')}
      >
        <InfoCard.Content>
          {loading && <Spinner size="sm" />}
          {!loading && groups.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('no-ticket-property-fields')}
            </p>
          )}
          {!loading &&
            groups.map((group) => (
              <PropertyGroup
                key={group._id}
                name={group.name}
                groupFields={group.groupFields}
                selectedFieldIds={selectedFields.map(
                  (selected) => selected.fieldId,
                )}
                onToggleField={toggleField}
              />
            ))}
        </InfoCard.Content>
      </InfoCard>
      {selectedFields.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t('edit-property-fields')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('edit-property-fields-description')}
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedFields.map((selected) => selected.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-4">
                {selectedFields.map((selected, index) => (
                  <SortablePropertyFieldCard
                    key={selected.id}
                    id={selected.id}
                    index={index}
                    name={getFieldName(selected.fieldId)}
                    form={form}
                    onRemove={() => remove(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </>
  );
};

const PropertyGroup = ({
  name,
  groupFields,
  selectedFieldIds,
  onToggleField,
}: {
  name: string;
  groupFields: IField[];
  selectedFieldIds: string[];
  onToggleField: (field: IField, checked: boolean) => void;
}) => {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Collapsible.TriggerButton type="button">
        <Collapsible.TriggerIcon className="size-3" />
        {name}
      </Collapsible.TriggerButton>
      <Collapsible.Content className="flex flex-col gap-3 pt-2 pl-4">
        {groupFields.map((field) => (
          <div key={field._id} className="flex items-center gap-2">
            <Switch
              id={`propertyFields.${field._id}`}
              checked={selectedFieldIds.includes(field._id)}
              onCheckedChange={(checked) => onToggleField(field, checked)}
            />
            <Label variant="peer" htmlFor={`propertyFields.${field._id}`}>
              {field.name}
            </Label>
          </div>
        ))}
      </Collapsible.Content>
    </Collapsible>
  );
};

const SortablePropertyFieldCard = ({
  id,
  index,
  name,
  form,
  onRemove,
}: {
  id: string;
  index: number;
  name: string;
  form: UseFormReturn<TPipelineConfig>;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <Card.Content className="space-y-4">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <IconGripVertical size={20} className="text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold flex-auto">{name}</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label={t('remove')}
          >
            <IconTrash className="size-4 text-destructive" />
          </Button>
        </div>
        <Form.Field
          control={form.control}
          name={`propertyFields.${index}.label`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('label-attribute')}</Form.Label>
              <Form.Control>
                <Input
                  name={field.name}
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`propertyFields.${index}.placeholder`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('placeholder-attribute')}</Form.Label>
              <Form.Control>
                <Input
                  name={field.name}
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`propertyFields.${index}.isRequired`}
          render={({ field }) => (
            <Form.Item className="flex items-center gap-2">
              <Form.Control>
                <Switch
                  id={`propertyFields.${index}.isRequired`}
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <Label
                variant="peer"
                htmlFor={`propertyFields.${index}.isRequired`}
              >
                {t('required-attribute')}
              </Label>
            </Form.Item>
          )}
        />
      </Card.Content>
    </Card>
  );
};
