import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { useSegment } from '../context/SegmentProvider';
import { TSegmentGroupNode } from '../types/segmentNode';
import { moveSegmentNode, slotOf } from '../utils/segmentTree';

export const INSIDE_SUFFIX = '::inside';

export const useSegmentTreeDnd = () => {
  const { form } = useSegment();
  const [version, setVersion] = useState(0);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const from = String(active.id);
    const overId = String(over.id);

    const to = overId.endsWith(INSIDE_SUFFIX)
      ? { parent: overId.slice(0, -INSIDE_SUFFIX.length), index: 0 }
      : slotOf(overId);

    if (!to) {
      return;
    }

    const next = moveSegmentNode(
      form.getValues('root') as TSegmentGroupNode,
      from,
      to,
    );

    if (!next) {
      return;
    }

    form.clearErrors('root');
    form.setValue('root', next, { shouldDirty: true });
    setVersion((current) => current + 1);
  };

  return { sensors, handleDragEnd, version };
};
