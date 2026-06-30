import { Button, Collapsible, cn } from 'erxes-ui';
import { IconGripVertical } from '@tabler/icons-react';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FieldDefinition } from '../../posts/CustomFieldInput';
import { useCustomFieldOrdering } from '../hooks/useCustomFieldOrdering';

export interface ReorderableFieldGroup {
  _id: string;
  label: string;
  fields?: FieldDefinition[];
}

interface ReorderableCustomFieldsProps {
  fieldGroups: ReorderableFieldGroup[];
  websiteId?: string;
  renderField: (
    field: FieldDefinition,
    group: ReorderableFieldGroup,
  ) => ReactNode;
}

type DragHandleProps = React.HTMLAttributes<HTMLElement>;

function Sortable({
  id,
  children,
}: Readonly<{
  id: string;
  children: (dragHandleProps: DragHandleProps) => ReactNode;
}>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && 'opacity-50')}
    >
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

function FieldList({
  group,
  renderField,
  onReorderFields,
}: Readonly<{
  group: ReorderableFieldGroup;
  renderField: ReorderableCustomFieldsProps['renderField'];
  onReorderFields: (groupId: string, fields: FieldDefinition[]) => void;
}>) {
  const groupFields = group.fields || [];

  // Local order so a drop reflects immediately (no snap-back while the
  // persisted order round-trips); re-synced whenever the stored order changes.
  const [fields, setFields] = useState(groupFields);
  const fieldsKey = groupFields.map((f) => f._id).join('|');
  useEffect(() => {
    setFields(group.fields || []);
  }, [fieldsKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f._id === active.id);
    const newIndex = fields.findIndex((f) => f._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(fields, oldIndex, newIndex);
    setFields(next);
    onReorderFields(group._id, next);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((f) => f._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid gap-4 grid-cols-1">
          {fields.map((field) => (
            <Sortable key={field._id} id={field._id}>
              {(dragHandleProps) => (
                <div className="flex items-start gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-6 size-7 shrink-0 text-muted-foreground cursor-grab active:cursor-grabbing"
                    {...dragHandleProps}
                  >
                    <IconGripVertical />
                  </Button>
                  <div className="min-w-0 flex-1">
                    {renderField(field, group)}
                  </div>
                </div>
              )}
            </Sortable>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/**
 * Renders custom field groups and their fields on a content detail editor with
 * drag-to-reorder for both groups and the fields inside each group. The actual
 * field input is provided by the caller via `renderField`, so each editor keeps
 * its own value-binding/validation while sharing the reorder chrome.
 */
export const ReorderableCustomFields = ({
  fieldGroups,
  websiteId,
  renderField,
}: ReorderableCustomFieldsProps) => {
  const { t } = useTranslation('content');
  const { reorderVisibleGroups, reorderFields } =
    useCustomFieldOrdering(websiteId);

  // Local order so a drop reflects immediately (no snap-back while the
  // persisted order round-trips); re-synced whenever the stored order changes.
  const [groups, setGroups] = useState(fieldGroups);
  const groupsKey = fieldGroups.map((g) => g._id).join('|');
  useEffect(() => {
    setGroups(fieldGroups);
  }, [groupsKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleGroupDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = groups.findIndex((g) => g._id === active.id);
    const newIndex = groups.findIndex((g) => g._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(groups, oldIndex, newIndex);
    setGroups(next);
    reorderVisibleGroups(next);
  };

  return (
    <div className="space-y-3 mt-6 pt-6 border-t">
      <div className="text-sm font-semibold text-foreground">{t('custom-fields')}</div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleGroupDragEnd}
      >
        <SortableContext
          items={groups.map((g) => g._id)}
          strategy={verticalListSortingStrategy}
        >
          {groups.map((group) => (
            <Sortable key={group._id} id={group._id}>
              {(dragHandleProps) => (
                <Collapsible defaultOpen className="group">
                  <div className="relative">
                    <Collapsible.Trigger asChild>
                      <Button
                        variant="secondary"
                        className="w-full justify-start pl-8"
                      >
                        <Collapsible.TriggerIcon />
                        {group.label}
                      </Button>
                    </Collapsible.Trigger>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-0.5 top-0.5 size-6 px-0 cursor-grab active:cursor-grabbing text-muted-foreground"
                      {...dragHandleProps}
                    >
                      <IconGripVertical />
                    </Button>
                  </div>
                  <Collapsible.Content className="pt-4">
                    <FieldList
                      group={group}
                      renderField={renderField}
                      onReorderFields={reorderFields}
                    />
                  </Collapsible.Content>
                </Collapsible>
              )}
            </Sortable>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
