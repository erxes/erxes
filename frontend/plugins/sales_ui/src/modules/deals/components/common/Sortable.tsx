'use client';

import {
  Active,
  Announcements,
  CollisionDetection,
  DndContext,
  DragOverlay,
  DropAnimation,
  KeyboardCoordinateGetter,
  KeyboardSensor,
  MeasuringConfiguration,
  Modifiers,
  MouseSensor,
  PointerActivationConstraint,
  ScreenReaderInstructions,
  TouchSensor,
  UniqueIdentifier,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  AnimateLayoutChanges,
  NewIndexGetter,
  SortableContext,
  SortingStrategy,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import React, { useEffect, useRef, useState } from 'react';

import { IconFolderCancel } from '@tabler/icons-react';
import { Item } from './Item';
import { List } from './List';
import { createPortal } from 'react-dom';

export interface Props {
  readonly activationConstraint?: PointerActivationConstraint;
  readonly animateLayoutChanges?: AnimateLayoutChanges;
  readonly adjustScale?: boolean;
  readonly collisionDetection?: CollisionDetection;
  readonly coordinateGetter?: KeyboardCoordinateGetter;
  readonly Container?: any; // To-do: Fix me
  readonly dropAnimation?: DropAnimation | null;
  readonly getNewIndex?: NewIndexGetter;
  readonly handle?: boolean;
  readonly itemCount?: number;
  readonly items?: UniqueIdentifier[];
  readonly measuring?: MeasuringConfiguration;
  readonly modifiers?: Modifiers;
  readonly renderItem?: any;
  readonly removable?: boolean;
  readonly reorderItems?: (
    items: UniqueIdentifier[],
    oldIndex: number,
    newIndex: number,
  ) => UniqueIdentifier[];
  readonly strategy?: SortingStrategy;
  readonly style?: React.CSSProperties;
  readonly useDragOverlay?: boolean;
  getItemStyles?(args: {
    readonly id: UniqueIdentifier;
    readonly index: number;
    readonly isSorting: boolean;
    readonly isDragOverlay: boolean;
    readonly overIndex: number;
    readonly isDragging: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {
    readonly active: Pick<Active, 'id'> | null;
    readonly index: number;
    readonly isDragging: boolean;
    readonly id: UniqueIdentifier;
  }): React.CSSProperties;
  isDisabled?(id: UniqueIdentifier): boolean;
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable: `
    To pick up a sortable item, press the space bar.
    While sorting, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};

const defaultInitializer = (index: number) => index;

export function createRange<T = number>(
  length: number,
  initializer: (index: number) => any = defaultInitializer,
): T[] {
  return Array.from({ length }, (_, index) => initializer(index));
}

export function Sortable({
  activationConstraint,
  animateLayoutChanges,
  adjustScale = false,
  Container = List,
  collisionDetection = closestCenter,
  coordinateGetter = sortableKeyboardCoordinates,
  dropAnimation = dropAnimationConfig,
  getItemStyles = () => ({}),
  getNewIndex,
  handle = false,
  itemCount = 16,
  items: initialItems,
  isDisabled = () => false,
  measuring,
  modifiers,
  removable,
  renderItem,
  reorderItems = arrayMove,
  strategy = rectSortingStrategy,
  style,
  useDragOverlay = false,
  wrapperStyle = () => ({}),
}: Props) {
  const [items, setItems] = useState<UniqueIdentifier[]>(
    () =>
      initialItems ??
      createRange<UniqueIdentifier>(itemCount, (index) => index),
  );

  useEffect(() => {
    if (initialItems) {
      setItems((prevItems) => {
        const isChanged =
          initialItems.length !== prevItems.length ||
          initialItems.some((id, i) => id !== prevItems[i]);
        return isChanged ? initialItems : prevItems;
      });
    }
  }, [initialItems]);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint,
    }),
    useSensor(KeyboardSensor, {
      // Disable smooth scrolling in Cypress automated tests
      scrollBehavior: 'Cypress' in globalThis ? 'auto' : undefined,
      coordinateGetter,
    }),
  );
  const isFirstAnnouncement = useRef(true);
  const getIndex = (id: UniqueIdentifier) => items.indexOf(id);
  const getPosition = (id: UniqueIdentifier) => getIndex(id) + 1;
  const activeIndex = activeId == null ? -1 : getIndex(activeId);
  const handleRemove = removable
    ? (id: UniqueIdentifier) =>
        setItems((items) => items.filter((item) => item !== id))
    : undefined;
  const announcements: Announcements = {
    onDragStart({ active: { id } }) {
      return `Picked up sortable item ${String(
        id,
      )}. Sortable item ${id} is in position ${getPosition(id)} of ${
        items.length
      }`;
    },
    onDragOver({ active, over }) {
      // In this specific use-case, the picked up item's `id` is always the same as the first `over` id.
      // The first `onDragOver` event therefore doesn't need to be announced, because it is called
      // immediately after the `onDragStart` announcement and is redundant.
      if (isFirstAnnouncement.current === true) {
        isFirstAnnouncement.current = false;
        return;
      }

      if (over) {
        return `Sortable item ${
          active.id
        } was moved into position ${getPosition(over.id)} of ${items.length}`;
      }
    },
    onDragEnd({ active, over }) {
      if (over) {
        return `Sortable item ${
          active.id
        } was dropped at position ${getPosition(over.id)} of ${items.length}`;
      }
    },
    onDragCancel({ active: { id } }) {
      return `Sorting was cancelled. Sortable item ${id} was dropped and returned to position ${getPosition(
        id,
      )} of ${items.length}.`;
    },
  };

  useEffect(() => {
    if (activeId == null) {
      isFirstAnnouncement.current = true;
    }
  }, [activeId]);

  return (
    <DndContext
      accessibility={{
        announcements,
        screenReaderInstructions,
      }}
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={({ active }) => {
        if (!active) {
          return;
        }

        setActiveId(active.id);
      }}
      onDragEnd={({ active, over }) => {
        if (over) {
          const oldIndex = getIndex(active.id);
          const newIndex = getIndex(over.id);

          if (oldIndex !== newIndex) {
            setItems((items) => reorderItems(items, oldIndex, newIndex));
          }
        }

        setActiveId(null);
      }}
      onDragCancel={() => setActiveId(null)}
      measuring={measuring}
      modifiers={modifiers}
    >
      {items.length > 0 ? (
        <div style={style} className="flex w-full py-4 justify-center">
          <SortableContext items={items} strategy={strategy}>
            <Container>
              {items.map((value, index) => (
                <SortableItem
                  key={value}
                  id={value}
                  handle={handle}
                  index={index}
                  style={getItemStyles}
                  wrapperStyle={wrapperStyle}
                  disabled={isDisabled(value)}
                  renderItem={renderItem}
                  onRemove={handleRemove}
                  animateLayoutChanges={animateLayoutChanges}
                  useDragOverlay={useDragOverlay}
                  getNewIndex={getNewIndex}
                />
              ))}
            </Container>
          </SortableContext>
        </div>
      ) : (
        <div
          style={style}
          className="flex flex-col w-full py-4 h-48 justify-center items-center"
        >
          <IconFolderCancel />
          <p className="text-muted-foreground pt-2">No items found.</p>
        </div>
      )}
      {useDragOverlay
        ? createPortal(
            <DragOverlay
              adjustScale={adjustScale}
              dropAnimation={dropAnimation}
            >
              {activeId == null ? null : (
                <Item
                  value={items[activeIndex]}
                  handle={handle}
                  renderItem={renderItem}
                  wrapperStyle={wrapperStyle({
                    active: { id: activeId },
                    index: activeIndex,
                    isDragging: true,
                    id: items[activeIndex],
                  })}
                  style={getItemStyles({
                    id: items[activeIndex],
                    index: activeIndex,
                    isSorting: activeId !== null,
                    isDragging: true,
                    overIndex: -1,
                    isDragOverlay: true,
                  })}
                  dragOverlay
                />
              )}
            </DragOverlay>,
            document.body,
          )
        : null}
    </DndContext>
  );
}

interface SortableItemProps {
  readonly animateLayoutChanges?: AnimateLayoutChanges;
  readonly disabled?: boolean;
  readonly getNewIndex?: NewIndexGetter;
  readonly id: UniqueIdentifier;
  readonly index: number;
  readonly handle: boolean;
  readonly useDragOverlay?: boolean;
  onRemove?(id: UniqueIdentifier): void;
  readonly style: (values: any) => React.CSSProperties;
  readonly renderItem?: (args: any) => React.ReactElement;
  readonly wrapperStyle: Props['wrapperStyle'];
}

export function SortableItem({
  disabled,
  animateLayoutChanges,
  getNewIndex,
  handle,
  id,
  index,
  onRemove,
  style,
  renderItem,
  useDragOverlay,
  wrapperStyle,
}: SortableItemProps) {
  const {
    active,
    attributes,
    isDragging,
    isSorting,
    listeners,
    overIndex,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
    disabled,
    getNewIndex,
  });

  return (
    <Item
      ref={setNodeRef}
      value={id}
      disabled={disabled}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={
        handle
          ? {
              ref: setActivatorNodeRef,
            }
          : undefined
      }
      renderItem={renderItem}
      index={index}
      style={style({
        index,
        id,
        isDragging,
        isSorting,
        overIndex,
      })}
      onRemove={onRemove ? () => onRemove(id) : undefined}
      transform={transform}
      transition={transition}
      wrapperStyle={wrapperStyle?.({ index, isDragging, active, id })}
      listeners={listeners}
      data-index={index}
      data-id={id}
      dragOverlay={!useDragOverlay && isDragging}
      {...attributes}
    />
  );
}
