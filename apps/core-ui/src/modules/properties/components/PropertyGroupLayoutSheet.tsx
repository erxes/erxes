import type { Field } from '@erxes/core-contract';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';
import { Button, cn, IconComponent, Sheet, Spinner } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FIELD_TYPES_OBJECT } from '../fieldTypes';
import { withOrders } from '../reorder';
import { activeLayoutGroupState } from '../states';
import { useReorder } from '../usePropertyMutations';

const LayoutItem = ({ field }: { field: Field }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const TypeIcon = FIELD_TYPES_OBJECT[field.type].icon;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-sm',
        isDragging && 'z-10 opacity-40',
        !field.isVisible && 'text-muted-foreground',
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        tone="muted"
        className="size-6 shrink-0 cursor-grab"
        {...attributes}
        {...listeners}
      >
        <IconGripVertical />
      </Button>
      {field.icon ? (
        <IconComponent name={field.icon} className="size-4 shrink-0 text-muted-foreground" />
      ) : (
        <TypeIcon className="size-4 shrink-0 text-muted-foreground" />
      )}
      <span className="truncate">{field.label}</span>
    </div>
  );
};

const GroupLayoutEditor = ({ fields, onClose }: { fields: Field[]; onClose: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [items, setItems] = useState(fields);
  const { mutate, isPending } = useReorder('fields', fields[0]?.contentType ?? 'customer');

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const from = current.findIndex((item) => item.id === active.id);
      const to = current.findIndex((item) => item.id === over.id);

      return from === -1 || to === -1 ? current : arrayMove(current, from, to);
    });
  };

  const save = () => {
    const { changed } = withOrders(fields, items);

    if (!changed.length) {
      onClose();

      return;
    }

    mutate(changed, { onSuccess: onClose });
  };

  return (
    <>
      <Sheet.Content className="overflow-y-auto">
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t('no-fields-found', 'No fields found')}
          </p>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-1">
                {items.map((field) => (
                  <LayoutItem key={field.id} field={field} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Sheet.Content>
      <Sheet.Footer>
        <Button type="button" variant="ghost" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={save} disabled={isPending || items.length === 0}>
          {isPending && <Spinner size="sm" />}
          {t('save', 'Save')}
        </Button>
      </Sheet.Footer>
    </>
  );
};

/** "Layout": the order fields of a group show in. */
export const PropertyGroupLayoutSheet = ({
  fieldsOf,
}: {
  fieldsOf: (groupId: string) => Field[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [group, setGroup] = useAtom(activeLayoutGroupState);
  const close = () => setGroup(null);

  return (
    <Sheet open={!!group} onOpenChange={(open) => !open && close()}>
      <Sheet.View className="flex flex-col">
        {group && (
          <>
            <Sheet.Header>
              <Sheet.Title>
                {t('layout', 'Layout')} — {group.name}
              </Sheet.Title>
              <Sheet.Description className="sr-only">{t('layout', 'Layout')}</Sheet.Description>
              <Sheet.Close />
            </Sheet.Header>
            <GroupLayoutEditor key={group.id} fields={fieldsOf(group.id)} onClose={close} />
          </>
        )}
      </Sheet.View>
    </Sheet>
  );
};
