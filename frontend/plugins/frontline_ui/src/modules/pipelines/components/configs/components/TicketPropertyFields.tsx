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
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Accordion,
  DragHandle,
  Form,
  Input,
  Label,
  Spinner,
  Switch,
  cn,
} from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IField, useFieldGroups, useFields } from 'ui-modules';
import { TICKET_PROPERTY_CONTENT_TYPE } from '../constant';

type Props = {
  form: UseFormReturn<TPipelineConfig>;
};

type PropertyGroup = {
  _id: string;
  name: string;
  groupFields: IField[];
};

// The properties list is a picker, the platform cursor pagination caps at 100.
const PROPERTY_FIELDS_LIMIT = 100;

// Both drag levels live in one DndContext, so their ids carry what they are.
const GROUP_DRAG_PREFIX = 'group:';
const FIELD_DRAG_PREFIX = 'field:';

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
    insert,
    remove,
    replace,
  } = useFieldArray({
    control,
    name: 'propertyFields',
  });

  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [openGroupIds, setOpenGroupIds] = useState<string[]>([]);
  const seededRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const loading = fieldGroupsLoading || fieldsLoading;

  const groups: PropertyGroup[] = fieldGroups
    .map((group) => ({
      ...group,
      groupFields: fields.filter((field) => field.groupId === group._id),
    }))
    .filter((group) => group.groupFields.length > 0)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const groupIdsKey = groups.map((group) => group._id).join(',');

  // Group order is the user's, so it lives in state: seeded from the saved
  // configuration (groups holding selected properties come first, in the order
  // the saved array puts them), then only ever changed by a drag.
  useEffect(() => {
    if (!groupIdsKey) return;

    const definitionIds = groupIdsKey.split(',');

    if (!seededRef.current) {
      seededRef.current = true;

      const savedIds = (form.getValues('propertyFields') ?? [])
        .map((propertyField) => propertyField.groupId)
        .filter((groupId): groupId is string => !!groupId);
      const seeded = [...new Set(savedIds)].filter((groupId) =>
        definitionIds.includes(groupId),
      );

      setGroupIds([
        ...seeded,
        ...definitionIds.filter((groupId) => !seeded.includes(groupId)),
      ]);
      setOpenGroupIds(definitionIds);
      return;
    }

    setGroupIds((current) => {
      const kept = current.filter((groupId) => definitionIds.includes(groupId));
      const added = definitionIds.filter((groupId) => !kept.includes(groupId));

      return !added.length && kept.length === current.length
        ? current
        : [...kept, ...added];
    });
    setOpenGroupIds((current) => [
      ...current,
      ...definitionIds.filter((groupId) => !current.includes(groupId)),
    ]);
  }, [groupIdsKey, form]);

  const orderedGroups = groupIds
    .map((groupId) => groups.find((group) => group._id === groupId))
    .filter((group): group is PropertyGroup => !!group);

  const indexOfSelected = (fieldId: string) =>
    selectedFields.findIndex((selected) => selected.fieldId === fieldId);

  // A group shows its selected properties first, in the order the form holds
  // them; the rest of the group stays in its property-definition order.
  const selectedIdsOf = (group: PropertyGroup) =>
    group.groupFields
      .filter((field) => indexOfSelected(field._id) > -1)
      .sort((a, b) => indexOfSelected(a._id) - indexOfSelected(b._id))
      .map((field) => field._id);

  const groupOfField = (fieldId: string) =>
    groups.find((group) =>
      group.groupFields.some((field) => field._id === fieldId),
    );

  // Array position is the saved order: the API renumbers `order` and
  // `groupOrder` from it, so a reorder only rewrites positions.
  const flatten = (
    orderedGroupIds: string[],
    fieldIdsByGroup?: Record<string, string[]>,
  ) => {
    const values = form.getValues('propertyFields') ?? [];
    const valueByFieldId = new Map(
      values.map((propertyField) => [propertyField.fieldId, propertyField]),
    );
    const taken = new Set<string>();
    const flattened: typeof values = [];

    orderedGroupIds.forEach((groupId) => {
      const group = groups.find((candidate) => candidate._id === groupId);

      if (!group) return;

      (fieldIdsByGroup?.[groupId] ?? selectedIdsOf(group)).forEach(
        (fieldId) => {
          const value = valueByFieldId.get(fieldId);

          if (!value) return;

          flattened.push(value);
          taken.add(fieldId);
        },
      );
    });

    // Properties whose group or definition is not loaded keep their entry.
    values.forEach((propertyField) => {
      if (!taken.has(propertyField.fieldId)) {
        flattened.push(propertyField);
      }
    });

    return flattened;
  };

  const toggleField = (field: IField, checked: boolean) => {
    const index = indexOfSelected(field._id);

    if (!checked) {
      if (index > -1) {
        remove(index);
      }
      return;
    }

    if (index > -1) {
      return;
    }

    // The property joins the end of its own group's block, which is where the
    // list shows it.
    let insertAt = 0;

    for (const groupId of groupIds) {
      const group = groups.find((candidate) => candidate._id === groupId);

      insertAt += group ? selectedIdsOf(group).length : 0;

      if (groupId === field.groupId) break;
    }

    insert(Math.min(insertAt, selectedFields.length), {
      fieldId: field._id,
      groupId: field.groupId ?? null,
      label: field.name,
      placeholder: '',
      isRequired: !!field.isRequired,
      type: field.type ?? null,
      options: (field.options ?? []).map(({ label, value }) => ({
        label,
        value,
      })),
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith(GROUP_DRAG_PREFIX)) {
      const overGroupId = overId.startsWith(GROUP_DRAG_PREFIX)
        ? overId.slice(GROUP_DRAG_PREFIX.length)
        : groupOfField(overId.slice(FIELD_DRAG_PREFIX.length))?._id;

      const from = groupIds.indexOf(activeId.slice(GROUP_DRAG_PREFIX.length));
      const to = overGroupId ? groupIds.indexOf(overGroupId) : -1;

      if (from === -1 || to === -1 || from === to) return;

      const reordered = arrayMove(groupIds, from, to);

      setGroupIds(reordered);
      replace(flatten(reordered));
      return;
    }

    if (!overId.startsWith(FIELD_DRAG_PREFIX)) return;

    const fieldId = activeId.slice(FIELD_DRAG_PREFIX.length);
    const overFieldId = overId.slice(FIELD_DRAG_PREFIX.length);
    const group = groupOfField(fieldId);

    // A property belongs to its own group, so a drop outside it is ignored.
    if (!group || groupOfField(overFieldId)?._id !== group._id) return;

    const selectedIds = selectedIdsOf(group);
    const from = selectedIds.indexOf(fieldId);
    const to = selectedIds.indexOf(overFieldId);

    if (from === -1 || to === -1) return;

    replace(
      flatten(groupIds, {
        [group._id]: arrayMove(selectedIds, from, to),
      }),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <Label>{t('select-ticket-property-fields')}</Label>
      {loading && <Spinner size="sm" />}
      {!loading && groups.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t('no-ticket-property-fields')}
        </p>
      )}
      {!loading && groups.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedGroups.map(
              (group) => `${GROUP_DRAG_PREFIX}${group._id}`,
            )}
            strategy={verticalListSortingStrategy}
          >
            <Accordion
              className="flex flex-col"
              onValueChange={setOpenGroupIds}
              type="multiple"
              value={openGroupIds}
            >
              {orderedGroups.map((group) => (
                <SortablePropertyGroup
                  key={group._id}
                  form={form}
                  group={group}
                  indexOfSelected={indexOfSelected}
                  onToggleField={toggleField}
                  selectedIds={selectedIdsOf(group)}
                />
              ))}
            </Accordion>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

const SortablePropertyGroup = ({
  form,
  group,
  indexOfSelected,
  onToggleField,
  selectedIds,
}: {
  form: UseFormReturn<TPipelineConfig>;
  group: PropertyGroup;
  indexOfSelected: (fieldId: string) => number;
  onToggleField: (field: IField, checked: boolean) => void;
  selectedIds: string[];
}) => {
  const { t } = useTranslation('frontline');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${GROUP_DRAG_PREFIX}${group._id}` });

  const selectedFields = selectedIds
    .map((fieldId) => group.groupFields.find((field) => field._id === fieldId))
    .filter((field): field is IField => !!field);
  const unselectedFields = group.groupFields.filter(
    (field) => !selectedIds.includes(field._id),
  );

  return (
    <Accordion.Item
      className={cn(isDragging && 'opacity-50')}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      value={group._id}
    >
      <div className="flex items-center gap-2 [&_h3]:flex-1">
        <DragHandle
          aria-label={t('reorder')}
          {...attributes}
          {...listeners}
          className="my-2.5 flex-0"
        />
        <Accordion.Trigger className="py-2.5 flex-1 text-sm hover:no-underline">
          {group.name}
        </Accordion.Trigger>
      </div>
      <Accordion.Content className="flex flex-col divide-y pb-2.5 pl-6 pt-0">
        <SortableContext
          items={selectedIds.map((fieldId) => `${FIELD_DRAG_PREFIX}${fieldId}`)}
          strategy={verticalListSortingStrategy}
        >
          {selectedFields.map((field) => (
            <SelectedPropertyFieldRow
              key={field._id}
              field={field}
              form={form}
              index={indexOfSelected(field._id)}
              onToggle={(checked) => onToggleField(field, checked)}
            />
          ))}
        </SortableContext>
        {unselectedFields.map((field) => (
          <PropertyFieldRow
            key={field._id}
            field={field}
            onToggle={(checked) => onToggleField(field, checked)}
          />
        ))}
      </Accordion.Content>
    </Accordion.Item>
  );
};

const PropertyFieldRow = ({
  field,
  onToggle,
}: {
  field: IField;
  onToggle: (checked: boolean) => void;
}) => (
  <div className="flex items-center gap-2 py-2.5 first:pt-0 last:pb-0">
    <span aria-hidden className="size-5 flex-none" />
    <Label
      className="flex-1 text-sm font-normal text-foreground"
      htmlFor={`propertyFields.${field._id}`}
      variant="peer"
    >
      {field.name}
    </Label>
    <Switch
      checked={false}
      className="flex-none"
      id={`propertyFields.${field._id}`}
      onCheckedChange={onToggle}
    />
  </div>
);

const SelectedPropertyFieldRow = ({
  field,
  form,
  index,
  onToggle,
}: {
  field: IField;
  form: UseFormReturn<TPipelineConfig>;
  index: number;
  onToggle: (checked: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${FIELD_DRAG_PREFIX}${field._id}` });

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
        <DragHandle aria-label={t('reorder')} {...attributes} {...listeners} />
        <Label
          className="flex-1 text-sm font-normal text-foreground"
          htmlFor={`propertyFields.${field._id}`}
          variant="peer"
        >
          {field.name}
        </Label>
        <Switch
          checked
          className="flex-none"
          id={`propertyFields.${field._id}`}
          onCheckedChange={onToggle}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-6">
        <Form.Field
          control={form.control}
          name={`propertyFields.${index}.label`}
          render={({ field: labelField }) => (
            <Form.Item className="min-w-32 flex-1 space-y-0">
              <Form.Label className="sr-only">
                {t('label-attribute')}
              </Form.Label>
              <Form.Control>
                <Input
                  name={labelField.name}
                  onBlur={labelField.onBlur}
                  onChange={labelField.onChange}
                  placeholder={t('label-attribute')}
                  value={labelField.value ?? ''}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`propertyFields.${index}.placeholder`}
          render={({ field: placeholderField }) => (
            <Form.Item className="min-w-32 flex-1 space-y-0">
              <Form.Label className="sr-only">
                {t('placeholder-attribute')}
              </Form.Label>
              <Form.Control>
                <Input
                  name={placeholderField.name}
                  onBlur={placeholderField.onBlur}
                  onChange={placeholderField.onChange}
                  placeholder={t('placeholder-attribute')}
                  value={placeholderField.value ?? ''}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`propertyFields.${index}.isRequired`}
          render={({ field: requiredField }) => (
            <Form.Item className="flex flex-none flex-row items-center gap-2 space-y-0">
              <Form.Label
                className="text-sm font-normal text-muted-foreground"
                variant="peer"
              >
                {t('required-attribute')}
              </Form.Label>
              <Form.Control>
                <Switch
                  checked={!!requiredField.value}
                  className="flex-none"
                  onCheckedChange={requiredField.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>
    </div>
  );
};
