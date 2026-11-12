import type { PointerEvent } from 'react';
import { useRef, useState } from 'react';

export type BarcodeSize = Readonly<{ width: number; height: number }>;

export const BARCODE_DIMENSION_LIMITS = {
  width: { min: 80, max: 600 },
  height: { min: 30, max: 300 },
} as const;

const clamp = (value: number, limits: { min: number; max: number }) =>
  Math.min(limits.max, Math.max(limits.min, value));

/** Drag-to-resize: dragging right widens the barcode, dragging up makes it taller. */
export const useBarcodeResize = ({
  width,
  height,
  onResize,
}: {
  width: number;
  height: number;
  onResize: (size: BarcodeSize) => void;
}) => {
  const [dragSize, setDragSize] = useState<BarcodeSize | null>(null);
  const size = dragSize ?? { width, height };
  const dragStart = useRef<(BarcodeSize & { clientX: number; clientY: number }) | null>(null);

  const getResizedSize = (event: PointerEvent) => {
    const start = dragStart.current;

    if (!start) return size;

    return {
      width: clamp(start.width + event.clientX - start.clientX, BARCODE_DIMENSION_LIMITS.width),
      height: clamp(start.height + start.clientY - event.clientY, BARCODE_DIMENSION_LIMITS.height),
    };
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { ...size, clientX: event.clientX, clientY: event.clientY };
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragStart.current) setDragSize(getResizedSize(event));
  };

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragStart.current) return;

    const resized = getResizedSize(event);
    dragStart.current = null;
    onResize(resized);
    setDragSize(null);
  };

  const onPointerCancel = () => {
    dragStart.current = null;
    setDragSize(null);
  };

  return { size, resizeHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } };
};
