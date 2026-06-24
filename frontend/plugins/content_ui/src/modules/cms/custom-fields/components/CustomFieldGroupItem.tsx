import { Button, Table, DropdownMenu, Collapsible, cn } from 'erxes-ui';
import {
  IconEdit,
  IconTrash,
  IconDots,
  IconPlus,
  IconGripVertical,
} from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
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
import {
  ICustomFieldGroup,
  ICustomField,
  FIELD_TYPES_OBJECT,
} from '../types/customFieldTypes';

interface CustomFieldGroupItemProps {
  group: ICustomFieldGroup;
  selectedGroupId: string | null;
  onSelectGroup: (group: ICustomFieldGroup) => void;
  onEditGroup: (group: ICustomFieldGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditField: (field: ICustomField) => void;
  onDeleteField: (fieldId: string) => void;
  onAddField: () => void;
  onReorderFields: (groupId: string, fields: ICustomField[]) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

function SortableFieldRow({
  field,
  onEditField,
  onDeleteField,
}: Readonly<{
  field: ICustomField;
  onEditField: (field: ICustomField) => void;
  onDeleteField: (fieldId: string) => void;
}>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field._id });

  const fieldTypeObject = FIELD_TYPES_OBJECT[field.type];

  return (
    <Table.Row
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('hover:bg-sidebar', isDragging && 'opacity-50')}
    >
      <Table.Cell className="w-8 p-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-full text-muted-foreground size-7 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <IconGripVertical />
        </Button>
      </Table.Cell>
      <Table.Cell>
        <Button
          variant="ghost"
          size="sm"
          className="h-full w-full justify-start hover:bg-transparent"
          asChild
        >
          <div>
            {fieldTypeObject?.icon}
            {field.label}
            {field.isRequired && <span className="text-destructive">*</span>}
          </div>
        </Button>
      </Table.Cell>
      <Table.Cell>
        <Button
          variant="ghost"
          size="sm"
          className="h-full w-full justify-start hover:bg-transparent text-muted-foreground"
          asChild
        >
          <div>{fieldTypeObject?.label || field.type}</div>
        </Button>
      </Table.Cell>
      <Table.Cell className="w-8 p-0.5">
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-full w-full text-muted-foreground size-7"
            >
              <IconDots />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="min-w-48">
            <DropdownMenu.Item onClick={() => onEditField(field)}>
              <IconEdit />
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="text-destructive"
              onClick={() => onDeleteField(field._id)}
            >
              <IconTrash />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </Table.Cell>
    </Table.Row>
  );
}

export function CustomFieldGroupItem({
  group,
  selectedGroupId,
  onSelectGroup,
  onEditGroup,
  onDeleteGroup,
  onEditField,
  onDeleteField,
  onAddField,
  onReorderFields,
  dragHandleProps,
}: CustomFieldGroupItemProps) {
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

  const handleFieldDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f._id === active.id);
    const newIndex = fields.findIndex((f) => f._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(fields, oldIndex, newIndex);
    setFields(next);
    onReorderFields(group._id, next);
  };

  return (
    <Collapsible
      key={group._id}
      className="group"
      defaultOpen={selectedGroupId === group._id}
      onOpenChange={(open) => open && onSelectGroup(group)}
    >
      <div className="relative">
        <Collapsible.Trigger asChild>
          <Button variant="secondary" className="w-full justify-start pl-8">
            <Collapsible.TriggerIcon />
            <span className="truncate leading-normal">{group.label}</span>
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
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-0.5 top-0.5 size-6 px-0"
            >
              <IconDots />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="min-w-48">
            <DropdownMenu.Item onClick={() => onEditGroup(group)}>
              <IconEdit />
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="text-destructive"
              onClick={() => onDeleteGroup(group._id)}
            >
              <IconTrash />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>

      <Collapsible.Content className="pt-2">
        <Table className="[&_tr_td]:border-b-0 [&_tr_td:first-child]:border-l-0 [&_tr_td]:border-r-0">
          <Table.Body>
            {fields.length === 0 ? (
              <Table.Row className="hover:bg-background">
                <Table.Cell
                  colSpan={4}
                  className="h-auto py-12 text-center text-muted-foreground"
                >
                  No fields found
                </Table.Cell>
              </Table.Row>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleFieldDragEnd}
              >
                <SortableContext
                  items={fields.map((f) => f._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {fields.map((field) => (
                    <SortableFieldRow
                      key={field._id}
                      field={field}
                      onEditField={onEditField}
                      onDeleteField={onDeleteField}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </Table.Body>
        </Table>
        <div className="flex items-center justify-end mt-2">
          <Button variant="secondary" onClick={onAddField}>
            <IconPlus />
            Add field
          </Button>
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
}
