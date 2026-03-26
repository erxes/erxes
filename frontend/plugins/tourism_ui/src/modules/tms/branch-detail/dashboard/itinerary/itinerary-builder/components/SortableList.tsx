import { useState, useRef, useCallback, type DragEvent } from 'react';
import { IconGripVertical } from '@tabler/icons-react';

export interface SortableItem {
  id: string;
}

interface SortableListProps<T extends SortableItem> {
  items: T[];
  onReorder: (reorderedItems: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T) => string;
}

export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
  keyExtractor = (item) => item.id,
}: SortableListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragCounter = useRef<Map<number, number>>(new Map());

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, index: number) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
      setDragIndex(index);
    },
    [],
  );

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      const count = (dragCounter.current.get(index) || 0) + 1;
      dragCounter.current.set(index, count);
      if (count === 1) {
        setOverIndex(index);
      }
    },
    [],
  );

  const handleDragLeave = useCallback(
    (_e: DragEvent<HTMLDivElement>, index: number) => {
      const count = (dragCounter.current.get(index) || 1) - 1;
      dragCounter.current.set(index, count);
      if (count <= 0) {
        dragCounter.current.delete(index);
        setOverIndex((prev) => (prev === index ? null : prev));
      }
    },
    [],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, targetIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current.clear();

      if (dragIndex === null || dragIndex === targetIndex) {
        setDragIndex(null);
        setOverIndex(null);
        return;
      }

      const updated = [...items];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(targetIndex, 0, moved);

      onReorder(updated);
      setDragIndex(null);
      setOverIndex(null);
    },
    [dragIndex, items, onReorder],
  );

  const handleDragEnd = useCallback(() => {
    dragCounter.current.clear();
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-2 w-full">
      {items.map((item, index) => {
        const isDragging = dragIndex === index;
        const isOver = overIndex === index && dragIndex !== index;

        return (
          <div
            key={keyExtractor(item)}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={(e) => handleDragLeave(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={[
              'flex gap-2 items-center px-3 py-2 rounded-md border transition-all group',
              isDragging ? 'opacity-40 scale-[0.98]' : '',
              isOver
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0">
              <IconGripVertical size={16} />
            </div>

            <div className="flex-1 min-w-0">{renderItem(item, index)}</div>
          </div>
        );
      })}
    </div>
  );
}
