'use client';

import { cn } from 'erxes-ui';
import type React from 'react';
import { useState, useRef, useEffect } from 'react';

type Position = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type ResizeHandlePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left';

interface ResizableNodeProps {
  initialPosition?: Position;
  initialSize?: Size;
  minWidth?: number;
  minHeight?: number;
  className?: string;
  children?: React.ReactNode;
  title?: string;
  onPositionChange?: (position: Position) => void;
  onSizeChange?: (size: Size) => void;
  color?: string;
  disabled?: boolean;
  rounded?: boolean;
  rotateAngle?: number;
  zIndex?: number;
  id?: string;
  selected?: boolean;
}

export function ResizableNode({
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 200, height: 150 },
  minWidth = 100,
  minHeight = 80,
  className,
  children,
  title = 'Node',
  onPositionChange,
  onSizeChange,
  color = '#5E5CFF',
  disabled = false,
  rounded = false,
  rotateAngle = 0,
  zIndex = 0,
  id,
  selected = false,
}: ResizableNodeProps) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>(initialSize);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeHandlePosition | null>(
    null,
  );
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const onPositionChangeRef = useRef(onPositionChange);
  const onSizeChangeRef = useRef(onSizeChange);

  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  useEffect(() => {
    onSizeChangeRef.current = onSizeChange;
  }, [onSizeChange]);

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  useEffect(() => {
    setSize(initialSize);
  }, [initialSize]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (
      e.target === nodeRef.current ||
      (e.target as HTMLElement).classList.contains('drag-handle')
    ) {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const handleResizeStart = (
    e: React.MouseEvent,
    position: ResizeHandlePosition,
  ) => {
    if (disabled) return;
    e.stopPropagation();
    setIsResizing(position);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  useEffect(() => {
    if (disabled) {
      setIsDragging(false);
      setIsResizing(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        };
        setPosition(newPosition);
        onPositionChangeRef.current?.(newPosition);
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.current.x;
        const deltaY = e.clientY - resizeStart.current.y;

        let newWidth = resizeStart.current.width;
        let newHeight = resizeStart.current.height;
        let newX = position.x;
        let newY = position.y;

        switch (isResizing) {
          case 'right':
            newWidth = Math.max(resizeStart.current.width + deltaX, minWidth);
            break;
          case 'bottom':
            newHeight = Math.max(
              resizeStart.current.height + deltaY,
              minHeight,
            );
            break;
          case 'left':
            newWidth = Math.max(resizeStart.current.width - deltaX, minWidth);
            if (newWidth !== resizeStart.current.width) {
              newX = position.x + (resizeStart.current.width - newWidth);
            }
            break;
          case 'top':
            newHeight = Math.max(
              resizeStart.current.height - deltaY,
              minHeight,
            );
            if (newHeight !== resizeStart.current.height) {
              newY = position.y + (resizeStart.current.height - newHeight);
            }
            break;
          case 'bottom-right':
            newWidth = Math.max(resizeStart.current.width + deltaX, minWidth);
            newHeight = Math.max(
              resizeStart.current.height + deltaY,
              minHeight,
            );
            break;
          case 'bottom-left':
            newWidth = Math.max(resizeStart.current.width - deltaX, minWidth);
            newHeight = Math.max(
              resizeStart.current.height + deltaY,
              minHeight,
            );
            if (newWidth !== resizeStart.current.width) {
              newX = position.x + (resizeStart.current.width - newWidth);
            }
            break;
          case 'top-right':
            newWidth = Math.max(resizeStart.current.width + deltaX, minWidth);
            newHeight = Math.max(
              resizeStart.current.height - deltaY,
              minHeight,
            );
            if (newHeight !== resizeStart.current.height) {
              newY = position.y + (resizeStart.current.height - newHeight);
            }
            break;
          case 'top-left':
            newWidth = Math.max(resizeStart.current.width - deltaX, minWidth);
            newHeight = Math.max(
              resizeStart.current.height - deltaY,
              minHeight,
            );
            if (newWidth !== resizeStart.current.width) {
              newX = position.x + (resizeStart.current.width - newWidth);
            }
            if (newHeight !== resizeStart.current.height) {
              newY = position.y + (resizeStart.current.height - newHeight);
            }
            break;
        }

        const newSize = { width: newWidth, height: newHeight };
        setSize(newSize);
        setPosition({ x: newX, y: newY });
        onSizeChangeRef.current?.(newSize);
        onPositionChangeRef.current?.({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    position,
    resizeStart,
    minWidth,
    minHeight,
    disabled,
  ]);

  const borderRadius = rounded ? 'rounded-full' : 'rounded-md';

  return (
    <div
      ref={nodeRef}
      className={cn(
        'absolute bg-white border border-gray-200 overflow-hidden',
        borderRadius,
        isDragging && 'cursor-grabbing',
        !isDragging && !isResizing && 'cursor-grab',
        selected && 'ring-2 ring-white ring-opacity-80 shadow-lg',
        disabled && 'opacity-50',
        className,
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: `rotate(${rotateAngle}deg)`,
        zIndex: zIndex,
        backgroundColor: color,
      }}
      onMouseDown={handleMouseDown}
      aria-disabled={disabled}
      data-id={id}
    >
      <div className="flex justify-between items-center px-3 h-8 bg-gray-100 border-b border-gray-200 drag-handle">
        <div className="text-sm font-medium truncate">{title}</div>
      </div>

      <div className="p-3 h-[calc(100%-2rem)] overflow-auto">{children}</div>

      {selected && !disabled && (
        <>
          <div
            className="absolute top-0 right-0 bottom-0 w-1 cursor-ew-resize"
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
          <div
            className="absolute right-0 bottom-0 left-0 h-1 cursor-ns-resize"
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
          <div
            className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize"
            onMouseDown={(e) => handleResizeStart(e, 'left')}
          />
          <div
            className="absolute top-0 right-0 left-0 h-1 cursor-ns-resize"
            onMouseDown={(e) => handleResizeStart(e, 'top')}
          />

          <div
            className="absolute right-0 bottom-0 z-10 w-3 h-3 bg-white rounded-sm border border-gray-300 cursor-nwse-resize"
            onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
          />
          <div
            className="absolute bottom-0 left-0 z-10 w-3 h-3 bg-white rounded-sm border border-gray-300 cursor-nesw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
          />
          <div
            className="absolute top-0 right-0 z-10 w-3 h-3 bg-white rounded-sm border border-gray-300 cursor-nesw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'top-right')}
          />
          <div
            className="absolute top-0 left-0 z-10 w-3 h-3 bg-white rounded-sm border border-gray-300 cursor-nwse-resize"
            onMouseDown={(e) => handleResizeStart(e, 'top-left')}
          />
        </>
      )}
    </div>
  );
}
