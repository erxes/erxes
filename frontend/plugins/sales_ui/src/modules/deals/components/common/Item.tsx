import React, { useEffect } from 'react';

import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';

export interface SortableItemProps {
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: any;
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  value: React.ReactNode;
  onRemove?(): void;
  renderItem?(args: {
    dragOverlay: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number | undefined;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    style: React.CSSProperties | undefined;
    transform: SortableItemProps['transform'];
    transition: SortableItemProps['transition'];
    value: SortableItemProps['value'];
    handle: SortableItemProps['handle'];
    wrapperStyle?: React.CSSProperties;
    color?: string;
  }): React.ReactElement;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, SortableItemProps>(
    (
      {
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        height,
        index,
        listeners,
        onRemove,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        ...props
      },
      ref,
    ) => {
      useEffect(() => {
        if (!dragOverlay) return;
        document.body.style.cursor = 'grabbing';
        return () => {
          document.body.style.cursor = '';
        };
      }, [dragOverlay]);

      return renderItem ? (
        <li ref={ref}>
          {renderItem({
            dragOverlay: Boolean(dragOverlay),
            dragging: Boolean(dragging),
            sorting: Boolean(sorting),
            index,
            fadeIn: Boolean(fadeIn),
            listeners,
            style,
            transform,
            transition,
            value,
            handle,
            wrapperStyle,
            color,
          })}
        </li>
      ) : (
        <li
          ref={ref}
          className={`
            flex box-border origin-top-left touch-manipulation
            ${fadeIn ? 'animate-fadeIn' : ''}
            ${dragOverlay ? 'z-[999]' : ''}
          `}
          style={
            {
              ...wrapperStyle,
              transition: [transition, wrapperStyle?.transition]
                .filter(Boolean)
                .join(', '),
              '--translate-x': transform
                ? `${Math.round(transform.x)}px`
                : undefined,
              '--translate-y': transform
                ? `${Math.round(transform.y)}px`
                : undefined,
              '--scale-x': transform?.scaleX
                ? `${transform.scaleX}`
                : undefined,
              '--scale-y': transform?.scaleY
                ? `${transform.scaleY}`
                : undefined,
              '--index': index,
              '--color': color,
            } as React.CSSProperties
          }
        >
          <div
            className={`
              relative flex flex-grow items-center
              px-5 py-[18px] bg-white rounded shadow-md
              list-none select-none
              text-gray-800 font-normal text-base
              whitespace-nowrap
              transition-shadow duration-200 ease-out
              ${!handle ? 'cursor-grab touch-manipulation' : ''}
              ${dragging && !dragOverlay ? 'opacity-50' : 'opacity-100'}
              ${disabled ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : ''}
              ${dragOverlay ? 'cursor-default shadow-lg' : ''}
            `}
            style={style}
            data-cypress="draggable-item"
            {...props}
          >
            {/* Left color bar */}
            {color && (
              <span
                className="absolute top-1/2 left-0 h-full w-[3px] -translate-y-1/2 rounded-l-sm"
                style={{ backgroundColor: color }}
              />
            )}

            {/* 
              ⬇️ FIX: wrap the value in a div with `pointer-events-auto`
              so inputs/selects inside remain interactive.
              Drag listeners are only applied to the container, not inputs.
            */}
            <div
              className="flex-1 pointer-events-auto"
              {...(!handle ? listeners : undefined)}
              tabIndex={!handle ? 0 : undefined}
            >
              {value}
            </div>
          </div>
        </li>
      );
    },
  ),
);
