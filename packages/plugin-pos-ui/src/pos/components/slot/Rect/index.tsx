import React, { useState, useRef } from 'react';
import { getLength, getAngle, getCursor } from '../utils';
import StyledRect from './StyledRect';

export interface Styles {
  transform: {
    rotateAngle: number;
  };
  position: {
    centerX: number;
    centerY: number;
  };
  size: {
    width: number;
    height: number;
  };
  borderRadius: number;
  color: string;
  zIndex: number;
}

interface RectProps {
  styles: Styles;
  zoomable?: string;
  rotatable: boolean;
  onResizeStart?: () => void;
  onResize?: (
    deltaL: number,
    alpha: number,
    rect: Rect,
    type: string,
    isShiftKey: boolean
  ) => void;
  onResizeEnd?: () => void;
  onRotateStart?: () => void;
  onRotate?: (angle: number, startAngle: number) => void;
  onRotateEnd?: () => void;
  onDragStart?: () => void;
  onDrag?: (deltaX: number, deltaY: number) => void;
  onDragEnd?: () => void;
  parentRotateAngle: number;
  active: boolean;
}

interface Rect {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  rotateAngle: number;
}

const zoomableMap: { [key: string]: string } = {
  n: 't',
  s: 'b',
  e: 'r',
  w: 'l',
  ne: 'tr',
  nw: 'tl',
  se: 'br',
  sw: 'bl'
};

const Rect: React.FC<RectProps> = props => {
  const elementRef = useRef<any>(null);

  const startDrag = (e: React.MouseEvent) => {
    e.persist();
    let isMouseDown = true;
    const { clientX: startX, clientY: startY } = e;
    if (props.onDragStart) props.onDragStart();
    const onMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      e.stopImmediatePropagation();
      const { clientX, clientY } = e;
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      if (props.onDrag) props.onDrag(deltaX, deltaY);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (!isMouseDown) return;
      isMouseDown = false;
      if (props.onDragEnd) props.onDragEnd();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const startRotate = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    let isMouseDown = true;
    const { clientX, clientY } = e;
    const {
      styles: {
        transform: { rotateAngle: startAngle }
      }
    } = props;

    const rect = elementRef.current?.node?.getBoundingClientRect();

    const { left, width, top, height } = rect || {};
    const center = {
      x: (left || 0) + (width || 0) / 2,
      y: (top || 0) + (height || 0) / 2
    };
    const startVector = {
      x: clientX - center.x,
      y: clientY - center.y
    };

    if (props.onRotateStart) props.onRotateStart();
    const onMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      e.stopImmediatePropagation();
      const { clientX, clientY } = e;
      const rotateVector = {
        x: clientX - center.x,
        y: clientY - center.y
      };
      const angle = getAngle(startVector, rotateVector);
      if (props.onRotate) props.onRotate(angle, startAngle);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (!isMouseDown) return;
      isMouseDown = false;
      if (props.onRotateEnd) props.onRotateEnd();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const startResize = (e: React.MouseEvent, cursor: string) => {
    let isMouseDown = false;
    if (e.button !== 0) return;
    document.body.style.cursor = cursor;
    const {
      styles: {
        position: { centerX, centerY },
        size: { width, height },
        transform: { rotateAngle }
      }
    } = props;
    const { clientX: startX, clientY: startY } = e;
    const rect: Rect = { width, height, centerX, centerY, rotateAngle };
    const type =
      (e.currentTarget &&
        e.currentTarget.getAttribute('class')?.split(' ')[0]) ||
      '';
    if (props.onResizeStart) props.onResizeStart();

    isMouseDown = true;

    const onMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      e.stopImmediatePropagation();
      const { clientX, clientY } = e;
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      const alpha = Math.atan2(deltaY, deltaX);
      const deltaL = getLength(deltaX, deltaY);
      const isShiftKey = e.shiftKey;
      if (props.onResize) props.onResize(deltaL, alpha, rect, type, isShiftKey);
    };

    const onUp = () => {
      document.body.style.cursor = 'auto';
      document.removeEventListener('mousemove', () => setTimeout(onMove));
      document.removeEventListener('mouseup', () => setTimeout(onUp));
      if (!isMouseDown) return;
      isMouseDown = false;
      if (props.onResizeEnd) props.onResizeEnd();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const {
    styles: {
      position: { centerX, centerY },
      size: { width, height },
      transform: { rotateAngle },
      borderRadius,
      color,
      zIndex
    },
    zoomable,
    rotatable,
    parentRotateAngle,
    active
  } = props;

  const style = {
    width: Math.abs(width),
    height: Math.abs(height),
    transform: `rotate(${rotateAngle}deg)`,
    left: centerX - Math.abs(width) / 2,
    top: centerY - Math.abs(height) / 2,
    borderRadius: Number(borderRadius),
    background: color,
    zIndex
  };
  const direction = (zoomable || '')
    .split(',')
    .map(d => d.trim())
    .filter(d => d);

  return (
    <StyledRect
      ref={elementRef}
      onMouseDown={startDrag}
      className={'rect ' + (active ? 'rect-active' : '')}
      style={style}
    >
      {rotatable && (
        <div className="rotate" onMouseDown={startRotate}>
          <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.536 3.464A5 5 0 1 0 11 10l1.424 1.425a7 7 0 1 1-.475-9.374L13.659.34A.2.2 0 0 1 14 .483V5.5a.5.5 0 0 1-.5.5H8.483a.2.2 0 0 1-.142-.341l2.195-2.195z"
              fill={color}
              fillRule="nonzero"
            />
          </svg>
        </div>
      )}
      <div style={{ transform: `rotate(-${rotateAngle}deg)` }}>
        {props.children}
      </div>

      {direction.map(d => {
        const cursor = `${getCursor(
          rotateAngle + parentRotateAngle,
          d
        )}-resize`;
        return (
          <div
            key={d}
            style={{ cursor }}
            className={`${zoomableMap[d]} resizable-handler`}
            onMouseDown={e => startResize(e, cursor)}
          />
        );
      })}

      {direction.map(d => (
        <div key={d} className={`${zoomableMap[d]} square`} />
      ))}
    </StyledRect>
  );
};

export default Rect;
