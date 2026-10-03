import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  pointerWithin,
  PointerSensor,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconPlus, IconX } from '@tabler/icons-react';
import { Button, cn, Sheet, Spinner } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { IField, useFields } from 'ui-modules';
import {
  isRowDropId,
  rowDropId,
  useGroupLayoutEditor,
} from '../hooks/useGroupLayoutEditor';
import { activeLayoutGroupState } from '../states/activeLayoutGroupState';
import { IFieldGroup } from '../types/Properties';

// Where the pointer is decides the row; nearest edge is only the fallback.
// A chip under the pointer beats its row, so a drop lands at that position.
const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  const chips = hits.filter(({ id }) => !isRowDropId(String(id)));

  if (chips.length) {
    return chips;
  }

  return hits.length ? hits : rectIntersection(args);
};

// Rows resize as chips move between them, so measure them every frame.
const MEASURING = { droppable: { strategy: MeasuringStrategy.Always } };

export const PropertyGroupLayoutSheet = () => {
  const [group, setGroup] = useAtom(activeLayoutGroupState);

  return (
    <Sheet open={!!group} onOpenChange={() => setGroup(null)}>
      <Sheet.View className="p-0">
        {group && (
          <GroupLayoutEditor group={group} onClose={() => setGroup(null)} />
        )}
      </Sheet.View>
    </Sheet>
  );
};

const GroupLayoutEditor = ({
  group,
  onClose,
}: {
  group: IFieldGroup;
  onClose: () => void;
}) => {
  const { fields, loading } = useFields({
    groupId: group._id,
    contentType: group.contentType,
  });

  if (loading) {
    return <Spinner containerClassName="py-12" />;
  }

  return <GroupLayoutRows group={group} fields={fields} onClose={onClose} />;
};

const GroupLayoutRows = ({
  group,
  fields,
  onClose,
}: {
  group: IFieldGroup;
  fields: IField[];
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const {
    rows,
    loading,
    activeId,
    handleDragStart,
    handleDragCancel,
    handleDragOver,
    handleDragEnd,
    addRow,
    removeRow,
    saveLayout,
    resetLayout,
  } = useGroupLayoutEditor({ group, fields, onSaved: onClose });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );
  const nameById = new Map(fields.map((field) => [field._id, field.name]));

  return (
    <>
      <Sheet.Header>
        <Sheet.Title>
          {t('layout', 'Layout')} — {group.name}
        </Sheet.Title>
        <Sheet.Description className="sr-only">
          {t(
            'layout-description',
            'Drag fields between rows. Fields in a row share its width, up to 4.',
          )}
        </Sheet.Description>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="flex flex-col gap-2 overflow-y-auto p-5">
        <p className="text-sm text-muted-foreground">
          {t(
            'layout-description',
            'Drag fields between rows. Fields in a row share its width, up to 4.',
          )}
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          measuring={MEASURING}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {rows.map((ids, index) => (
            <LayoutRow
              key={index}
              index={index}
              ids={ids}
              nameById={nameById}
              onRemove={() => removeRow(index)}
            />
          ))}
          <DragOverlay>
            {activeId && (
              <ChipBody
                label={nameById.get(activeId) ?? activeId}
                className="shadow-md"
              />
            )}
          </DragOverlay>
        </DndContext>
        <Button variant="secondary" className="self-start" onClick={addRow}>
          <IconPlus />
          {t('add-row', 'Add row')}
        </Button>
      </Sheet.Content>
      <Sheet.Footer>
        <Button
          variant="ghost"
          className="mr-auto"
          disabled={loading}
          onClick={resetLayout}
        >
          {t('reset-layout', 'Reset')}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={loading} onClick={saveLayout}>
          {t('save', 'Save')}
        </Button>
      </Sheet.Footer>
    </>
  );
};

const LayoutRow = ({
  index,
  ids,
  nameById,
  onRemove,
}: {
  index: number;
  ids: string[];
  nameById: Map<string, string>;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { setNodeRef, isOver } = useDroppable({ id: rowDropId(index) });

  return (
    <SortableContext items={ids} strategy={rectSortingStrategy}>
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-11 gap-2 rounded-md border border-dashed p-1.5',
          isOver && 'border-primary',
        )}
      >
        {ids.map((id) => (
          <LayoutChip key={id} id={id} label={nameById.get(id) ?? id} />
        ))}
        {!ids.length && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8 text-muted-foreground"
            title={t('remove-row', 'Remove row')}
            aria-label={t('remove-row', 'Remove row')}
            onClick={onRemove}
          >
            <IconX />
          </Button>
        )}
      </div>
    </SortableContext>
  );
};

const ChipBody = ({
  label,
  className,
}: {
  label: string;
  className?: string;
}) => (
  <div
    className={cn(
      'flex min-w-0 flex-1 cursor-grab items-center gap-1 rounded bg-muted px-2 py-1.5 text-sm',
      className,
    )}
  >
    <IconGripVertical className="size-3.5 shrink-0 text-muted-foreground" />
    <span className="truncate">{label}</span>
  </div>
);

// The dragged copy follows the pointer in the overlay; this stays as its placeholder.
const LayoutChip = ({ id, label }: { id: string; label: string }) => {
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
      className={cn('flex min-w-0 flex-1', isDragging && 'opacity-40')}
      {...attributes}
      {...listeners}
    >
      <ChipBody label={label} />
    </div>
  );
};
