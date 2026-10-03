import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildGroupRows, IField, MAX_PER_ROW } from 'ui-modules';
import { IFieldGroup } from '../types/Properties';
import { useFieldGroupEdit } from './useFieldGroupEdit';

const ROW_PREFIX = 'row:';

export const rowDropId = (index: number) => `${ROW_PREFIX}${index}`;

export const isRowDropId = (id: string) => id.startsWith(ROW_PREFIX);

export const useGroupLayoutEditor = ({
  group,
  fields,
  onSaved,
}: {
  group: IFieldGroup;
  fields: IField[];
  onSaved: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { editFieldGroup, loading } = useFieldGroupEdit();

  // Starts from what records show now, so every field is already placed.
  const [rows, setRows] = useState<string[][]>(() =>
    buildGroupRows(group, fields).map((row) =>
      row.fields.map((field) => field._id),
    ),
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveId(String(active.id));

  const handleDragCancel = () => setActiveId(null);

  const rowOf = (id: string) =>
    isRowDropId(id)
      ? Number(id.slice(ROW_PREFIX.length))
      : rows.findIndex((row) => row.includes(id));

  // Crossing into another row happens while dragging, so the target shows live.
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const from = rowOf(activeId);
    const to = rowOf(overId);

    if (from < 0 || to < 0 || from === to || rows[to].length >= MAX_PER_ROW) {
      return;
    }

    setRows((prev) => {
      const next = prev.map((row) => row.filter((id) => id !== activeId));
      const at = next[to].indexOf(overId);

      next[to].splice(at < 0 ? next[to].length : at, 0, activeId);

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
    const row = rowOf(activeId);

    if (row < 0 || row !== rowOf(overId)) {
      return;
    }

    setRows((prev) =>
      prev.map((ids, index) =>
        index === row && ids.includes(overId)
          ? arrayMove(ids, ids.indexOf(activeId), ids.indexOf(overId))
          : ids,
      ),
    );
  };

  const addRow = () => setRows((prev) => [...prev, []]);

  // Only an empty row can go; a filled one would drop its fields.
  const removeRow = (index: number) =>
    setRows((prev) =>
      prev[index]?.length ? prev : prev.filter((_, i) => i !== index),
    );

  const save = (layout?: string[][]) => {
    const rest = { ...group.configs };

    delete rest.layout;

    editFieldGroup({
      variables: {
        id: group._id,
        configs: layout ? { ...rest, layout } : rest,
      },
      refetchQueries: ['FieldGroups'],
      onCompleted: () => {
        toast({
          title: t('layout-saved', 'Layout saved'),
          variant: 'success',
        });
        onSaved();
      },
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return {
    rows,
    loading,
    activeId,
    handleDragStart,
    handleDragCancel,
    handleDragOver,
    handleDragEnd,
    addRow,
    removeRow,
    saveLayout: () => save(rows.filter((row) => row.length)),
    resetLayout: () => save(),
  };
};
