import {
  CollisionDetection,
  DataRef,
  DragEndEvent,
  DragStartEvent,
  pointerWithin,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useStructureWorkspace } from '../contexts/StructureWorkspaceContext';
import {
  resolveStructureDrop,
  TStructureDragItem,
} from '../utils/structureDrop';
import { useStructureEntityMove } from './useStructureEntityMove';
import { useStructurePersonDrop } from './useStructurePersonDrop';

const STRUCTURE_DROP_PREFIX = 'drop:';

const STRUCTURE_DROP_BLOCKER = 'data-structure-drop-blocker';

export const STRUCTURE_DROP_BLOCKER_PROPS = { [STRUCTURE_DROP_BLOCKER]: '' };

export const structureCollisionDetection: CollisionDetection = (args) => {
  const pointer = args.pointerCoordinates;

  if (!pointer) {
    return [];
  }

  const blocked = Array.from(
    document.querySelectorAll(`[${STRUCTURE_DROP_BLOCKER}]`),
  ).some((element) => {
    const { left, right, top, bottom } = element.getBoundingClientRect();

    return (
      pointer.x >= left &&
      pointer.x <= right &&
      pointer.y >= top &&
      pointer.y <= bottom
    );
  });

  return blocked ? [] : pointerWithin(args);
};

export const toStructureDropId = (entityId: string) =>
  `${STRUCTURE_DROP_PREFIX}${entityId}`;

const fromStructureDropId = (id?: UniqueIdentifier) => {
  const value = id === undefined ? '' : String(id);

  return value.startsWith(STRUCTURE_DROP_PREFIX)
    ? value.slice(STRUCTURE_DROP_PREFIX.length)
    : undefined;
};

const readStructureDragItem = (data: DataRef): TStructureDragItem | undefined =>
  data.current?.item;

const isAltPressed = (event: Event | null) =>
  event instanceof MouseEvent || event instanceof KeyboardEvent
    ? event.altKey
    : false;

export const useStructureDnd = () => {
  const { entitiesById, expand } = useStructureWorkspace();
  const moveEntity = useStructureEntityMove();
  const dropPerson = useStructurePersonDrop();
  const [activeItem, setActiveItem] = useState<TStructureDragItem | null>(null);
  const [copy, setCopy] = useState(false);
  const copyRef = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const trackCopy = useCallback((next: boolean) => {
    copyRef.current = next;
    setCopy(next);
  }, []);

  useEffect(() => {
    if (!activeItem) {
      return;
    }

    const update = (event: KeyboardEvent | PointerEvent) =>
      trackCopy(event.altKey);

    window.addEventListener('keydown', update);
    window.addEventListener('keyup', update);
    window.addEventListener('pointermove', update);

    return () => {
      window.removeEventListener('keydown', update);
      window.removeEventListener('keyup', update);
      window.removeEventListener('pointermove', update);
    };
  }, [activeItem, trackCopy]);

  const reset = () => {
    setActiveItem(null);
    trackCopy(false);
  };

  const onDragStart = ({ active, activatorEvent }: DragStartEvent) => {
    setActiveItem(readStructureDragItem(active.data) ?? null);
    trackCopy(isAltPressed(activatorEvent));
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const item = readStructureDragItem(active.data);
    const targetId = fromStructureDropId(over?.id);
    const target = targetId ? entitiesById.get(targetId) : undefined;
    const copyDrop = copyRef.current;

    reset();

    if (!item || !target) {
      return;
    }

    const result = resolveStructureDrop({
      item,
      target,
      copy: copyDrop,
    });

    if (result.kind === 'move-entity' && item.kind === 'entity') {
      expand(target._id);
      void moveEntity(item.entity, target);
    }

    if (result.kind === 'person' && item.kind === 'person') {
      void dropPerson(result.plan, item.person, target);
    }
  };

  return {
    sensors,
    activeItem,
    copy,
    onDragStart,
    onDragEnd,
    onDragCancel: reset,
  };
};
