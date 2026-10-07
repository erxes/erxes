import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { MAX_PER_ROW } from 'ui-modules';

export interface ILayoutRow {
  // Stable while rows move, unlike their position.
  key: string;
  ids: string[];
}

const ROW_PREFIX = 'row:';

export const rowId = (key: string) => `${ROW_PREFIX}${key}`;

export const isRowId = (id: string) => id.startsWith(ROW_PREFIX);

const toRows = (layout: string[][]): ILayoutRow[] =>
  layout.map((ids) => ({ key: nanoid(), ids }));

// Rows of ids being arranged; saving is the caller's, so any layout can use it.
export const useLayoutEditor = ({
  initialRows,
  onSave,
}: {
  initialRows: string[][];
  onSave: (layout: string[][] | null) => void;
}) => {
  const [rows, setRows] = useState<ILayoutRow[]>(() => toRows(initialRows));

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveId(String(active.id));

  const handleDragCancel = () => setActiveId(null);

  const rowOf = (id: string) =>
    isRowId(id)
      ? rows.findIndex((row) => rowId(row.key) === id)
      : rows.findIndex((row) => row.ids.includes(id));

  // Crossing into another row happens while dragging, so the target shows live.
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const activeId = String(active.id);

    // A whole row only settles on drop.
    if (!over || isRowId(activeId)) {
      return;
    }

    const overId = String(over.id);
    const from = rowOf(activeId);
    const to = rowOf(overId);

    if (
      from < 0 ||
      to < 0 ||
      from === to ||
      rows[to].ids.length >= MAX_PER_ROW
    ) {
      return;
    }

    setRows((prev) => {
      const next = prev.map((row) => ({
        ...row,
        ids: row.ids.filter((id) => id !== activeId),
      }));
      const at = next[to].ids.indexOf(overId);

      next[to].ids.splice(at < 0 ? next[to].ids.length : at, 0, activeId);

      return next;
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (isRowId(activeId)) {
      const from = rowOf(activeId);
      const to = rowOf(overId);

      if (from >= 0 && to >= 0 && from !== to) {
        setRows((prev) => arrayMove(prev, from, to));
      }

      return;
    }

    const row = rowOf(activeId);

    if (row < 0 || row !== rowOf(overId)) {
      return;
    }

    setRows((prev) =>
      prev.map((current, index) =>
        index === row && current.ids.includes(overId)
          ? {
              ...current,
              ids: arrayMove(
                current.ids,
                current.ids.indexOf(activeId),
                current.ids.indexOf(overId),
              ),
            }
          : current,
      ),
    );
  };

  const addRow = () => setRows((prev) => [...prev, { key: nanoid(), ids: [] }]);

  // Only an empty row can go; a filled one would drop its fields.
  const removeRow = (key: string) =>
    setRows((prev) =>
      prev.filter((row) => row.key !== key || row.ids.length > 0),
    );

  return {
    rows,
    activeId,
    handleDragStart,
    handleDragCancel,
    handleDragOver,
    handleDragEnd,
    addRow,
    removeRow,
    saveLayout: () =>
      onSave(rows.map((row) => row.ids).filter((ids) => ids.length)),
    resetLayout: () => onSave(null),
  };
};
