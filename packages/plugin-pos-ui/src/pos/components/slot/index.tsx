import React, { useCallback } from 'react';
import Rect from './Rect';
import { centerToTL, tLToCenter, getNewStyle, degToRadian } from './utils';

interface ResizableRectProps {
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  zIndex: number;
  rotatable?: boolean;
  rotateAngle?: number;
  parentRotateAngle?: number;
  zoomable?: string;
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: number | boolean;
  onRotateStart?: () => void;
  onRotate?: (rotateAngle: number) => void;
  onRotateEnd?: () => void;
  onResizeStart?: () => void;
  onResize?: (style: {
    top: number;
    left: number;
    width: number;
    height: number;
  }) => void;
  onResizeEnd?: () => void;
  onDragStart?: () => void;
  onDrag?: (deltaX: number, deltaY: number) => void;
  onDragEnd?: () => void;
  borderRadius?: number;
  active: boolean;
}

const ResizableRect: React.FC<ResizableRectProps> = ({
  top,
  left,
  width,
  height,
  color,
  zIndex,
  rotateAngle = 0,
  borderRadius = 0,
  parentRotateAngle = 0,
  zoomable,
  rotatable,
  onRotate,
  onResizeStart,
  onResize,
  onResizeEnd,
  onRotateStart,
  onRotateEnd,
  onDragStart,
  onDrag,
  onDragEnd,
  aspectRatio = 0,
  minHeight = 0,
  minWidth = 0,
  active,
  children
}) => {
  const handleRotate = useCallback(
    (angle: number, startAngle: number) => {
      if (!onRotate) return;
      let rotateAngle = Math.round(startAngle + angle);
      if (rotateAngle >= 360) {
        rotateAngle -= 360;
      } else if (rotateAngle < 0) {
        rotateAngle += 360;
      }
      if (rotateAngle > 356 || rotateAngle < 4) {
        rotateAngle = 0;
      } else if (rotateAngle > 86 && rotateAngle < 94) {
        rotateAngle = 90;
      } else if (rotateAngle > 176 && rotateAngle < 184) {
        rotateAngle = 180;
      } else if (rotateAngle > 266 && rotateAngle < 274) {
        rotateAngle = 270;
      }
      onRotate(rotateAngle);
    },
    [onRotate]
  );

  const handleDrag = useCallback(
    (deltaX: number, deltaY: number) => {
      if (onDrag) onDrag(deltaX, deltaY);
    },
    [onDrag]
  );

  const handleResize = useCallback(
    (
      length: number,
      alpha: number,
      rect: Rect,
      type: string,
      isShiftKey: boolean
    ) => {
      if (!onResize) return;

      const beta = alpha - degToRadian(rotateAngle + parentRotateAngle);
      const deltaW = length * Math.cos(beta);
      const deltaH = length * Math.sin(beta);
      const ratio =
        isShiftKey && !aspectRatio ? rect.width / rect.height : aspectRatio;
      const {
        position: { centerX, centerY },
        size: { width, height }
      } = getNewStyle(
        type,
        { ...rect, rotateAngle },
        deltaW,
        deltaH,
        ratio,
        minWidth,
        minHeight
      );

      onResize(centerToTL({ centerX, centerY, width, height, rotateAngle }));
    },
    [onResize]
  );

  const styles = tLToCenter({
    top,
    left,
    width,
    height,
    rotateAngle,
    borderRadius,
    color,
    zIndex
  });

  return (
    <Rect
      styles={styles}
      zoomable={zoomable}
      rotatable={Boolean(rotatable && onRotate)}
      parentRotateAngle={parentRotateAngle}
      onResizeStart={onResizeStart}
      onResizeEnd={onResizeEnd}
      onRotateStart={onRotateStart}
      onRotate={handleRotate}
      onRotateEnd={onRotateEnd}
      onDragStart={onDragStart}
      onDrag={handleDrag}
      onDragEnd={onDragEnd}
      onResize={handleResize}
      active={active}
    >
      {children}
    </Rect>
  );
};

export default ResizableRect;
