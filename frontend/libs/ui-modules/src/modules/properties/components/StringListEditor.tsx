import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconPlus, IconX } from '@tabler/icons-react';
import { Button, cn, Input } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';

type ListItem = {
  id: string;
  text: string;
};

let itemIdCounter = 0;

const toItems = (values: string[]): ListItem[] =>
  values.map((text) => ({ id: `string-list-${++itemIdCounter}`, text }));

const SortableRow = ({
  item,
  onEdit,
  onRemove,
}: {
  item: ListItem;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const [isEditing, setIsEditing] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing]);

  const commit = (text: string) => {
    setIsEditing(false);

    if (text.trim().length === 0 || text === item.text) {
      return;
    }

    onEdit(item.id, text.trim());
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'flex items-center gap-1 rounded-sm px-1 py-0.5 hover:bg-muted/50',
        isDragging && 'bg-muted opacity-50',
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex flex-none cursor-grab items-center text-muted-foreground active:cursor-grabbing"
      >
        <IconGripVertical size={14} />
      </div>

      {isEditing ? (
        <Input
          ref={editInputRef}
          className="h-6 flex-auto"
          defaultValue={item.text}
          onBlur={(e) => commit(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit(e.currentTarget.value);
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 flex-auto justify-start truncate px-1 text-sm font-normal"
          onDoubleClick={() => setIsEditing(true)}
          title={item.text}
        >
          {item.text}
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="size-5 flex-none text-muted-foreground"
        onClick={() => onRemove(item.id)}
      >
        <IconX className="size-3.5" />
      </Button>
    </div>
  );
};

export const StringListEditor = ({
  value,
  onChange,
  emptyMessage = 'No values yet',
  addButtonLabel = 'Add a value',
}: {
  value: string[];
  onChange: (value: string[]) => void;
  emptyMessage?: string;
  addButtonLabel?: string;
}) => {
  const [items, setItems] = useState<ListItem[]>(() => toItems(value));
  const [isAdding, setIsAdding] = useState(false);
  const lastEmitted = useRef<string[]>(value);
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) {
      addInputRef.current?.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    const isOwnEmit =
      lastEmitted.current.length === value.length &&
      lastEmitted.current.every((text, index) => text === value[index]);

    if (!isOwnEmit) {
      setItems(toItems(value));
      lastEmitted.current = value;
    }
  }, [value]);

  const apply = (nextItems: ListItem[]) => {
    const texts = nextItems.map((item) => item.text);

    setItems(nextItems);
    lastEmitted.current = texts;
    onChange(texts);
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    apply(arrayMove(items, oldIndex, newIndex));
  };

  const handleAdd = (text: string) => {
    if (text.trim().length === 0) {
      return;
    }

    apply([
      ...items,
      { id: `string-list-${++itemIdCounter}`, text: text.trim() },
    ]);
  };

  return (
    <div className="flex w-full flex-col gap-1">
      {items.length === 0 && !isAdding && (
        <span className="px-1 py-0.5 text-sm text-muted-foreground">
          {emptyMessage}
        </span>
      )}

      <DndContext
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableRow
              key={item.id}
              item={item}
              onEdit={(id, text) =>
                apply(items.map((i) => (i.id === id ? { ...i, text } : i)))
              }
              onRemove={(id) => apply(items.filter((i) => i.id !== id))}
            />
          ))}
        </SortableContext>
      </DndContext>

      {isAdding ? (
        <Input
          ref={addInputRef}
          className="h-6"
          placeholder={addButtonLabel}
          onBlur={(e) => {
            handleAdd(e.currentTarget.value);
            setIsAdding(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd(e.currentTarget.value);
              e.currentTarget.value = '';
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              setIsAdding(false);
            }
          }}
        />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => setIsAdding(true)}
        >
          <IconPlus className="size-3.5" />
          {addButtonLabel}
        </Button>
      )}
    </div>
  );
};
